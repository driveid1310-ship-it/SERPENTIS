import { Schema, model, Types } from 'mongoose';

export interface IComment {
  content: string;
  report: Types.ObjectId;
  user: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 500,
    },
    report: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ report: 1 });
commentSchema.index({ user: 1 });

const Comment = model<IComment>('Comment', commentSchema);

export default Comment;