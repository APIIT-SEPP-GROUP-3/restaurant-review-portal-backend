import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createReviewSchema } from "../validators/review.validator.js";
import {
  createReview as createReviewService,
  getApprovedReviewById as getApprovedReviewByIdService,
  getApprovedReviewsByRestaurant as getApprovedReviewsByRestaurantService,
  getApprovedReviewsByMenuItem as getApprovedReviewsByMenuItemService,
  getRestaurantRatingSummary as getRestaurantRatingSummaryService,
} from "../services/review.service.js";

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = createReviewSchema.parse(req.body);

    const review = await createReviewService(req.user!.userId, validatedData);

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

export const getRestaurantReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const restaurantId = Number(req.params.restaurantId);

    if (Number.isNaN(restaurantId)) {
      res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
      return;
    }

    const reviews = await getApprovedReviewsByRestaurantService(restaurantId);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    if (error.message === "RESTAURANT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch restaurant reviews",
    });
  }
};

export const getMenuItemReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const menuItemId = Number(req.params.menuItemId);

    if (Number.isNaN(menuItemId)) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
      return;
    }

    const reviews = await getApprovedReviewsByMenuItemService(menuItemId);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    if (error.message === "MENU_ITEM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch menu item reviews",
    });
  }
};

export const getReviewById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const reviewId = Number(req.params.id);

    if (Number.isNaN(reviewId)) {
      res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
      return;
    }

    const review = await getApprovedReviewByIdService(reviewId);

    if (!review) {
      res.status(404).json({
        success: false,
        message: "Review not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch review",
    });
  }
};

export const getRestaurantRatingSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = Number(req.params.restaurantId);

    if (Number.isNaN(restaurantId)) {
      res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
      return;
    }

    const summary =
      await getRestaurantRatingSummaryService(restaurantId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    if (error.message === "RESTAURANT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch restaurant rating summary",
    });
  }
};
