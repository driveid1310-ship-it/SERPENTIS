import type { Request, Response } from "express";
import streamifier from "streamifier";
import { getCloudinary } from "../config/cloudinary.js";

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function detectImageMimeType(buffer: Buffer): string | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = getCloudinary().uploader.upload_stream(
      {
        folder: "serpentis/reports",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(new Error("Cloudinary image upload failed."));
          return;
        }

        resolve(result.secure_url);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function uploadReportImage(
  req: Request,
  res: Response,
): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({
      success: false,
      message: "One image file is required.",
    });
    return;
  }

  const detectedMimeType = detectImageMimeType(file.buffer);
  if (
    !IMAGE_MIME_TYPES.has(file.mimetype) ||
    detectedMimeType !== file.mimetype
  ) {
    res.status(415).json({
      success: false,
      message: "The uploaded file is not a supported image.",
    });
    return;
  }

  try {
    const url = await uploadToCloudinary(file.buffer);
    res.status(201).json({
      success: true,
      data: { url },
    });
  } catch (error: unknown) {
    const errorDetails =
      typeof error === "object" && error !== null
        ? (error as Record<string, unknown>)
        : {};
    const responseDetails =
      typeof errorDetails.response === "object" &&
      errorDetails.response !== null
        ? (errorDetails.response as Record<string, unknown>)
        : {};
    const sanitizeText = (value: unknown): string | undefined =>
      typeof value === "string"
        ? value
            .replace(/(?:https?|cloudinary):\/\/[^\s"'<>]+/gi, "[URL REDACTED]")
            .replace(
              /\b(authorization|api[_-]?key|api[_-]?secret|token|password|cloud[_-]?name)\b\s*[:=]\s*(?:bearer\s+)?[^\s,;]+/gi,
              "$1=[REDACTED]",
            )
            .replace(/\bbearer\s+[^\s,;]+/gi, "Bearer [REDACTED]")
        : undefined;
    const numericStatus = (value: unknown): number | undefined =>
      typeof value === "number" && Number.isFinite(value)
        ? value
        : undefined;

    console.error(
      "Cloudinary image upload failed:",
      JSON.stringify({
        name: sanitizeText(errorDetails.name) ?? "UnknownError",
        message: sanitizeText(errorDetails.message) ?? "No error message available",
        code: sanitizeText(errorDetails.code),
        statusCode: numericStatus(
          errorDetails.statusCode ?? errorDetails.http_code,
        ),
        httpStatus: numericStatus(
          responseDetails.status ?? errorDetails.status,
        ),
      }),
    );

    res.status(502).json({
      success: false,
      message: "Image upload failed. Please try again.",
    });
  }
}
