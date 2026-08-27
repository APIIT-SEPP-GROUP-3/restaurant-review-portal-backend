import { Router } from "express";
import {
  getMenuItemById,
  updateMenuItem,
} from "../controllers/menu-item.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

router.get("/:id", getMenuItemById);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("RESTAURANT_OWNER", "ADMIN"),
  updateMenuItem
);

export default router;