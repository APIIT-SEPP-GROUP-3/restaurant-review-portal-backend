import { Router } from "express";
import { getReviewsForModeration,approveReview } from "../controllers/moderation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get(
  "/reviews",
  authenticate,
  authorizeRoles(
    ROLES.MODERATOR,
    ROLES.ADMIN
  ),
  getReviewsForModeration
);

router.patch(
  "/reviews/:reviewId/approve",
  authenticate,
  authorizeRoles(
    ROLES.MODERATOR,
    ROLES.ADMIN
  ),
  approveReview
);

export default router;