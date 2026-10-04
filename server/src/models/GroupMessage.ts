import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMessage extends Document {
  group: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  sharedReport?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const groupMessageSchema = new Schema(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    sharedReport: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize sorting by time for a group
groupMessageSchema.index({ group: 1, createdAt: -1 });

export const GroupMessage = mongoose.model<IGroupMessage>('GroupMessage', groupMessageSchema);
