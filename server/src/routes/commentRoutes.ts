 import { Router } from 'express';
import {
  createComment,
  getComments,
  deleteComment,
} from '../controllers/commentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Create Comment
router.post('/:reportId', authMiddleware, createComment);

// Get Comments for a Report
router.get('/:reportId', getComments);

// Delete Comment
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;