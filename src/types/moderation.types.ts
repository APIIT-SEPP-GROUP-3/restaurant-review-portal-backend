import { ReviewStatus } from "../generated/prisma/client.js";
import type { CommentStatus } from "../generated/prisma/client.js";

export interface ReviewModerationQuery {
  status?: ReviewStatus;
}

export interface CommentModerationQuery {
  status?: CommentStatus;
}