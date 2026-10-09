import { Router } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { registerSchema } from "../validators/auth.validator.js";
import { hashPassword } from "../utils/password.js";

import { action } from "../utils/route-action.js";

const id = (value: unknown) => z.coerce.number().int().positive().parse(value);
const safeUser = { id: true, firstName: true, lastName: true, email: true, isActive: true, role: true, createdAt: true, updatedAt: true } as const;
const roleSchema = z.enum([ROLES.ADMIN, ROLES.MODERATOR, ROLES.RESTAURANT_OWNER, ROLES.CUSTOMER]);
const createUserSchema = registerSchema.extend({ role: roleSchema });
const updateUserSchema = registerSchema.omit({ password: true }).partial().extend({ role: roleSchema.optional(), isActive: z.boolean().optional() }).strict();
const pageSchema = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().min(1).max(100).default(25) });
const admin = Router();
admin.use(authenticate, authorizeRoles(ROLES.ADMIN));
admin.get("/roles", action(async (_req, res) => { res.json({ success: true, data: await prisma.role.findMany({ where: { isActive: true } }) }); }));
admin.get("/users", action(async (req, res) => {
  const { page, limit } = pageSchema.parse(req.query);
  const [data, total] = await Promise.all([prisma.user.findMany({ select: safeUser, orderBy: { id: "asc" }, skip: (page - 1) * limit, take: limit }), prisma.user.count()]);
  res.json({ success: true, data, pagination: { page, limit, total } });
}));
admin.get("/users/:id", action(async (req, res) => { res.json({ success: true, data: await prisma.user.findUniqueOrThrow({ where: { id: id(req.params.id) }, select: safeUser }) }); }));
admin.post("/users", action(async (req, res) => {
  const data = createUserSchema.parse(req.body);
  const role = await prisma.role.findFirst({ where: { roleName: data.role, isActive: true } });
  if (!role) { res.status(400).json({ success: false, message: "Role unavailable" }); return; }
  const user = await prisma.user.create({ data: { firstName: data.firstName.trim(), lastName: data.lastName.trim(), email: data.email.trim().toLowerCase(), passwordHash: await hashPassword(data.password), roleId: role.id }, select: safeUser });
  res.status(201).json({ success: true, data: user });
}));
admin.patch("/users/:id", action(async (req, res) => {
  const userId = id(req.params.id);
  const data = updateUserSchema.parse(req.body);
  if (userId === req.user!.userId && (data.isActive === false || (data.role && data.role !== ROLES.ADMIN))) {
    res.status(409).json({ success: false, message: "Cannot deactivate or demote your own administrator account" }); return;
  }
  if (data.role && data.role !== ROLES.RESTAURANT_OWNER && await prisma.restaurant.count({ where: { ownerId: userId } })) {
    res.status(409).json({ success: false, message: "Reassign owned restaurants before changing this user's role" }); return;
  }
  const role = data.role ? await prisma.role.findFirst({ where: { roleName: data.role, isActive: true } }) : undefined;
  if (data.role && !role) { res.status(400).json({ success: false, message: "Role unavailable" }); return; }
  res.json({ success: true, data: await prisma.user.update({ where: { id: userId }, data: {
    firstName: data.firstName?.trim(), lastName: data.lastName?.trim(), email: data.email?.trim().toLowerCase(), isActive: data.isActive, roleId: role?.id,
  }, select: safeUser }) });
}));
admin.get("/restaurants", action(async (req, res) => {
  const { page, limit } = pageSchema.parse(req.query);
  const [data, total] = await Promise.all([prisma.restaurant.findMany({ include: { owner: { select: safeUser } }, orderBy: { id: "asc" }, skip: (page - 1) * limit, take: limit }), prisma.restaurant.count()]);
  res.json({ success: true, data, pagination: { page, limit, total } });
}));
admin.patch("/restaurants/:id/owner", action(async (req, res) => {
  const { ownerId } = z.object({ ownerId: z.number().int().positive() }).strict().parse(req.body);
  const owner = await prisma.user.findUnique({ where: { id: ownerId }, include: { role: true } });
  if (!owner || !owner.isActive || !owner.role.isActive || owner.role.roleName !== ROLES.RESTAURANT_OWNER) {
    res.status(400).json({ success: false, message: "An active restaurant owner is required" }); return;
  }
  res.json({ success: true, data: await prisma.restaurant.update({ where: { id: id(req.params.id) }, data: { ownerId } }) });
}));
admin.patch("/restaurants/:id/status", action(async (req, res) => {
  const { status } = z.object({ status: z.enum(["ACTIVE", "INACTIVE"]) }).strict().parse(req.body);
  res.json({ success: true, data: await prisma.restaurant.update({ where: { id: id(req.params.id) }, data: { status } }) });
}));
admin.get("/overview", action(async (_req, res) => {
  const [users, restaurants, reviews, comments] = await Promise.all([prisma.user.count(), prisma.restaurant.count(), prisma.review.count(), prisma.reviewComment.count()]);
  res.json({ success: true, data: { users, restaurants, reviews, comments } });
}));
export default admin;

export const accountRoutes = Router();
accountRoutes.use(authenticate);
accountRoutes.get("/reviews", authorizeRoles(ROLES.CUSTOMER), action(async (req, res) => {
  res.json({ success: true, data: await prisma.review.findMany({ where: { userId: req.user!.userId }, include: { ratings: { include: { ratingType: true } }, restaurant: true, menuItem: true }, orderBy: { createdAt: "desc" } }) });
}));
accountRoutes.get("/restaurants", authorizeRoles(ROLES.RESTAURANT_OWNER), action(async (req, res) => {
  res.json({ success: true, data: await prisma.restaurant.findMany({ where: { ownerId: req.user!.userId }, include: { menuCategories: true, menuItems: true, images: true }, orderBy: { name: "asc" } }) });
}));
