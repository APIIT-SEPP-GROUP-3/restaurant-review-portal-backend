import jwt from "jsonwebtoken";
import { Role } from "../constants/roles.js";

export interface JwtPayload {
  userId: number;
  role: Role;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
};
