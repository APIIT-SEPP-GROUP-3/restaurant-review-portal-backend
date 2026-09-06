import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types.js";
import {
  reviewModerationQuerySchema,
  rejectReviewSchema,
  commentModerationQuerySchema,
  rejectCommentSchema,
} from "../validators/moderation.validator.js";
import {
  getReviewsForModeration as getReviewsForModerationService,
  approveReview as approveReviewService,
  rejectReview as rejectReviewService,
  getCommentsForModeration as getCommentsForModerationService,
  approveComment as approveCommentService,
  rejectComment as rejectCommentService,
} from "../services/moderation.service.js";

export const getReviewsForModeration = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const validatedQuery = reviewModerationQuerySchema.parse(req.query);

    const reviews = await getReviewsForModerationService(validatedQuery.status);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch reviews for moderation",
    });
  }
};

export const approveReview = async (
  req: AuthenticatedRequest,
  res: Response,
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

    const review = await approveReviewService(reviewId, req.user!.userId);

    res.status(200).json({
      success: true,
      message: "Review approved successfully",
      data: review,
    });
  } catch (error: any) {
    if (error.message === "REVIEW_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Review not found",
      });
      return;
    }

    if (error.message === "REVIEW_NOT_PENDING") {
      res.status(400).json({
        success: false,
        message: "Only pending reviews can be approved",
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to approve review",
    });
  }
};

export const rejectReview = async (
  req: AuthenticatedRequest,
  res: Response,
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

    const validatedData = rejectReviewSchema.parse(req.body);

    const review = await rejectReviewService(
      reviewId,
      req.user!.userId,
      validatedData.rejectionReason,
    );

    res.status(200).json({
      success: true,
      message: "Review rejected successfully",
      data: review,
    });
  } catch (error: any) {
    if (error.message === "REVIEW_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Review not found",
      });
      return;
    }

    if (error.message === "REVIEW_NOT_PENDING") {
      res.status(400).json({
        success: false,
        message: "Only pending reviews can be rejected",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to reject review",
    });
  }
};

export const getCommentsForModeration = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedQuery =
      commentModerationQuerySchema.parse(req.query);

    const comments =
      await getCommentsForModerationService(
        validatedQuery.status
      );

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch comments for moderation",
    });
  }
};

export const approveComment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const commentId = Number(req.params.commentId);

    if (Number.isNaN(commentId)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    const comment = await approveCommentService(
      commentId,
      req.user!.userId
    );

    res.status(200).json({
      success: true,
      message: "Comment approved successfully",
      data: comment,
    });
  } catch (error: any) {
    if (error.message === "COMMENT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    if (error.message === "COMMENT_NOT_PENDING") {
      res.status(400).json({
        success: false,
        message: "Only pending comments can be approved",
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to approve comment",
    });
  }
};

export const rejectComment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const commentId = Number(req.params.commentId);

    if (Number.isNaN(commentId)) {
      res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
      return;
    }

    const validatedData =
      rejectCommentSchema.parse(req.body);

    const comment = await rejectCommentService(
      commentId,
      req.user!.userId,
      validatedData.rejectionReason
    );

    res.status(200).json({
      success: true,
      message: "Comment rejected successfully",
      data: comment,
    });
  } catch (error: any) {
    if (error.message === "COMMENT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Comment not found",
      });
      return;
    }

    if (error.message === "COMMENT_NOT_PENDING") {
      res.status(400).json({
        success: false,
        message: "Only pending comments can be rejected",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to reject comment",
    });
  }
};