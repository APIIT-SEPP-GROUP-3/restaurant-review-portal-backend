import { z } from "zod";

export const createMenuCategorySchema = z.object({
  name: z.string().min(2).max(100),
  displayOrder: z.number().int().min(0).optional(),
});