import type { Response } from "express";

import type { AuthenticatedRequest } from "../types/auth.types.js";

import {
  presignImageUploadSchema,
  saveUploadedImageSchema,
} from "../validators/image-upload.validator.js";

import {
  deleteMenuItemImage as deleteMenuItemImageService,
  deleteRestaurantImage as deleteRestaurantImageService,
  generateMenuItemImagePresignedUrl,
  generateRestaurantImagePresignedUrl,
  saveMenuItemImage as saveMenuItemImageService,
  saveRestaurantImage as saveRestaurantImageService,
} from "../services/image-upload.service.js";

const handleImageError = (error: any, res: Response): void => {
  if (error.message === "RESTAURANT_NOT_FOUND") {
    res.status(404).json({
      success: false,
      message: "Restaurant not found",
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

  if (error.message === "IMAGE_NOT_FOUND") {
    res.status(404).json({
      success: false,
      message: "Image not found",
    });
    return;
  }

  if (error.message === "FORBIDDEN") {
    res.status(403).json({
      success: false,
      message: "You are not allowed to manage images for this resource",
    });
    return;
  }

  if (error.message === "INVALID_OBJECT_KEY") {
    res.status(400).json({
      success: false,
      message: "Invalid image object key",
    });
    return;
  }

  if (error.message === "R2_OBJECT_NOT_FOUND") {
    res.status(400).json({
      success: false,
      message: "Uploaded image was not found in object storage",
    });
    return;
  }

  console.error(error);

  res.status(400).json({
    success: false,
    message: "Unable to process image request",
  });
};

/* Restaurant presign */

export const presignRestaurantImageUpload = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const restaurantId = Number(req.params.restaurantId);

    if (Number.isNaN(restaurantId) || restaurantId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
      return;
    }

    const data = presignImageUploadSchema.parse(req.body);

    const result = await generateRestaurantImagePresignedUrl(
      restaurantId,
      req.user!.userId,
      req.user!.role,
      data,
    );

    res.status(200).json({
      success: true,
      message: "Presigned upload URL generated successfully",
      data: result,
    });
  } catch (error: any) {
    handleImageError(error, res);
  }
};

/* Menu item presign */

export const presignMenuItemImageUpload = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const menuItemId = Number(req.params.menuItemId);

    if (Number.isNaN(menuItemId) || menuItemId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid menu item ID",
      });
      return;
    }

    const data = presignImageUploadSchema.parse(req.body);

    const result = await generateMenuItemImagePresignedUrl(
      menuItemId,
      req.user!.userId,
      req.user!.role,
      data,
    );

    res.status(200).json({
      success: true,
      message: "Presigned upload URL generated successfully",
      data: result,
    });
  } catch (error: any) {
    handleImageError(error, res);
  }
};

/* Save restaurant image */

export const saveRestaurantImage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const restaurantId = Number(req.params.restaurantId);

    const data = saveUploadedImageSchema.parse(req.body);

    const image = await saveRestaurantImageService(
      restaurantId,
      req.user!.userId,
      req.user!.role,
      data,
    );

    res.status(201).json({
      success: true,
      message: "Restaurant image saved successfully",
      data: image,
    });
  } catch (error: any) {
    handleImageError(error, res);
  }
};

/* Save menu image */

export const saveMenuItemImage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const menuItemId = Number(req.params.menuItemId);

    const data = saveUploadedImageSchema.parse(req.body);

    const image = await saveMenuItemImageService(
      menuItemId,
      req.user!.userId,
      req.user!.role,
      data,
    );

    res.status(201).json({
      success: true,
      message: "Menu item image saved successfully",
      data: image,
    });
  } catch (error: any) {
    handleImageError(error, res);
  }
};

/* Delete restaurant */

export const deleteRestaurantImage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    await deleteRestaurantImageService(
      Number(req.params.restaurantId),
      Number(req.params.imageId),
      req.user!.userId,
      req.user!.role,
    );

    res.status(200).json({
      success: true,
      message: "Restaurant image deleted successfully",
    });
  } catch (error: any) {
    handleImageError(error, res);
  }
};

/* Delete menu image */

export const deleteMenuItemImage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    await deleteMenuItemImageService(
      Number(req.params.menuItemId),
      Number(req.params.imageId),
      req.user!.userId,
      req.user!.role,
    );

    res.status(200).json({
      success: true,
      message: "Menu item image deleted successfully",
    });
  } catch (error: any) {
    handleImageError(error, res);
  }
};
