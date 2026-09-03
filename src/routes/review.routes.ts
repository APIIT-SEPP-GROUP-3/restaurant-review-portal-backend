import { Router } from "express";
import { createReview,getReviewById } from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("CUSTOMER"),
  createReview
);
router.get("/:id", getReviewById);

export default router;