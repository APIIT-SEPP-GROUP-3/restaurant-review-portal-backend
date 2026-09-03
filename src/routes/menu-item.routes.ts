import { Router } from "express";
import {
  getMenuItemById,
  updateMenuItem,
  updateMenuItemAvailability,
  getMenuItems,
} from "../controllers/menu-item.controller.js";
import {
  createMenuItemImage,
  deleteMenuItemImage,
} from "../controllers/menu-item-image.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { getMenuItemReviews,getMenuItemRatingSummary, } from "../controllers/review.controller.js";

const router = Router();

router.get("/", getMenuItems);

router.get(
  "/:menuItemId/reviews",
  getMenuItemReviews
);
router.get(
  "/:menuItemId/rating-summary",
  getMenuItemRatingSummary
);
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
