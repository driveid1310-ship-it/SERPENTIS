export type NotificationType = 'report' | 'badge' | 'sos' | 'system';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
