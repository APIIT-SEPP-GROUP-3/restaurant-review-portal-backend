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