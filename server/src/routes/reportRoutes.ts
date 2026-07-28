import { Router } from 'express';
import {
  createReport,
  getAllReports,
  getNearbyReports,
  getReportById,
  updateReport,
  deleteReport,
  upvoteReport,
  removeUpvote,
  updateReportStatus,
  updateReportPriority,
} from '../controllers/reportController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// ===============================
// Create Report
// ===============================
router.post('/', authMiddleware, createReport);

// ===============================
// Get Reports
// ===============================
router.get('/', getAllReports);

// Nearby Reports
router.get('/near', getNearbyReports);

// ===============================
// Moderator Routes
// ===============================
router.patch('/:id/status', authMiddleware, updateReportStatus);
router.patch('/:id/priority', authMiddleware, updateReportPriority);

// ===============================
// Upvote Routes
// ===============================
router.post('/:id/upvote', authMiddleware, upvoteReport);
router.delete('/:id/upvote', authMiddleware, removeUpvote);

// ===============================
// Get Single Report
// ===============================
router.get('/:id', getReportById);

// ===============================
// Update Report
// ===============================
router.put('/:id', authMiddleware, updateReport);

// ===============================
// Delete Report
// ===============================
router.delete('/:id', authMiddleware, deleteReport);

export default router;
