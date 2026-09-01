import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createRestaurantImageSchema } from "../validators/restaurant-image.validator.js";
import { createRestaurantImage as createRestaurantImageService } from "../services/restaurant-image.service.js";

export const createRestaurantImage = async (
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
      createRestaurantImageSchema.parse(req.body);

    const image = await createRestaurantImageService(
      restaurantId,
      req.user!.userId,
      req.user!.role,
      validatedData
    );

    res.status(201).json({
      success: true,
      message: "Restaurant image created successfully",
      data: image,
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
      message: "Unable to create restaurant image",
    });
  }
};