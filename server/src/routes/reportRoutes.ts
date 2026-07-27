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
} from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Create Report
router.post('/', authMiddleware, createReport);

// Get All Reports
router.get('/', getAllReports);

// Nearby Reports
router.get('/near', getNearbyReports);

// Upvote Routes
router.post('/:id/upvote', authMiddleware, upvoteReport);
router.delete('/:id/upvote', authMiddleware, removeUpvote);

// Get Single Report
router.get('/:id', getReportById);

// Update Report
router.put('/:id', authMiddleware, updateReport);

// Delete Report
router.delete('/:id', authMiddleware, deleteReport);
export default router;
