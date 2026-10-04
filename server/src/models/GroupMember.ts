import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMember extends Document {
  group: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: 'admin' | 'member';
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const groupMemberSchema = new Schema(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate memberships
groupMemberSchema.index({ group: 1, user: 1 }, { unique: true });

export const GroupMember = mongoose.model<IGroupMember>('GroupMember', groupMemberSchema);
