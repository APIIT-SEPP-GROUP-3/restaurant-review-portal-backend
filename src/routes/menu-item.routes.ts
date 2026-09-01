import { Router } from "express";
import {
  getMenuItemById,
  updateMenuItem,
  updateMenuItemAvailability,
} from "../controllers/menu-item.controller.js";
import {
  createMenuItemImage,
  deleteMenuItemImage,
} from "../controllers/menu-item-image.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get("/:id", getMenuItemById);

router.put(
  "/:id",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  updateMenuItem,
);

router.patch(
  "/:id/availability",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  updateMenuItemAvailability,
);
router.post(
  "/:menuItemId/images",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  createMenuItemImage,
);
router.delete(
  "/:menuItemId/images/:imageId",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  deleteMenuItemImage
);

export default router;
