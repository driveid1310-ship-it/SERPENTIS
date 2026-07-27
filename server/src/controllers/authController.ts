import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import User, { type IUser } from "../models/User.js";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined.");
  }

  return secret;
}

const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface RegisterRequestBody {
  name?: string;
  email?: string;
  password?: string;
}

interface LoginRequestBody {
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function generateToken(userId: string): string {
  const signOptions: SignOptions = {};
  if (JWT_EXPIRES_IN !== undefined) {
    signOptions.expiresIn = JWT_EXPIRES_IN;
  }
  return jwt.sign(
    { userId },
    getJwtSecret(),
    signOptions
  );
}

function sanitizeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.fullName,
    email: user.email,
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
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'Name is required and must be at least 2 characters long.',
      });
      return;
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 8 characters long.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
      return;
    }

    const newUser = await User.create({
    fullName: name.trim(),
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

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
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

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    console.log("Entered password:", password);
    console.log("Stored password:", user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log("Password valid:", isPasswordValid);
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
