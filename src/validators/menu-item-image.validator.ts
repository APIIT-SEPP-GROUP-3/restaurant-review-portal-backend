import { z } from "zod";

export const createMenuItemImageSchema = z.object({
  imageUrl: z.string().url(),
  altText: z.string().max(255).optional(),
  isPrimary: z.boolean().optional(),
});