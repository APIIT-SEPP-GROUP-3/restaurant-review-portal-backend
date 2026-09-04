import { Router } from "express";
import {
  getReviewsForModeration,
  approveReview,
  rejectReview,
  getCommentsForModeration,
  approveComment,
  rejectComment
} from "../controllers/moderation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get(
  "/reviews",
  authenticate,
  authorizeRoles(ROLES.MODERATOR, ROLES.ADMIN),
  getReviewsForModeration,
);

router.patch(
  "/reviews/:reviewId/approve",
  authenticate,
  authorizeRoles(ROLES.MODERATOR, ROLES.ADMIN),
  approveReview,
);

router.patch(
  "/reviews/:reviewId/reject",
  authenticate,
  authorizeRoles(ROLES.MODERATOR, ROLES.ADMIN),
  rejectReview,
);

router.get(
  "/comments",
  authenticate,
  authorizeRoles(ROLES.MODERATOR, ROLES.ADMIN),
  getCommentsForModeration,
);

router.patch(
  "/comments/:commentId/approve",
  authenticate,
  authorizeRoles(ROLES.MODERATOR, ROLES.ADMIN),
  approveComment,
);

router.patch(
  "/comments/:commentId/reject",
  authenticate,
  authorizeRoles(
    ROLES.MODERATOR,
    ROLES.ADMIN
  ),
  rejectComment
);

export default router;
