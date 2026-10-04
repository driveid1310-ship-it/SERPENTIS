import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'node:crypto';
import type { Types } from 'mongoose';
import PasswordReset, {
  type PasswordResetRecordType,
} from '../models/PasswordReset.js';
import User from '../models/User.js';

const OTP_LIFETIME_MS = 10 * 60 * 1000;
const RESET_GRANT_LIFETIME_MS = 10 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_RECORD_LIFETIME_MS = 48 * 60 * 60 * 1000;
const EMAIL_REQUEST_LIMIT = 5;
const IP_REQUEST_LIMIT = 20;
const EMAIL_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

export class PasswordResetConfigurationError extends Error {
  constructor() {
    super('Password reset secret is not configured securely.');
    this.name = 'PasswordResetConfigurationError';
  }
}

function getPasswordResetSecret(): string {
  const secret = process.env.PASSWORD_RESET_SECRET;

  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new PasswordResetConfigurationError();
  }

  return secret;
}

function createDigest(value: string, purpose: string): string {
  return createHmac('sha256', getPasswordResetSecret())
    .update(`${purpose}:${value}`)
    .digest('hex');
}

function getEmailKey(email: string): string {
  return `email:${createDigest(email, 'email-key')}`;
}

function getIpKey(ipAddress: string): string {
  return `ip:${createDigest(ipAddress, 'ip-key')}`;
}

function digestMatches(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

async function reserveRequestSlot(
  key: string,
  recordType: PasswordResetRecordType,
  maxRequests: number,
  cooldownMs: number,
): Promise<boolean> {
  const now = new Date();
  const windowStartedBefore = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);
  const cooldownBefore = new Date(now.getTime() - cooldownMs);
  const rateLimitExpiresAt = new Date(
    now.getTime() + RATE_LIMIT_RECORD_LIFETIME_MS,
  );

  try {
    await PasswordReset.updateOne(
      { key, recordType },
      {
        $setOnInsert: {
          key,
          recordType,
          attemptCount: 0,
          requestCount: 0,
          requestWindowStartedAt: new Date(0),
          lastRequestedAt: new Date(0),
          rateLimitExpiresAt,
        },
      },
      { upsert: true },
    );
  } catch (error) {
    if (
      !(
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      )
    ) {
      throw error;
    }
  }

  const resetWindow = {
    $lte: ['$requestWindowStartedAt', windowStartedBefore],
  };
  const updated = await PasswordReset.findOneAndUpdate(
    {
      key,
      recordType,
      lastRequestedAt: { $lte: cooldownBefore },
      $or: [
        { requestWindowStartedAt: { $lte: windowStartedBefore } },
        { requestCount: { $lt: maxRequests } },
      ],
    },
    [
      {
        $set: {
          requestWindowStartedAt: {
            $cond: [resetWindow, now, '$requestWindowStartedAt'],
          },
          requestCount: {
            $cond: [
              resetWindow,
              1,
              { $add: ['$requestCount', 1] },
            ],
          },
          lastRequestedAt: now,
          rateLimitExpiresAt,
          updatedAt: now,
        },
      },
    ],
    { new: true, updatePipeline: true },
  );

  return updated !== null;
}

export async function reservePasswordResetRequest(
  email: string,
  ipAddress: string,
): Promise<boolean> {
  const ipSlotReserved = await reserveRequestSlot(
    getIpKey(ipAddress),
    'ip',
    IP_REQUEST_LIMIT,
    0,
  );

  if (!ipSlotReserved) {
    return false;
  }

  return reserveRequestSlot(
    getEmailKey(email),
    'email',
    EMAIL_REQUEST_LIMIT,
    EMAIL_RESEND_COOLDOWN_MS,
  );
}

