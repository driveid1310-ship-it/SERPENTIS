import type {
  Response,
  NextFunction,
} from "express";

import User from "../models/User.js";
import type { AuthenticatedRequest } from "./authMiddleware.js";

export async function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

   if (
  user.role !== "admin" &&
  user.role !== "moderator"
) {
      res.status(403).json({
        success: false,
        message: "Admin or moderator access required.",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}