import type { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authorizeRoles(...roles: string[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated.',
        });
        return;
      }

      const user = await User.findById(req.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found.',
        });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: 'You are not authorized to perform this action.',
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}