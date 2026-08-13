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

// =======================================================
// GET ALL USERS
// =======================================================

export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
}

// =======================================================
// GET ALL REPORTS
// =======================================================

export async function getAllReports(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "fullName email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      data: {
        reports,
      },
    });
  } catch (error) {
    next(error);
  }
}

// =======================================================
// DELETE REPORT
// =======================================================

export async function deleteReport(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Report not found.",
      });
      return;
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: "Report deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

