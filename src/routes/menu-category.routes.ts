import { Router } from "express";
import { updateMenuCategory } from "../controllers/menu-category.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";

import prisma from "../config/prisma.js";
import { z } from "zod";
import { action } from "../utils/route-action.js";

const router = Router();
router.delete("/:id", authenticate, authorizeRoles(ROLES.RESTAURANT_OWNER), action(async (req, res) => {
  const resourceId = z.coerce.number().int().positive().parse(req.params.id);
  const resource = await prisma.menuCategory.findUniqueOrThrow({ where: { id: resourceId }, include: { restaurant: true, _count: { select: { menuItems: true } } } });
  if (resource.restaurant.ownerId !== req.user!.userId) { res.status(403).json({ success: false, message: "Restaurant ownership required" }); return; }
  if (resource._count.menuItems) { res.status(409).json({ success: false, message: "Cannot delete a resource with menuItems; move or delete its menu items first" }); return; }
  await prisma.menuCategory.delete({ where: { id: resourceId } });
  res.json({ success: true, message: "Deleted successfully" });
}));

router.put(
  "/:id",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  updateMenuCategory
);

export default router;
