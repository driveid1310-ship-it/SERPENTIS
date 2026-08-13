import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'report'
  | 'badge'
  | 'sos'
  | 'system';

export interface INotification extends Document {
  user: Types.ObjectId;

  title: string;

  message: string;

  type: NotificationType;

  isRead: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const NOTIFICATION_TYPES: NotificationType[] = [
  'report',
  'badge',
  'sos',
  'system',
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
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = model<INotification>(
  'Notification',
  notificationSchema,
);

export default Notification;