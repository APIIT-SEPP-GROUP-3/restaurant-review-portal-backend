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

import prisma from "../config/prisma.js";
import { z } from "zod";
import { action } from "../utils/route-action.js";

const router = Router();
router.get("/history", authenticate, authorizeRoles(ROLES.MODERATOR), action(async (req, res) => {
  const { page, limit } = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().min(1).max(100).default(25) }).parse(req.query);
  const where = { moderationStatus: { in: ["APPROVED", "REJECTED"] as ("APPROVED" | "REJECTED")[] } };
  const [reviews, comments] = await Promise.all([
    prisma.review.findMany({ where, orderBy: { moderatedAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.reviewComment.findMany({ where, orderBy: { moderatedAt: "desc" }, skip: (page - 1) * limit, take: limit }),
  ]);
  res.json({ success: true, data: { reviews, comments }, pagination: { page, limit } });
}));

router.get(
  "/reviews",
  authenticate,
  authorizeRoles(ROLES.MODERATOR),
  getReviewsForModeration,
);

router.patch(
  "/reviews/:reviewId/approve",
  authenticate,
  authorizeRoles(ROLES.MODERATOR),
  approveReview,
);

router.patch(
  "/reviews/:reviewId/reject",
  authenticate,
  authorizeRoles(ROLES.MODERATOR),
  rejectReview,
);

router.get(
  "/comments",
  authenticate,
  authorizeRoles(ROLES.MODERATOR),
  getCommentsForModeration,
);

router.patch(
  "/comments/:commentId/approve",
  authenticate,
  authorizeRoles(ROLES.MODERATOR),
  approveComment,
);

router.patch(
  "/comments/:commentId/reject",
  authenticate,
  authorizeRoles(
    ROLES.MODERATOR
  ),
  rejectComment
);

export default router;
