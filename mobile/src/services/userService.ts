import axios from 'axios';
import { updateCurrentUserRequest } from '../api/users';
import type { UpdateCurrentUserPayload, User } from '../types/user';

export class UserServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserServiceError';
  }
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (!error.response) {
      return 'Unable to reach the server. Please check your connection and try again.';
    }
  }

  return 'Unable to update your profile. Please try again.';
}

export async function updateCurrentUser(
  payload: UpdateCurrentUserPayload,
): Promise<User> {
  try {
    const response = await updateCurrentUserRequest(payload);

    if (!response.success) {
      throw new UserServiceError(response.message);
    }

    return response.data.user;
  } catch (error) {
    if (error instanceof UserServiceError) {
      throw error;
    }

    throw new UserServiceError(getErrorMessage(error));
  }
}