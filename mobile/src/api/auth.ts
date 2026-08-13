import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/api';
import type {
  AuthData,
  LoginCredentials,
  RegisterCredentials,
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
export async function getCurrentUserRequest(): Promise<ApiResponse<{ user: User }>> {
  const response = await axiosInstance.get<ApiResponse<{ user: User }>>(
    '/auth/me',
  );

  return response.data;
}