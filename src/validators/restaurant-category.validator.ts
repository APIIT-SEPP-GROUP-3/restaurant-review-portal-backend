import { z } from "zod";

export const assignRestaurantCategoriesSchema = z.object({
  categoryIds: z
    .array(z.number().int().positive())
    .min(1),
});

export const createRestaurantCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});