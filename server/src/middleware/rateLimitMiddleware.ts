import type { Request, Response, NextFunction } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string | undefined;
  message?: string | undefined;
}

/**
 * Lightweight in-memory sliding-window rate limiter middleware.
 * Protects auth, reporting, AI, and environmental endpoints from burst abuse.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();
  const prefix = options.keyPrefix || 'global';
  const message =
    options.message || 'Too many requests. Please slow down and try again shortly.';

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown';
    const key = `${prefix}:${ip}`;
    const now = Date.now();

    // Periodic cleanup if map grows
    if (buckets.size > 5000) {
      for (const [bKey, b] of buckets.entries()) {
        if (now > b.resetAt) buckets.delete(bKey);
      }
    }

    const existing = buckets.get(key);
    if (!existing || now > existing.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, options.maxRequests - 1)));
      next();
      return;
    }

    existing.count += 1;
    const remaining = Math.max(0, options.maxRequests - existing.count);
    res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(remaining));

    if (existing.count > options.maxRequests) {
      const retryAfterSec = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(Math.max(1, retryAfterSec)));
      res.status(429).json({
        success: false,
        message,
      });
      return;
    }

    next();
  };
}
