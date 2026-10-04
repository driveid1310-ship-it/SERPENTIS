import mongoose, { type Document, Schema, Types } from 'mongoose';

export type PasswordResetRecordType = 'email' | 'ip';

export interface IPasswordReset extends Document {
  key: string;
  recordType: PasswordResetRecordType;
  userId?: Types.ObjectId;
  otpDigest?: string;
  otpExpiresAt?: Date;
  attemptCount: number;
  resetGrantDigest?: string;
  resetGrantExpiresAt?: Date;
  consumedAt?: Date;
  requestCount: number;
  requestWindowStartedAt: Date;
  lastRequestedAt: Date;
  rateLimitExpiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    recordType: {
      type: String,
      enum: ['email', 'ip'],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    otpDigest: String,
    otpExpiresAt: Date,
    attemptCount: {
      type: Number,
      default: 0,
    },
    resetGrantDigest: {
      type: String,
      unique: true,
      sparse: true,
    },
    resetGrantExpiresAt: Date,
    consumedAt: Date,
    requestCount: {
      type: Number,
      default: 0,
    },
    requestWindowStartedAt: {
      type: Date,
      default: Date.now,
    },
    lastRequestedAt: {
      type: Date,
      default: () => new Date(0),
    },
    rateLimitExpiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

PasswordResetSchema.index(
  { rateLimitExpiresAt: 1 },
  { expireAfterSeconds: 0 },
);

export default mongoose.model<IPasswordReset>(
  'PasswordReset',
  PasswordResetSchema,
);
