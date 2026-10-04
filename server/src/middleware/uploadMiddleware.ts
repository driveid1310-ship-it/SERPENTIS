import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 10,
  },
  fileFilter: (_req, file, callback) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/webp"
    ) {
      callback(null, true);
      return;
    }

    callback(new UnsupportedReportImageTypeError());
  },
});

export class UnsupportedReportImageTypeError extends Error {
  constructor() {
    super("Only JPEG, PNG, and WebP images are supported.");
    this.name = "UnsupportedReportImageTypeError";
  }
}

export function uploadReportImage(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  upload.single("image")(req, res, (error?: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof UnsupportedReportImageTypeError) {
      res.status(415).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof multer.MulterError) {
      const isTooLarge = error.code === "LIMIT_FILE_SIZE";
      res.status(isTooLarge ? 413 : 400).json({
        success: false,
        message: isTooLarge
          ? "Image must be 5 MB or smaller."
          : "Exactly one image file is allowed.",
      });
      return;
    }

    next(error);
  });
}