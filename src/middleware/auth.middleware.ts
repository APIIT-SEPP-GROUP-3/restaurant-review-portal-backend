import { NextFunction, Response } from "express";
import prisma from "../config/prisma.js";
import { type Role, ROLES } from "../constants/roles.js";
import { verifyToken } from "../utils/jwt.js";
import type { AuthenticatedRequest } from "../types/http.types.js";

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, include: { role: true } });
    if (!user || !user.isActive || !user.role.isActive || !Object.values(ROLES).includes(user.role.roleName as Role)) {
      res.status(401).json({ success: false, message: "Account is inactive or unavailable" });
      return;
    }
    req.user = { userId: user.id, role: user.role.roleName as Role };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
