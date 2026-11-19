import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'AppError';
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isProd = process.env.NODE_ENV === 'production';

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle Mongoose validation / cast errors cleanly without leaking internals
  if (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name?: string }).name === 'ValidationError'
  ) {
    res.status(400).json({
      success: false,
      message: (err as { message?: string }).message || 'Validation failed.',
    });
    return;
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name?: string }).name === 'CastError'
  ) {
    res.status(400).json({
      success: false,
      message: 'Invalid identifier format.',
    });
    return;
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: number }).code === 11000
  ) {
    res.status(409).json({
      success: false,
      message: 'Duplicate resource conflict.',
    });
    return;
  }

  const message =
    err instanceof Error && !isProd
      ? err.message
      : 'An unexpected server error occurred.';

  if (!isProd && err instanceof Error) {
    console.error('[SERPENTIS Error]', err.message);
  }

  res.status(500).json({
    success: false,
    message,
  });
}
