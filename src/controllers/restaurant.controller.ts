import { Response, Request } from "express";
import type { AuthenticatedRequest } from "../types/http.types.js";
import {
  createRestaurantSchema,
  restaurantSearchSchema,
  updateRestaurantSchema,
} from "../validators/restaurant.validator.js";
import {
  createRestaurant as createRestaurantService,
  getRestaurantById as getRestaurantByIdService,
  updateRestaurant as updateRestaurantService,
  getRestaurants as getRestaurantsService,
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

export const updateRestaurant = async (
  req: AuthenticatedRequest,
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

    const validatedData = updateRestaurantSchema.parse(req.body);

    const restaurant = await updateRestaurantService(
      restaurantId,
      req.user!.userId,
      req.user!.role,
      validatedData,
    );

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
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

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to update restaurant",
    });
  }
};

export const getRestaurants = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const filters = restaurantSearchSchema.parse(req.query);

    const result = await getRestaurantsService(filters);

    res.status(200).json({
      success: true,
      data: result.restaurants,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to fetch restaurants",
    });
  }
};
