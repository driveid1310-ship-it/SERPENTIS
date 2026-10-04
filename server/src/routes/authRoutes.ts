import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  requestPasswordReset,
  verifyResetOtp,
  resetPassword,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getCurrentUser);
router.patch('/me', authMiddleware, updateCurrentUser);

export default router;