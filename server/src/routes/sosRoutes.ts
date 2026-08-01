import { Router } from 'express';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

import {
  createSOS,
  getAllSOS,
  getNearbySOS,
  resolveSOS,
} from '../controllers/sosController.js';

const router = Router();

// ===============================
// Get All Active SOS Alerts
// ===============================
router.get('/', authMiddleware, getAllSOS);

// ===============================
// Nearby SOS Alerts
// ===============================
router.get('/near', authMiddleware, getNearbySOS);

// ===============================
// Create SOS
// ===============================
router.post('/', authMiddleware, createSOS);

// ===============================
// Resolve SOS (Moderator/Admin)
// ===============================
router.patch(
  '/:id',
  authMiddleware,
  authorizeRoles('moderator', 'admin'),
  resolveSOS,
);

export default router;