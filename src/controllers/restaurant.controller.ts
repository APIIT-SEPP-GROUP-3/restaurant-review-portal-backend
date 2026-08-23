import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createRestaurantSchema } from "../validators/restaurant.validator.js";
import { createRestaurant as createRestaurantService } from "../services/restaurant.service.js";

export const createRestaurant = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const validatedData = createRestaurantSchema.parse(req.body);

    const restaurant = await createRestaurantService(
      req.user!.userId,
      validatedData
    );

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to create restaurant",
    });
  }
};