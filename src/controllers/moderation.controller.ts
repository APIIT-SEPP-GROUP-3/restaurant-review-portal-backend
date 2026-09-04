import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types.js";
import { reviewModerationQuerySchema } from "../validators/moderation.validator.js";
import { getReviewsForModeration as getReviewsForModerationService } from "../services/moderation.service.js";

export const getReviewsForModeration = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedQuery =
      reviewModerationQuerySchema.parse(req.query);

    const reviews =
      await getReviewsForModerationService(
        validatedQuery.status
      );

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