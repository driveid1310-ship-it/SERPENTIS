import { Router } from 'express';
import {
  createReport,
  getAllReports,
  getNearbyReports,
  getReportById,
  updateReport,
  deleteReport,
} from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Create Report
router.post('/', authMiddleware, createReport);

// Get All Reports
router.get('/', getAllReports);

// Nearby Reports (MUST be before /:id)
router.get('/near', getNearbyReports);

// Get Single Report
router.get('/:id', getReportById);

// Update Report
router.put('/:id', authMiddleware, updateReport);

// Delete Report
router.delete('/:id', authMiddleware, deleteReport);

export default router;
