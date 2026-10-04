import { Router } from 'express';
import {
  createGroup,
  getGroups,
  getMyGroups,
  getGroupDetails,
  joinGroup,
  leaveGroup,
  getGroupMessages,
  getGroupMembers,
} from '../controllers/groupController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Semi-public routes
router.get('/', getGroups);
router.get('/my', authMiddleware as any, getMyGroups);
router.get('/:id', authMiddleware as any, getGroupDetails);
router.get('/:id/members', getGroupMembers);

// Protected routes
router.post('/', authMiddleware as any, createGroup);
router.post('/:id/join', authMiddleware as any, joinGroup);
router.post('/:id/leave', authMiddleware as any, leaveGroup);
router.get('/:id/messages', authMiddleware as any, getGroupMessages);

export default router;
