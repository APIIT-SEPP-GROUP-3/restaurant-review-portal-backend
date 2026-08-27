import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  assignCategoriesToRestaurant,
  createRestaurantCategory,
  getAllRestaurantCategories,
} from "../services/restaurant-category.service.js";

import {
  assignRestaurantCategoriesSchema,
  createRestaurantCategorySchema,
} from "../validators/restaurant-category.validator.js";

export const getRestaurantCategories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await getAllRestaurantCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch restaurant categories",
    });
  }
};

export const updateRestaurantCategories = async (
  req: AuthenticatedRequest,
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

    const validatedData =
      assignRestaurantCategoriesSchema.parse(req.body);

    const restaurant = await assignCategoriesToRestaurant(
      restaurantId,
      validatedData.categoryIds,
      req.user!.userId,
      req.user!.role
    );

    res.status(200).json({
      success: true,
      message: "Restaurant categories updated successfully",
      data: restaurant,
    });
  } catch (error: any) {
    if (error.message === "RESTAURANT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    if (error.message === "FORBIDDEN") {
      res.status(403).json({
        success: false,
        message: "You are not allowed to update this restaurant",
      });
      return;
    }

    if (error.message === "INVALID_CATEGORY") {
      res.status(400).json({
        success: false,
        message: "One or more restaurant categories are invalid",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to update restaurant categories",
    });
  }
};

export const addRestaurantCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedData =
      createRestaurantCategorySchema.parse(req.body);

    const category =
      await createRestaurantCategory(validatedData);

    res.status(201).json({
      success: true,
      message: "Restaurant category created successfully",
      data: category,
    });
  } catch (error: any) {
    if (error.message === "CATEGORY_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        message: "Restaurant category already exists",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to create restaurant category",
    });
  }
};