import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types.js";
import { reviewModerationQuerySchema, rejectReviewSchema} from "../validators/moderation.validator.js";
import {
  getReviewsForModeration as getReviewsForModerationService,
  approveReview as approveReviewService,
  rejectReview as rejectReviewService
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

    const review = await approveReviewService(
      reviewId,
      req.user!.userId
    );

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

    const validatedData = rejectReviewSchema.parse(req.body);

    const review = await rejectReviewService(
      reviewId,
      req.user!.userId,
      validatedData.rejectionReason
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