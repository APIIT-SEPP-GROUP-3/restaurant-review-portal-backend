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
import {
  getMenuItemReviews,
  getMenuItemRatingSummary,
} from "../controllers/review.controller.js";
import {
  presignMenuItemImageUpload,
  saveMenuItemImage,
} from "../controllers/image-upload.controller.js";

import prisma from "../config/prisma.js";
import { z } from "zod";
import { action } from "../utils/route-action.js";

const router = Router();
router.delete("/:id", authenticate, authorizeRoles(ROLES.RESTAURANT_OWNER), action(async (req, res) => {
  const resourceId = z.coerce.number().int().positive().parse(req.params.id);
  const resource = await prisma.menuItem.findUniqueOrThrow({ where: { id: resourceId }, include: { restaurant: true, _count: { select: { reviews: true } } } });
  if (resource.restaurant.ownerId !== req.user!.userId) { res.status(403).json({ success: false, message: "Restaurant ownership required" }); return; }
  if (resource._count.reviews) { res.status(409).json({ success: false, message: "Cannot delete a resource with reviews; mark it unavailable instead" }); return; }
  await prisma.menuItem.delete({ where: { id: resourceId } });
  res.json({ success: true, message: "Deleted successfully" });
}));

router.get("/", getMenuItems);

router.get("/:menuItemId/reviews", getMenuItemReviews);
router.get("/:menuItemId/rating-summary", getMenuItemRatingSummary);
router.get("/:id", getMenuItemById);

router.put(
  "/:id",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  updateMenuItem,
);

router.patch(
  "/:id/availability",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  updateMenuItemAvailability,
);
// router.post(
//   "/:menuItemId/images",
//   authenticate,
//   authorizeRoles(ROLES.RESTAURANT_OWNER),
//   createMenuItemImage,
// );
// router.delete(
//   "/:menuItemId/images/:imageId",
//   authenticate,
//   authorizeRoles(ROLES.RESTAURANT_OWNER),
//   deleteMenuItemImage,
// );
router.post(
  "/:menuItemId/images/presign",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  presignMenuItemImageUpload,
);

router.post(
  "/:menuItemId/images",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  saveMenuItemImage,
);

router.delete(
  "/:menuItemId/images/:imageId",
  authenticate,
  authorizeRoles(ROLES.RESTAURANT_OWNER),
  deleteMenuItemImage,
);

export default router;
