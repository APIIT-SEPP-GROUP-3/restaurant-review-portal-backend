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