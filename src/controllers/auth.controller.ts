import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { loginUser, registerUser,getCurrentUser } from "../services/auth.service.js";
import type { AuthenticatedRequest } from "../types/http.types.js";

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const user = await registerUser(validatedData);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to register user",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await loginUser(validatedData);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    console.error(error);

    res.status(400).json({
      success: false,
      message: "Unable to login",
    });
  }
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
};
