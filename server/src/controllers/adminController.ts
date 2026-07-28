import { type Request, type Response, type NextFunction } from 'express';
import Report from '../models/Report.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const totalReports = await Report.countDocuments();

const pending = await Report.countDocuments({
  status: 'pending',
});

const resolved = await Report.countDocuments({
  status: 'resolved',
});

const rejected = await Report.countDocuments({
  status: 'rejected',
});

const highPriority = await Report.countDocuments({
  priority: 'high',
});

const duplicates = await Report.countDocuments({
  isDuplicate: true,
});

const totalUsers = await User.countDocuments();

const totalComments = await Comment.countDocuments();

res.status(200).json({
  success: true,
  data: {
    totalReports,
    pending,
    resolved,
    rejected,
    highPriority,
    duplicates,
    totalUsers,
    totalComments,
  },
});

  } catch (error) {
    next(error);
  }
}