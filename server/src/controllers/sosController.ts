import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

import SOS, { SOS_TYPES } from '../models/SOS.js';
import type { SOSType } from '../models/SOS.js';
import User from '../models/User.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

async function isStaffViewer(userId?: string): Promise<boolean> {
  if (!userId) return false;
  const user = await User.findById(userId).select('role').lean();
  return user?.role === 'admin' || user?.role === 'moderator';
}

function sanitizeSosForViewer(doc: any, viewerId?: string, staff = false): any {
  const obj = typeof doc?.toObject === 'function' ? doc.toObject() : { ...doc };
  const reporter = obj.reportedBy;
  if (reporter && typeof reporter === 'object') {
    const reporterId = reporter._id?.toString();
    const isOwner = Boolean(viewerId && reporterId && viewerId === reporterId);
    if (!staff && !isOwner) {
      obj.reportedBy = {
        _id: reporter._id,
        fullName: reporter.fullName || 'Citizen',
      };
    }
  }
  return obj;
}

interface GeoJSONPointInput {
  type?: string;
  coordinates?: number[];
}

interface CreateSOSRequestBody {
  emergencyType?: SOSType;
  message?: string;
  location?: GeoJSONPointInput;
}

function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

function isValidGeoJSONPoint(value: unknown): value is {
  type: 'Point';
  coordinates: [number, number];
} {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const point = value as GeoJSONPointInput;

  if (point.type !== 'Point') {
    return false;
  }

  if (!Array.isArray(point.coordinates) || point.coordinates.length !== 2) {
    return false;
  }

  const longitude = point.coordinates[0]!;
  const latitude = point.coordinates[1]!;

  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    return false;
  }

  if (latitude < -90 || latitude > 90) {
    return false;
  }

  return true;
}

export async function createSOS(
  req: AuthenticatedRequest & { body: CreateSOSRequestBody },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
if (!req.userId) {
  res.status(401).json({
    success: false,
    message: 'Not authenticated.',
  });
  return;
}

const { emergencyType, message, location } = req.body;

if (!emergencyType || !SOS_TYPES.includes(emergencyType)) {
  res.status(400).json({
    success: false,
    message: 'A valid emergency type is required.',
  });
  return;
}

if (!message || message.trim().length === 0) {
  res.status(400).json({
    success: false,
    message: 'Message is required.',
  });
  return;
}

if (!isValidGeoJSONPoint(location)) {
  res.status(400).json({
    success: false,
    message: 'A valid GeoJSON location is required.',
  });
  return;
}

const sos = await SOS.create({
  reportedBy: req.userId,
  emergencyType,
  message: message.trim(),
  location,
});

const populatedSOS = await sos.populate(
  'reportedBy',
  'fullName email phone',
);

res.status(201).json({
  success: true,
  message: 'SOS created successfully.',
  data: {
    sos: populatedSOS,
  },
});
  } catch (error) {
    next(error);
  }
}

export async function getAllSOS(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const staff = await isStaffViewer(req.userId);
    const sosList = await SOS.find({
      status: 'active',
    })
      .populate('reportedBy', 'fullName email phone')
      .sort({ createdAt: -1 });

    const sanitized = sosList.map((doc) => sanitizeSosForViewer(doc, req.userId, staff));

    res.status(200).json({
      success: true,
      data: {
        sos: sanitized,
        count: sanitized.length,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function getNearbySOS(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const latitude = Number(req.query.latitude ?? req.query.lat);
    const longitude = Number(req.query.longitude ?? req.query.lng);

    const maxDistance = req.query.maxDistance
      ? Number(req.query.maxDistance)
      : req.query.distance
        ? Number(req.query.distance)
        : 5000;

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude are required.',
      });
      return;
    }

    const staff = await isStaffViewer(req.userId);
    const sosAlerts = await SOS.find({
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    })
      .populate('reportedBy', 'fullName email phone')
      .sort({ createdAt: -1 });

    const sanitized = sosAlerts.map((doc) => sanitizeSosForViewer(doc, req.userId, staff));

    res.status(200).json({
      success: true,
      data: {
        sos: sanitized,
        count: sanitized.length,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function resolveSOS(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid SOS ID.',
      });
      return;
    }

    const sos = await SOS.findById(id);

    if (!sos) {
      res.status(404).json({
        success: false,
        message: 'SOS alert not found.',
      });
      return;
    }

    sos.status = 'resolved';

    await sos.save();

    await sos.populate('reportedBy', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'SOS alert resolved successfully.',
      data: {
        sos,
      },
    });
  } catch (error) {
    next(error);
  }
}