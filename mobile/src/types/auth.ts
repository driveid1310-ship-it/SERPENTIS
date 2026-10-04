import type { User } from './user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}

export interface RequestPasswordResetData {
  accepted: true;
  expiresInSeconds: number;
  resendAfterSeconds: number;
}

export interface VerifyPasswordResetOtpCredentials {
  email: string;
  otp: string;
}

export interface PasswordResetGrant {
  resetToken: string;
  expiresInSeconds: number;
}

export interface ResetPasswordCredentials {
  resetToken: string;
  newPassword: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
