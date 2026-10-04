import { useCallback, useEffect, useState } from 'react';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NotificationServiceError,
} from '../services/notificationService';
import type { Notification } from '../types/notification';

export type NotificationsStatus = 'loading' | 'success' | 'empty' | 'error';

interface UseNotificationsResult {
  status: NotificationsStatus;
  notifications: Notification[];
  errorMessage: string | null;
  refetch: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const [status, setStatus] = useState<NotificationsStatus>('loading');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    let isActive = true;

    setStatus('loading');
    setErrorMessage(null);

    fetchNotifications()
      .then((result) => {
        if (!isActive) {
          return;
        }
        setNotifications(result);
        setStatus(result.length === 0 ? 'empty' : 'success');
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        setNotifications([]);
        setStatus('error');
        setErrorMessage(
          error instanceof NotificationServiceError
            ? error.message
            : 'Something went wrong while loading notifications.',
        );
      });

    return () => {
      isActive = false;
    };
  }, [refetchIndex]);

  const refetch = useCallback(() => {
    setRefetchIndex((previous) => previous + 1);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((previous) =>
        previous.map((item) =>
          item._id === id ? { ...item, isRead: true } : item,
        ),
      );
    } catch {
      // Request failed — leave existing state untouched.
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true })),
      );
    } catch {
      // Request failed — leave existing state untouched.
    }
  }, []);

  return {
    status,
    notifications,
    errorMessage,
    refetch,
    markAsRead,
    markAllAsRead,
  };
}

export default useNotifications;
