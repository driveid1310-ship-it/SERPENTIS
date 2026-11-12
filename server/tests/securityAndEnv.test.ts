import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import {
  getCorsOrigins,
  isPlaceholderSecret,
  validateServerEnvironment,
} from '../src/config/envValidation.js';
import { escapeRegex } from '../src/utils/regex.js';

function startTestServer(): Promise<{ server: any; baseUrl: string }> {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

test('validateServerEnvironment rejects missing or weak production configuration', () => {
  const prev = { ...process.env };
  try {
    process.env.NODE_ENV = 'production';
    process.env.MONGO_URI = 'mongodb://db.internal:27017/serpentis';
    process.env.JWT_SECRET = 'replace_with_a_secure_random_jwt_secret_key';
    process.env.CORS_ORIGIN = '*';

    const weakResult = validateServerEnvironment();
    assert.equal(weakResult.valid, false);
    assert.ok(weakResult.errors.some((e) => e.includes('JWT_SECRET')));
    assert.ok(weakResult.errors.some((e) => e.includes('CORS_ORIGIN')));

    process.env.JWT_SECRET = '9f8e7d6c5b4a392817263544536271809a8b7c6d';
    process.env.CORS_ORIGIN = 'https://app.serpentis.app,https://admin.serpentis.app';
    process.env.PASSWORD_RESET_SECRET = '0a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_USER = 'mailer';
    process.env.SMTP_PASSWORD = 'configured';
    process.env.CLOUDINARY_CLOUD_NAME = 'serpentis';
    process.env.CLOUDINARY_API_KEY = 'key';
    process.env.CLOUDINARY_API_SECRET = 'secret';

    const strongResult = validateServerEnvironment();
    assert.equal(strongResult.valid, true);
    assert.equal(strongResult.errors.length, 0);
    assert.deepEqual(getCorsOrigins(), [
      'https://app.serpentis.app',
      'https://admin.serpentis.app',
    ]);
  } finally {
    process.env = prev;
  }
});

test('isPlaceholderSecret detects common unsafe defaults and escapeRegex neutralizes ReDoS input', () => {
  assert.equal(isPlaceholderSecret(undefined), true);
  assert.equal(isPlaceholderSecret('replace_with_something'), true);
  assert.equal(isPlaceholderSecret('changeme'), true);
  assert.equal(isPlaceholderSecret('a9f4b2c8d1e7f3a5b9c2d4e6f8a1b3c5'), false);

  const escaped = escapeRegex('(a+)+$ [badlapur].*');
  assert.equal(escaped, '\\(a\\+\\)\\+\\$ \\[badlapur\\]\\.\\*');
  assert.doesNotThrow(() => new RegExp(escaped, 'i'));
});

test('Protected civic/admin/SOS/upload routes enforce auth, security headers, and MIME limits', async () => {
  const prevSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-release-hardening-secret-32-bytes-minimum';
  const { server, baseUrl } = await startTestServer();
  try {
    // Missing token rejected with 401
    const sosRes = await fetch(`${baseUrl}/api/sos`);
    assert.equal(sosRes.status, 401);

    const adminRes = await fetch(`${baseUrl}/api/admin/dashboard`);
    assert.equal(adminRes.status, 401);

    // Expired JWT token rejected cleanly with 401
    const expiredToken = jwt.sign({ userId: '000000000000000000000001' }, process.env.JWT_SECRET, {
      expiresIn: '-10s',
    });
    const expiredRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(expiredRes.status, 401);
    const expiredJson = (await expiredRes.json()) as any;
    assert.equal(expiredJson.success, false);
    assert.match(expiredJson.message, /expired/i);

    // Non-image upload rejected with 415 Unsupported Media Type before hitting Cloudinary
    const validToken = jwt.sign({ userId: '000000000000000000000001' }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });
    const form = new FormData();
    form.append('image', new Blob(['#!/bin/sh\nrm -rf'], { type: 'text/plain' }), 'payload.sh');
    const uploadRes = await fetch(`${baseUrl}/api/reports/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${validToken}` },
      body: form,
    });
    assert.equal(uploadRes.status, 415);
    const uploadJson = (await uploadRes.json()) as any;
    assert.equal(uploadJson.success, false);
    assert.match(uploadJson.message, /JPEG, PNG, and WebP/i);

    // Rate-limit headers present on environmental API
    const envRes = await fetch(`${baseUrl}/api/environment/locations`);
    assert.equal(envRes.status, 200);
    assert.ok(envRes.headers.get('x-ratelimit-limit'));
    assert.equal(envRes.headers.get('x-frame-options'), 'DENY');
    assert.equal(envRes.headers.get('referrer-policy'), 'no-referrer');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    if (prevSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = prevSecret;
    }
  }
});
