import { Response, Request } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createRestaurantSchema } from "../validators/restaurant.validator.js";
import {
  createRestaurant as createRestaurantService,
  getRestaurantById as getRestaurantByIdService,
} from "../services/restaurant.service.js";

export const createRestaurant = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = createRestaurantSchema.parse(req.body);

    const restaurant = await createRestaurantService(
      req.user!.userId,
      validatedData,
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

export const getRestaurantById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const restaurantId = Number(req.params.id);

    if (Number.isNaN(restaurantId)) {
      res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
      return;
    }

    const restaurant = await getRestaurantByIdService(restaurantId);

    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch restaurant",
    });
  }
};
