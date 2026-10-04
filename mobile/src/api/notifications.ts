import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/api';
import type { Notification } from '../types/notification';

interface NotificationsData {
  notifications: Notification[];
}

interface NotificationData {
  notification: Notification;
}

export async function getNotificationsRequest(): Promise<
  ApiResponse<NotificationsData>
> {
  const response = await axiosInstance.get<ApiResponse<NotificationsData>>(
    '/notifications',
  );

  return response.data;
}

export async function markNotificationReadRequest(
  id: string,
): Promise<ApiResponse<NotificationData>> {
  const response = await axiosInstance.patch<ApiResponse<NotificationData>>(
    `/notifications/${id}/read`,
  );

  return response.data;
}

export async function markAllNotificationsReadRequest(): Promise<
  ApiResponse<undefined>
> {
  const response = await axiosInstance.patch<ApiResponse<undefined>>(
    '/notifications/read-all',
  );

  return response.data;
}
