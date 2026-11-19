/**
 * User & Authentication Domain Types
 */

export type UserRole = 'citizen' | 'officer' | 'moderator' | 'admin';

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  trustScore: number;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequestBody {
  fullName?: string;
  email?: string;
  password?: string;
}

export interface LoginRequestBody {
  email?: string;
  password?: string;
}

export interface RequestPasswordResetBody {
  email?: string;
}

export interface VerifyPasswordResetOtpBody {
  email?: string;
  otp?: string;
}

export interface ResetPasswordBody {
  resetToken?: string;
  newPassword?: string;
}

export interface UpdateCurrentUserBody {
  fullName?: string;
  profilePicture?: string;
}

