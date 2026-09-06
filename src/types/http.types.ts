import type { Request } from "express";
import type { Role } from "../constants/roles.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: Role;
  };
}
