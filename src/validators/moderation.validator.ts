import { z } from "zod";

export const reviewModerationQuerySchema = z.object({
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED"])
    .default("PENDING"),
});

export const rejectReviewSchema = z.object({
  rejectionReason: z
    .string()
    .min(5, "Rejection reason must be at least 5 characters")
    .max(500, "Rejection reason must not exceed 500 characters"),
});

export const commentModerationQuerySchema = z.object({
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED"])
    .default("PENDING"),
});