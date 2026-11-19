export type NotificationType =
  | 'report'
  | 'badge'
  | 'sos'
  | 'system'
  | 'environmental-alert';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
