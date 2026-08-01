import { Types } from "mongoose";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export function requireUserId(
  req: AuthenticatedRequest,
  res: Response,
): Types.ObjectId | null {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });

    return null;
  }

  return new Types.ObjectId(req.userId);
}