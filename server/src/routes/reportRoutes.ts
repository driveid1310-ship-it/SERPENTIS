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
  toggleObservation,
  updateReportStatus,
  updateReportPriority,
  searchReports,
  verifyReport,
  getCityStats,
} from '../controllers/reportController.js';
import { uploadReportImage as uploadReportImageController } from '../controllers/reportImageController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { uploadReportImage } from '../middleware/uploadMiddleware.js';

const router = Router();

// ===============================
// Create Report
// ===============================
router.post(
  '/upload-image',
  authMiddleware,
  uploadReportImage,
  uploadReportImageController,
);
router.post('/', authMiddleware, createReport);

// ===============================
// Get Reports
// ===============================
router.get('/', getAllReports);

// Nearby Reports
router.get('/near', getNearbyReports);

// Search Reports
router.get('/search', searchReports);

// City Stats
router.get('/stats', getCityStats);

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
// Upvote & Observation Routes
// ===============================
router.post('/:id/upvote', authMiddleware, upvoteReport);
router.delete('/:id/upvote', authMiddleware, removeUpvote);
router.post('/:id/observe', authMiddleware, toggleObservation);

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