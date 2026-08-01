import type { Response, NextFunction } from "express";
import { Types, isValidObjectId } from "mongoose";
import Notification from "../models/Notification.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

// ===============================
// Get User Notifications
// ===============================
export async function getNotifications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const userId = new Types.ObjectId(req.userId);

    const notifications = await Notification.find({
      user: userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ===============================
// Mark One Notification Read
// ===============================
export async function markNotificationRead(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
      return;
    }

    const userId = new Types.ObjectId(req.userId);

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        user: userId,
      },
      {
        isRead: true,
      },
      {
        new: true,
      },
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: {
        notification,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ===============================
// Mark All Notifications Read
// ===============================
export async function markAllNotificationsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const userId = new Types.ObjectId(req.userId);

    await Notification.updateMany(
      {
        user: userId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    next(error);
  }
}

// ===============================
// Delete Notification
// ===============================
export async function deleteNotification(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
      return;
    }

    const userId = new Types.ObjectId(req.userId);

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}