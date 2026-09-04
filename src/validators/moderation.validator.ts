import { z } from "zod";

export const reviewModerationQuerySchema = z.object({
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED"])
    .default("PENDING"),
});