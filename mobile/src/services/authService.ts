import axios from 'axios';
import {
  loginRequest,
  registerRequest,
  getCurrentUserRequest,
  requestPasswordResetRequest,
  verifyPasswordResetOtpRequest,
  resetPasswordRequest,
} from '../api/auth';
import type {
  AuthData,
  LoginCredentials,
  PasswordResetGrant,
  ResetPasswordCredentials,
  RegisterCredentials,
  RequestPasswordResetData,
  VerifyPasswordResetOtpCredentials,
} from '../types/auth';
import type { User } from '../types/user';

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;

    if (
      data &&
      typeof data.message === 'string' &&
      data.message.trim().length > 0
    ) {
      return data.message;
    }

    if (!error.response) {
      return 'Unable to reach the server. Please check your connection and try again.';
    }
  }

  return fallback;
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthData> {
  try {
    const response = await loginRequest(credentials);

    if (!response.success) {
      throw new AuthServiceError(response.message);
    }

    return response.data;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError(
      extractErrorMessage(error, 'Unable to log in. Please try again.'),
    );
  }
}
export async function register(
  credentials: RegisterCredentials,
): Promise<AuthData> {
  try {
    const response = await registerRequest(credentials);

    if (!response.success) {
      throw new AuthServiceError(response.message);
    }

    return response.data;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError(
      extractErrorMessage(error, 'Unable to create account. Please try again.'),
    );
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await getCurrentUserRequest();

    if (!response.success) {
      throw new AuthServiceError(response.message);
    }

    return response.data.user;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError(
      extractErrorMessage(error, 'Unable to restore your session.'),
    );
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<RequestPasswordResetData> {
  try {
    const response = await requestPasswordResetRequest(email);

    if (!response.success) {
      throw new AuthServiceError(response.message);
    }

    return response.data;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError(
      extractErrorMessage(
        error,
        'Unable to request a password reset. Please try again.',
      ),
    );
  }
}

export async function verifyPasswordResetOtp(
  credentials: VerifyPasswordResetOtpCredentials,
): Promise<PasswordResetGrant> {
  try {
    const response = await verifyPasswordResetOtpRequest(credentials);

    if (!response.success) {
      throw new AuthServiceError(response.message);
    }

    return response.data;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError(
      extractErrorMessage(
        error,
        'Unable to verify this code. Please try again.',
      ),
    );
  }
}

export async function resetPassword(
  credentials: ResetPasswordCredentials,
): Promise<void> {
  try {
    const response = await resetPasswordRequest(credentials);

    if (!response.success) {
      throw new AuthServiceError(response.message);
    }
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError(
      extractErrorMessage(error, 'Unable to reset your password.'),
    );
  }
}
