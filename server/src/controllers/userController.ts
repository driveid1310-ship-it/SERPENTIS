import type { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';

export async function getLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await User.find()
      .select(
        'fullName reputationPoints trustScore resolvedReports badges profilePicture',
      )
      .sort({
        reputationPoints: -1,
        trustScore: -1,
        resolvedReports: -1,
      });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user.toObject(),
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
      },
    });
  } catch (error) {
    next(error);
  }
}