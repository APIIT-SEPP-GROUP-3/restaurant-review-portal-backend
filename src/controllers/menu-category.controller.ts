import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createMenuCategorySchema } from "../validators/menu-category.validator.js";
import { createMenuCategory as createMenuCategoryService } from "../services/menu-category.service.js";

export const createMenuCategory = async (
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
      createMenuCategorySchema.parse(req.body);

    const menuCategory =
      await createMenuCategoryService(
        restaurantId,
        req.user!.userId,
        req.user!.role,
        validatedData
      );

    res.status(201).json({
      success: true,
      message: "Menu category created successfully",
      data: menuCategory,
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
        message:
          "You are not allowed to manage this restaurant",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to create menu category",
    });
  }
};