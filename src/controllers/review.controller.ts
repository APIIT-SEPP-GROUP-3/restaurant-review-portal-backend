import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createReviewSchema } from "../validators/review.validator.js";
import { createReview as createReviewService } from "../services/review.service.js";

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedData = createReviewSchema.parse(req.body);

    const review = await createReviewService(
      req.user!.userId,
      validatedData
    );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully and is awaiting moderation",
      data: review,
    });
  } catch (error: any) {
    if (error.message === "RESTAURANT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    if (error.message === "RESTAURANT_NOT_ACTIVE") {
      res.status(400).json({
        success: false,
        message: "Restaurant is not active",
      });
      return;
    }

    if (error.message === "MENU_ITEM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
      return;
    }

    if (error.message === "INVALID_MENU_ITEM") {
      res.status(400).json({
        success: false,
        message: "Menu item does not belong to this restaurant",
      });
      return;
    }

    if (error.message === "INVALID_RATING_TYPE") {
      res.status(400).json({
        success: false,
        message: "One or more rating types are invalid",
      });
      return;
    }

    if (error.message === "DUPLICATE_RATING_TYPE") {
      res.status(400).json({
        success: false,
        message: "The same rating type cannot be submitted more than once",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to submit review",
    });
  }
};