import { ReviewStatus } from "../generated/prisma/client.js";

export interface ReviewModerationQuery {
  status?: ReviewStatus;
}