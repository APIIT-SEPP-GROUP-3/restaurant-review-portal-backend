import { Router } from "express";
import {
  createReview,
  getReviewById,
} from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  createReviewComment,
  getReviewComments,
} from "../controllers/review-comment.controller.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.post("/", authenticate, authorizeRoles(ROLES.CUSTOMER), createReview);

router.get("/:id", getReviewById);

router.post(
  "/:reviewId/comments",
  authenticate,
  authorizeRoles(ROLES.CUSTOMER, ROLES.RESTAURANT_OWNER, ROLES.ADMIN),
  createReviewComment,
);

router.get(
  "/:reviewId/comments",
  getReviewComments
);

export default router;
