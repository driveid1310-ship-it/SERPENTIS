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
  searchReports,
  verifyReport,
} from '../controllers/reportController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

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

// Search Reports
router.get('/search', searchReports);

// ===============================
// Moderator Routes
// ===============================
router.patch(
  '/:id/status',
  authMiddleware,
  authorizeRoles('moderator', 'admin'),
  updateReportStatus,
);

router.patch(
  '/:id/verify',
  authMiddleware,
  authorizeRoles('moderator', 'admin'),
  verifyReport,
);

router.patch(
  '/:id/priority',
  authMiddleware,
  authorizeRoles('moderator', 'admin'),
  updateReportPriority,
);

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