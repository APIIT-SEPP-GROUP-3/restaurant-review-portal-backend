import { z } from "zod";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export const presignImageUploadSchema = z.object({
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name is too long"),

  contentType: z.enum(allowedImageTypes, {
    message: "Only JPEG, PNG, and WebP images are allowed",
  }),
});

export const saveUploadedImageSchema = z.object({
  objectKey: z.string().min(1, "Object key is required"),

  altText: z
    .string()
    .max(255, "Alt text must not exceed 255 characters")
    .optional(),

  isPrimary: z.boolean().default(false),
});

export type PresignImageUploadInput = z.infer<typeof presignImageUploadSchema>;

export type SaveUploadedImageInput = z.infer<typeof saveUploadedImageSchema>;
