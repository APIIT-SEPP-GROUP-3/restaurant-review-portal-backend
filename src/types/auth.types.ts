import type { Role } from "../constants/roles.js";
import type { Request } from "express";

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: number;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}