import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = Router();

// ===============================
// Notification Routes
// ===============================

// Get all notifications
router.get("/", authMiddleware, getNotifications);

// Mark one notification as read
router.patch("/:id/read", authMiddleware, markNotificationRead);

// Mark all notifications as read
router.patch("/read-all", authMiddleware, markAllNotificationsRead);

// Delete notification
router.delete("/:id", authMiddleware, deleteNotification);

export default router;