import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createReviewCommentSchema } from "../validators/review-comment.validator.js";
import { createReviewComment as createReviewCommentService } from "../services/review-comment.service.js";

export const createReviewComment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const reviewId = Number(req.params.reviewId);

    if (Number.isNaN(reviewId)) {
      res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
      return;
    }

    const validatedData =
      createReviewCommentSchema.parse(req.body);

    const comment = await createReviewCommentService(
      reviewId,
      req.user!.userId,
      validatedData
    );

    res.status(201).json({
      success: true,
      message:
        "Comment submitted successfully and is awaiting moderation",
      data: comment,
    });
  } catch (error: any) {
    if (error.message === "REVIEW_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Review not found",
      });
      return;
    }

    if (error.message === "REVIEW_NOT_APPROVED") {
      res.status(400).json({
        success: false,
        message: "Comments can only be added to approved reviews",
      });
      return;
    }

    if (error.message === "PARENT_COMMENT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Parent comment not found",
      });
      return;
    }

    if (error.message === "INVALID_PARENT_COMMENT") {
      res.status(400).json({
        success: false,
        message:
          "Parent comment does not belong to this review",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to submit comment",
    });
  }
};