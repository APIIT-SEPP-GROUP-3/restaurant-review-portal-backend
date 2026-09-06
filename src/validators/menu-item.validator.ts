import { z } from "zod";

export const createMenuItemSchema = z.object({
  menuCategoryId: z.number().int().positive(),
  name: z.string().min(2).max(150),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  isAvailable: z.boolean().optional(),
});

export const updateMenuItemSchema = z.object({
  menuCategoryId: z.number().int().positive().optional(),
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
});

export const updateMenuItemAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const menuItemSearchSchema = z.object({
  search: z.string().trim().optional(),

  restaurantId: z.coerce
    .number()
    .int()
    .positive()
    .optional(),

  menuCategoryId: z.coerce
    .number()
    .int()
    .positive()
    .optional(),

  isAvailable: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
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
    .enum(["name", "price", "createdAt"])
    .default("name"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("asc"),
});