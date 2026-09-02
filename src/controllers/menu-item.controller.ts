import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  updateMenuItemAvailabilitySchema,
  menuItemSearchSchema,
} from "../validators/menu-item.validator.js";
import {
  createMenuItem as createMenuItemService,
  getMenuItemsByRestaurant as getMenuItemsByRestaurantService,
  getMenuItemById as getMenuItemByIdService,
  getMenuItems as getMenuItemsService,
  updateMenuItem as updateMenuItemService,
  updateMenuItemAvailability as updateMenuItemAvailabilityService,
} from "../services/menu-item.service.js";

export const createMenuItem = async (
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

    const validatedData = createMenuItemSchema.parse(req.body);

    const menuItem = await createMenuItemService(
      restaurantId,
      req.user!.userId,
      req.user!.role,
      validatedData,
    );

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem,
    });
  } catch (error: any) {
    if (error.message === "RESTAURANT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    if (error.message === "MENU_CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Menu category not found",
      });
      return;
    }

    if (error.message === "INVALID_MENU_CATEGORY") {
      res.status(400).json({
        success: false,
        message: "Menu category does not belong to this restaurant",
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
      message: "Unable to create menu item",
    });
  }
};
export const getMenuItemsByRestaurant = async (
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

    const menuItems = await getMenuItemsByRestaurantService(restaurantId);

    res.status(200).json({
      success: true,
      data: menuItems,
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
      message: "Unable to fetch menu items",
    });
  }
};
export const getMenuItemById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const menuItemId = Number(req.params.id);

    if (Number.isNaN(menuItemId)) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
      return;
    }

    const menuItem = await getMenuItemByIdService(menuItemId);

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch menu item",
    });
  }
};

export const updateMenuItem = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const menuItemId = Number(req.params.id);

    if (Number.isNaN(menuItemId)) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
      return;
    }

    const validatedData = updateMenuItemSchema.parse(req.body);

    const menuItem = await updateMenuItemService(
      menuItemId,
      req.user!.userId,
      req.user!.role,
      validatedData,
    );

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: menuItem,
    });
  } catch (error: any) {
    if (error.message === "MENU_ITEM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
      return;
    }

    if (error.message === "MENU_CATEGORY_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Menu category not found",
      });
      return;
    }

    if (error.message === "INVALID_MENU_CATEGORY") {
      res.status(400).json({
        success: false,
        message: "Menu category does not belong to this restaurant",
      });
      return;
    }

    if (error.message === "FORBIDDEN") {
      res.status(403).json({
        success: false,
        message: "You are not allowed to update this menu item",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to update menu item",
    });
  }
};

export const updateMenuItemAvailability = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const menuItemId = Number(req.params.id);

    if (Number.isNaN(menuItemId)) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
      return;
    }

    const validatedData = updateMenuItemAvailabilitySchema.parse(req.body);

    const menuItem = await updateMenuItemAvailabilityService(
      menuItemId,
      req.user!.userId,
      req.user!.role,
      validatedData.isAvailable,
    );

    res.status(200).json({
      success: true,
      message: "Menu item availability updated successfully",
      data: menuItem,
    });
  } catch (error: any) {
    if (error.message === "MENU_ITEM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
      return;
    }

    if (error.message === "FORBIDDEN") {
      res.status(403).json({
        success: false,
        message: "You are not allowed to update this menu item",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to update menu item availability",
    });
  }
};

export const getMenuItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filters = menuItemSearchSchema.parse(req.query);

    const menuItems = await getMenuItemsService(filters);

    res.status(200).json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to fetch menu items",
    });
  }
};