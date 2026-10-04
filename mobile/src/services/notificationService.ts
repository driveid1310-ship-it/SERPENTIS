import axios from 'axios';
import {
  getNotificationsRequest,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
} from '../api/notifications';
import type { Notification } from '../types/notification';

export class NotificationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotificationServiceError';
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

export async function fetchNotifications(): Promise<Notification[]> {
  try {
    const response = await getNotificationsRequest();

    if (!response.success) {
      throw new NotificationServiceError(response.message);
    }

    return response.data.notifications;
  } catch (error) {
    if (error instanceof NotificationServiceError) {
      throw error;
    }
    throw new NotificationServiceError(
      extractErrorMessage(
        error,
        'Unable to load notifications. Please try again.',
      ),
    );
  }
}

export async function markNotificationAsRead(
  id: string,
): Promise<Notification> {
  try {
    const response = await markNotificationReadRequest(id);

    if (!response.success) {
      throw new NotificationServiceError(response.message);
    }

    return response.data.notification;
  } catch (error) {
    if (error instanceof NotificationServiceError) {
      throw error;
    }
    throw new NotificationServiceError(
      extractErrorMessage(
        error,
        'Unable to mark notification as read.',
      ),
    );
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const response = await markAllNotificationsReadRequest();

    if (!response.success) {
      throw new NotificationServiceError(response.message);
    }
  } catch (error) {
    if (error instanceof NotificationServiceError) {
      throw error;
    }
    throw new NotificationServiceError(
      extractErrorMessage(
        error,
        'Unable to mark all notifications as read.',
      ),
    );
  }
}
