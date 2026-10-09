import type { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../types/http.types.js";

// Centralized validation/error handling for management endpoints.
export const action = (handler: (req: AuthenticatedRequest, res: Response) => Promise<void>) =>
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try { await handler(req, res); }
    catch (error) {
      const code = (error as { code?: string }).code;
      if (error instanceof z.ZodError) { res.status(400).json({ success: false, message: "Invalid input", errors: error.issues }); return; }
      if (code === "P2025") { res.status(404).json({ success: false, message: "Resource not found" }); return; }
      if (code === "P2002" || code === "P2003") { res.status(409).json({ success: false, message: "Duplicate or referenced resource" }); return; }
      console.error(error);
      res.status(500).json({ success: false, message: "Unable to complete request" });
    }
  };
