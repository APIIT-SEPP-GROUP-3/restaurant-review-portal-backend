import type { AuthenticatedRequest } from "../types/http.types.js";
import {
  createMenuCategorySchema,
  updateMenuCategorySchema,
} from "../validators/menu-category.validator.js";
import {
  createMenuCategory as createMenuCategoryService,
  getMenuCategoriesByRestaurant as getMenuCategoriesByRestaurantService,
  updateMenuCategory as updateMenuCategoryService,
} from "../services/menu-category.service.js";
import { Request, Response } from "express";

export const getMenuCategoriesByRestaurant = async (
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

    const categories = await getMenuCategoriesByRestaurantService(restaurantId);

    res.status(200).json({
      success: true,
      data: categories,
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
      message: "Unable to fetch menu categories",
    });
  }
};

export const createMenuCategory = async (
  req: AuthenticatedRequest,
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

    const validatedData = createMenuCategorySchema.parse(req.body);

    const menuCategory = await createMenuCategoryService(
      restaurantId,
      req.user!.userId,
      req.user!.role,
      validatedData,
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
        message: "You are not allowed to manage this restaurant",
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

export const updateMenuCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const menuCategoryId = Number(req.params.id);

    if (Number.isNaN(menuCategoryId)) {
      res.status(400).json({
        success: false,
        message: "Invalid menu category ID",
      });
      return;
    }

    const validatedData = updateMenuCategorySchema.parse(req.body);

    const menuCategory = await updateMenuCategoryService(
      menuCategoryId,
      req.user!.userId,
      req.user!.role,
      validatedData
    );

    res.status(200).json({
      success: true,
      message: "Menu category updated successfully",
      data: menuCategory,
    });
  } catch (error: any) {
    if (error.message === "MENU_CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Menu category not found",
      });
      return;
    }

    if (error.message === "FORBIDDEN") {
      res.status(403).json({
        success: false,
        message: "You are not allowed to update this menu category",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to update menu category",
    });
  }
};
