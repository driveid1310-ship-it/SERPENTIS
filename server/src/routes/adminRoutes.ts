import { Router } from 'express';
import { getDashboard } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Dashboard Statistics
router.get('/dashboard', authMiddleware, getDashboard);

export default router;