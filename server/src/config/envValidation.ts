const KNOWN_PLACEHOLDER_SECRETS = new Set([
  'replace_with_a_secure_random_jwt_secret_key',
  'replace_with_a_secure_random_reset_secret',
  'your_jwt_secret',
  'changeme',
  'secret',
  'serpentis-secret',
]);

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  nodeEnv: string;
}

export function getCorsOrigins(): string[] | '*' {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw || raw === '*') {
    return '*';
  }
  const list = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return list.length > 0 ? list : '*';
}

export function isPlaceholderSecret(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (KNOWN_PLACEHOLDER_SECRETS.has(trimmed.toLowerCase())) return true;
  if (trimmed.toLowerCase().startsWith('replace_with_')) return true;
  return false;
}

export function validateServerEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeEnv = (process.env.NODE_ENV || 'development').trim().toLowerCase();
  const isProd = nodeEnv === 'production';

  const mongoUri = process.env.MONGO_URI?.trim();
  if (!mongoUri) {
    errors.push('MONGO_URI is required.');
  } else if (isProd && /localhost|127\.0\.0\.1/.test(mongoUri)) {
    warnings.push('MONGO_URI points to localhost/127.0.0.1 while NODE_ENV=production.');
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    errors.push('JWT_SECRET is required.');
  } else if (isProd) {
    if (isPlaceholderSecret(jwtSecret) || Buffer.byteLength(jwtSecret, 'utf8') < 32) {
      errors.push(
        'JWT_SECRET in production must be a non-placeholder secret of at least 32 bytes.',
      );
    }
  }

  const corsOrigins = getCorsOrigins();
  if (isProd) {
    if (corsOrigins === '*') {
      errors.push(
        'CORS_ORIGIN must not be "*" or unset in production; provide an explicit comma-separated origin list.',
      );
    } else if (corsOrigins.some((o) => /localhost|127\.0\.0\.1|10\.0\.2\.2/.test(o))) {
      warnings.push('CORS_ORIGIN includes a local development host in production.');
    }
  }

  const resetSecret = process.env.PASSWORD_RESET_SECRET?.trim();
  if (!resetSecret || isPlaceholderSecret(resetSecret) || Buffer.byteLength(resetSecret, 'utf8') < 32) {
    const msg =
      'PASSWORD_RESET_SECRET is missing, placeholder, or <32 bytes (password reset OTP flows will return 503).';
    if (isProd) {
      warnings.push(msg);
    }
  }

  if (isProd && process.env.ENVIRONMENTAL_ALLOW_MOCK_FALLBACK === 'true') {
    warnings.push(
      'ENVIRONMENTAL_ALLOW_MOCK_FALLBACK=true is set in production; failed upstream feeds may serve synthetic fallback markers.',
    );
  }

  if (isProd) {
    const hasSmtp =
      Boolean(process.env.SMTP_HOST?.trim()) &&
      Boolean(process.env.SMTP_USER?.trim()) &&
      Boolean(process.env.SMTP_PASSWORD?.trim());
    if (!hasSmtp) {
      warnings.push('SMTP credentials are not configured; password reset emails will fail.');
    }

    const hasCloudinary =
      Boolean(process.env.CLOUDINARY_CLOUD_NAME?.trim()) &&
      Boolean(process.env.CLOUDINARY_API_KEY?.trim()) &&
      Boolean(process.env.CLOUDINARY_API_SECRET?.trim());
    if (!hasCloudinary) {
      warnings.push('Cloudinary credentials are not configured; image uploads will be unavailable.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    nodeEnv,
  };
}

export function assertValidServerEnvironment(): void {
  const result = validateServerEnvironment();
  for (const warning of result.warnings) {
    console.warn(`[SERPENTIS Config Warning] ${warning}`);
  }
  if (!result.valid) {
    throw new Error(
      `Invalid SERPENTIS server configuration (${result.nodeEnv}): ${result.errors.join(' ')}`,
    );
  }
}
