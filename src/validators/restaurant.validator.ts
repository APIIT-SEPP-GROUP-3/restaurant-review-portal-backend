import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(1000).optional(),
  address: z.string().min(3).max(255),
  city: z.string().min(2).max(100),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  openingHours: z.string().max(500).optional(),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(1000).optional(),
  address: z.string().min(3).max(255).optional(),
  city: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  openingHours: z.string().max(500).optional(),
});

export const restaurantSearchSchema = z.object({
  search: z.string().trim().optional(),

  city: z.string().trim().optional(),

  categoryId: z.coerce
    .number()
    .int()
    .positive()
    .optional(),

  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10),

  sortBy: z
    .enum(["name", "city", "createdAt"])
    .default("name"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("asc"),
});