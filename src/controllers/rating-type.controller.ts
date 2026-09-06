import { Request, Response } from "express";
import { getAllRatingTypes } from "../services/rating-type.service.js";

export const getRatingTypes = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const ratingTypes = await getAllRatingTypes();

    res.status(200).json({
      success: true,
      data: ratingTypes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch rating types",
    });
  }
};