import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/api';
import type {
  AuthData,
  LoginCredentials,
  PasswordResetGrant,
  RequestPasswordResetData,
  RegisterCredentials,
  ResetPasswordCredentials,
  VerifyPasswordResetOtpCredentials,
} from '../types/auth';
import type { User } from '../types/user';

/**
 * Raw HTTP calls to the backend's /api/auth routes.
 * See backend: src/routes/authRoutes.ts, src/controllers/authController.ts
 */

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<ApiResponse<AuthData>> {
  const response = await axiosInstance.post<ApiResponse<AuthData>>(
    '/auth/login',
    credentials,
  );
  return response.data;
}

export async function registerRequest(
  credentials: RegisterCredentials,
): Promise<ApiResponse<AuthData>> {
  const response = await axiosInstance.post<ApiResponse<AuthData>>(
    '/auth/register',
    credentials,
  );
  return response.data;
}

export async function requestPasswordResetRequest(
  email: string,
): Promise<ApiResponse<RequestPasswordResetData>> {
  const response = await axiosInstance.post<
    ApiResponse<RequestPasswordResetData>
  >('/auth/request-password-reset', { email });
  return response.data;
}

export async function verifyPasswordResetOtpRequest(
  credentials: VerifyPasswordResetOtpCredentials,
): Promise<ApiResponse<PasswordResetGrant>> {
  const response = await axiosInstance.post<ApiResponse<PasswordResetGrant>>(
    '/auth/verify-reset-otp',
    credentials,
  );
  return response.data;
}

export async function resetPasswordRequest(
  credentials: ResetPasswordCredentials,
): Promise<ApiResponse<{ reset: true }>> {
  const response = await axiosInstance.post<ApiResponse<{ reset: true }>>(
    '/auth/reset-password',
    credentials,
  );
  return response.data;
}

export async function getCurrentUserRequest(): Promise<ApiResponse<{ user: User }>> {
  const response = await axiosInstance.get<ApiResponse<{ user: User }>>(
    '/auth/me',
  );

  return response.data;
}