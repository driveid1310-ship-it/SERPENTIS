import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description: string;
  category: string;
  creator: mongoose.Types.ObjectId;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    category: {
      type: String,
      required: true,
      enum: ['Civic', 'Local Area', 'Safety', 'Environment', 'Infrastructure', 'Heritage', 'Students', 'Residents', 'Other'],
      default: 'Other',
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    memberCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const Group = mongoose.model<IGroup>('Group', groupSchema);
