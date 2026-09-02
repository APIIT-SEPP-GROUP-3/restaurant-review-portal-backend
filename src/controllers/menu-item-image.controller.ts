import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createMenuItemImageSchema } from "../validators/menu-item-image.validator.js";
import {
  createMenuItemImage as createMenuItemImageService,
  deleteMenuItemImage as deleteMenuItemImageService,
} from "../services/menu-item-image.service.js";

export const createMenuItemImage = async (
  req: AuthenticatedRequest,
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

    const validatedData = createMenuItemImageSchema.parse(req.body);

    const image = await createMenuItemImageService(
      menuItemId,
      req.user!.userId,
      req.user!.role,
      validatedData,
    );

    res.status(201).json({
      success: true,
      message: "Menu item image created successfully",
      data: image,
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
        message: "You are not allowed to manage this menu item",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to create menu item image",
    });
  }
};

export const deleteMenuItemImage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const menuItemId = Number(req.params.menuItemId);
    const imageId = Number(req.params.imageId);

    if (Number.isNaN(menuItemId) || Number.isNaN(imageId)) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID or image ID",
      });
      return;
    }

    const deletedImage = await deleteMenuItemImageService(
      menuItemId,
      imageId,
      req.user!.userId,
      req.user!.role
    );

    res.status(200).json({
      success: true,
      message: "Menu item image deleted successfully",
      data: deletedImage,
    });
  } catch (error: any) {
    if (error.message === "MENU_ITEM_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
      return;
    }

    if (error.message === "IMAGE_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Menu item image not found",
      });
      return;
    }

    if (error.message === "FORBIDDEN") {
      res.status(403).json({
        success: false,
        message: "You are not allowed to manage this menu item",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to delete menu item image",
    });
  }
};