export async function issuePasswordResetOtp(
  email: string,
  userId: Types.ObjectId | null,
): Promise<string> {
  const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
  const now = new Date();

  const result = await PasswordReset.updateOne(
    {
      key: getEmailKey(email),
      recordType: 'email',
    },
    {
      $set: {
        ...(userId ? { userId } : {}),
        otpDigest: createDigest(otp, 'otp'),
        otpExpiresAt: new Date(now.getTime() + OTP_LIFETIME_MS),
        attemptCount: 0,
        rateLimitExpiresAt: new Date(
          now.getTime() + RATE_LIMIT_RECORD_LIFETIME_MS,
        ),
      },
      $unset: {
        ...(userId ? {} : { userId: 1 }),
        resetGrantDigest: 1,
        resetGrantExpiresAt: 1,
        consumedAt: 1,
      },
    },
  );

  if (result.matchedCount !== 1) {
    throw new Error('Password reset rate-limit record is unavailable.');
  }

  return otp;
}

export async function verifyPasswordResetOtp(
  email: string,
  otp: string,
): Promise<{ resetToken: string; expiresInSeconds: number } | null> {
  const key = getEmailKey(email);
  const now = new Date();
  const record = await PasswordReset.findOne({
    key,
    recordType: 'email',
    otpDigest: { $exists: true },
    otpExpiresAt: { $gt: now },
    attemptCount: { $lt: MAX_OTP_ATTEMPTS },
    userId: { $exists: true },
    resetGrantDigest: { $exists: false },
  }).select('otpDigest');

  if (!record?.otpDigest) {
    return null;
  }

  const suppliedDigest = createDigest(otp, 'otp');

  if (!digestMatches(record.otpDigest, suppliedDigest)) {
    await PasswordReset.updateOne(
      {
        key,
        recordType: 'email',
        otpDigest: { $exists: true },
        otpExpiresAt: { $gt: now },
        attemptCount: { $lt: MAX_OTP_ATTEMPTS },
        userId: { $exists: true },
        resetGrantDigest: { $exists: false },
      },
      { $inc: { attemptCount: 1 } },
    );
    return null;
  }

  const resetToken = randomBytes(32).toString('base64url');
  const grantExpiresAt = new Date(now.getTime() + RESET_GRANT_LIFETIME_MS);
  const consumedOtp = await PasswordReset.findOneAndUpdate(
    {
      key,
      recordType: 'email',
      otpDigest: record.otpDigest,
      otpExpiresAt: { $gt: now },
      attemptCount: { $lt: MAX_OTP_ATTEMPTS },
      userId: { $exists: true },
      resetGrantDigest: { $exists: false },
    },
    {
      $set: {
        resetGrantDigest: createDigest(resetToken, 'reset-grant'),
        resetGrantExpiresAt: grantExpiresAt,
        rateLimitExpiresAt: new Date(
          now.getTime() + RATE_LIMIT_RECORD_LIFETIME_MS,
        ),
      },
      $unset: {
        otpDigest: 1,
        otpExpiresAt: 1,
        attemptCount: 1,
      },
    },
    { new: true },
  );

  if (!consumedOtp) {
    return null;
  }

  return {
    resetToken,
    expiresInSeconds: RESET_GRANT_LIFETIME_MS / 1000,
  };
}

export async function resetUserPassword(
  resetToken: string,
  newPassword: string,
): Promise<boolean> {
  const now = new Date();
  const consumedReset = await PasswordReset.findOneAndUpdate(
    {
      recordType: 'email',
      resetGrantDigest: createDigest(resetToken, 'reset-grant'),
      resetGrantExpiresAt: { $gt: now },
      consumedAt: { $exists: false },
    },
    {
      $set: { consumedAt: now },
      $unset: {
        resetGrantDigest: 1,
        resetGrantExpiresAt: 1,
      },
    },
    { new: true },
  );

  if (!consumedReset?.userId) {
    return false;
  }

  const user = await User.findById(consumedReset.userId);

  if (!user) {
    return false;
  }

  user.password = newPassword;
  await user.save();
  return true;
}
