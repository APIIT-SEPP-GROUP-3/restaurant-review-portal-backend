import { z } from "zod";

export const createReviewSchema = z.object({
  restaurantId: z.number().int().positive(),
  menuItemId: z.number().int().positive().optional(),

  title: z.string().min(2).max(150).optional(),

  reviewText: z.string().min(5).max(2000),

  ratings: z
    .array(
      z.object({
        ratingTypeId: z.number().int().positive(),
        ratingValue: z.number().int().min(1).max(5),
      })
    )
    .min(1),
});