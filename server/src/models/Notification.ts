import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'report'
  | 'badge'
  | 'sos'
  | 'system'
  | 'environmental-alert';

export interface INotification extends Document {
  user: Types.ObjectId;

  title: string;

  message: string;

  type: NotificationType;

  isRead: boolean;

  metadata?: Record<string, unknown> | undefined;

  createdAt: Date;
  updatedAt: Date;
}

const NOTIFICATION_TYPES: NotificationType[] = [
  'report',
  'badge',
  'sos',
  'system',
  'environmental-alert',
];

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: 'Invalid notification type.',
      },
      default: 'system',
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = model<INotification>(
  'Notification',
  notificationSchema,
);

export default Notification;