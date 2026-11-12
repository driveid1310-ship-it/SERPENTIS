import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import User, { type IUser } from '../models/User.js';
import {
  EmailConfigurationError,
  assertEmailConfiguration,
  sendPasswordResetEmail,
} from '../services/emailService.js';
import {
  PasswordResetConfigurationError,
  issuePasswordResetOtp,
  reservePasswordResetRequest,
  resetUserPassword,
  verifyPasswordResetOtp,
} from '../services/passwordResetService.js';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }

  return secret;
}

const JWT_EXPIRES_IN: NonNullable<SignOptions['expiresIn']> =
  (process.env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>) || '7d';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface RegisterRequestBody {
  fullName?: string;
  email?: string;
  password?: string;
}

interface LoginRequestBody {
  email?: string;
  password?: string;
}

interface RequestPasswordResetBody {
  email?: string;
}

interface VerifyPasswordResetOtpBody {
  email?: string;
  otp?: string;
}

interface ResetPasswordBody {
  resetToken?: string;
  newPassword?: string;
}

interface UpdateCurrentUserBody {
  fullName?: unknown;
  profilePicture?: unknown;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_RESET_REQUEST_MESSAGE =
  'If an account exists for this email, a verification code will be sent.';

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function getNormalizedEmail(email: unknown): string | null {
  if (typeof email !== 'string') {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length > 254 ||
    !isValidEmail(normalizedEmail)
  ) {
    return null;
  }

  return normalizedEmail;
}

function handlePasswordResetConfigurationError(
  error: unknown,
  res: Response,
): boolean {
  if (
    error instanceof PasswordResetConfigurationError ||
    error instanceof EmailConfigurationError
  ) {
    res.status(503).json({
      success: false,
      message: 'Password reset is temporarily unavailable.',
    });
    return true;
  }

  return false;
}

function generateToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };

  return jwt.sign(
    { userId },
    getJwtSecret(),
    options,
  );
}

function sanitizeUser(user: IUser) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role || 'citizen',
    phone: user.phone || '',
    badges: user.badges || [],
    trustScore: user.trustScore,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function register(
  req: Request<unknown, unknown, RegisterRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { fullName, email, password } = req.body;

    if (
      !fullName ||
      typeof fullName !== 'string' ||
      fullName.trim().length < 2
    ) {
      res.status(400).json({
        success: false,
        message:
          'Full name is required and must be at least 2 characters long.',
      });
      return;
    }

    if (
      !email ||
      typeof email !== 'string' ||
      !isValidEmail(email)
    ) {
      res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
      return;
    }

    if (
      !password ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      res.status(400).json({
        success: false,
        message:
          'Password is required and must be at least 8 characters long.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
      return;
    }

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
    });

    const token = generateToken(newUser._id.toString());

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: sanitizeUser(newUser),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request<unknown, unknown, LoginRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (
      !email ||
      typeof email !== 'string' ||
      !isValidEmail(email)
    ) {
      res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
      return;
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Password is required.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
      return;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCurrentUser(
  req: AuthenticatedRequest & { body: UpdateCurrentUserBody },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
      return;
    }

    const body: unknown = req.body;
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      res.status(400).json({
        success: false,
        message: 'A profile update payload is required.',
      });
      return;
    }

    const allowedKeys = ['fullName', 'profilePicture'];
    const keys = Object.keys(body);
    const isValidOperation = keys.every(key => allowedKeys.includes(key));
    if (!isValidOperation || keys.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Only fullName and profilePicture can be updated.',
      });
      return;
    }

    const updates: { fullName?: string; profilePicture?: string } = {};

    if ('fullName' in body) {
      const fullName = (body as UpdateCurrentUserBody).fullName;
      if (typeof fullName !== 'string') {
        res.status(400).json({ success: false, message: 'Full name must be a string.' });
        return;
      }
      const normalizedFullName = fullName.trim();
      if (normalizedFullName.length < 2 || normalizedFullName.length > 100) {
        res.status(400).json({ success: false, message: 'Full name must be between 2 and 100 characters.' });
        return;
      }
      updates.fullName = normalizedFullName;
    }

    if ('profilePicture' in body) {
      const profilePicture = (body as UpdateCurrentUserBody).profilePicture;
      if (typeof profilePicture !== 'string') {
        res.status(400).json({ success: false, message: 'Profile picture must be a string URL.' });
        return;
      }
      updates.profilePicture = profilePicture;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
}

export async function requestPasswordReset(
  req: Request<unknown, unknown, RequestPasswordResetBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const email = getNormalizedEmail(req.body?.email);

  if (!email) {
    res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
    return;
  }

  try {
    assertEmailConfiguration();
    const isWithinIpLimit = await reservePasswordResetRequest(
      email,
      req.ip || 'unknown',
    );

    if (!isWithinIpLimit) {
      res.status(429).json({
        success: false,
        message: 'Please wait before requesting another verification code.',
      });
      return;
    }

    const user = await User.findOne({ email });
    const otp = await issuePasswordResetOtp(email, user?._id ?? null);

    if (user) {
      setImmediate(() => {
        void sendPasswordResetEmail(user.email, otp).catch((error: unknown) => {
          const errorName =
            error instanceof Error ? error.name : 'UnknownError';
          console.error(
            `Password reset email delivery failed (${errorName}).`,
          );
        });
      });
    }

    res.status(202).json({
      success: true,
      message: GENERIC_RESET_REQUEST_MESSAGE,
      data: {
        accepted: true,
        expiresInSeconds: 600,
        resendAfterSeconds: 60,
      },
    });
  } catch (error) {
    if (handlePasswordResetConfigurationError(error, res)) {
      return;
    }

    next(error);
  }
}

export async function verifyResetOtp(
  req: Request<unknown, unknown, VerifyPasswordResetOtpBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const email = getNormalizedEmail(req.body?.email);
  const { otp } = req.body ?? {};

  if (!email || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    res.status(400).json({
      success: false,
      message: 'Invalid or expired verification code.',
    });
    return;
  }

  try {
    const verification = await verifyPasswordResetOtp(email, otp);

    if (!verification) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Verification code accepted.',
      data: verification,
    });
  } catch (error) {
    if (handlePasswordResetConfigurationError(error, res)) {
      return;
    }

    next(error);
  }
}

export async function resetPassword(
  req: Request<unknown, unknown, ResetPasswordBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { resetToken, newPassword } = req.body ?? {};

  if (
    typeof resetToken !== 'string' ||
    resetToken.length < 32 ||
    resetToken.length > 128
  ) {
    res.status(400).json({
      success: false,
      message: 'This password reset request is invalid or expired.',
    });
    return;
  }

  if (
    typeof newPassword !== 'string' ||
    newPassword.length < 8 ||
    Buffer.byteLength(newPassword, 'utf8') > 72
  ) {
    res.status(400).json({
      success: false,
      message:
        'Password must be at least 8 characters and no more than 72 bytes.',
    });
    return;
  }

  try {
    const didReset = await resetUserPassword(resetToken, newPassword);

    if (!didReset) {
      res.status(400).json({
        success: false,
        message: 'This password reset request is invalid or expired.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
      data: { reset: true },
    });
  } catch (error) {
    if (handlePasswordResetConfigurationError(error, res)) {
      return;
    }

    next(error);
  }
}