import { z } from "zod";

export const createReviewCommentSchema = z.object({
  commentText: z.string().min(2).max(2000),

  parentCommentId: z
    .number()
    .int()
    .positive()
    .optional(),
});