import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

import SOS from '../models/SOS.js';
import type { SOSType } from '../models/SOS.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
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

if (!emergencyType) {
  res.status(400).json({
    success: false,
    message: 'Emergency type is required.',
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
  'name email',
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
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
   const sosList = await SOS.find({
  status: 'active',
})
  .populate('reportedBy', 'name email')
  .sort({ createdAt: -1 });

res.status(200).json({
  success: true,
  data: {
    sos: sosList,
    count: sosList.length,
  },
});
  } catch (error) {
    next(error);
  }
}
export async function getNearbySOS(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    const maxDistance = req.query.maxDistance
      ? Number(req.query.maxDistance)
      : 5000;

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude are required.',
      });
      return;
    }

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
      .populate('reportedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        sos: sosAlerts,
        count: sosAlerts.length,
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