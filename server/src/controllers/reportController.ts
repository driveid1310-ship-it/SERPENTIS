import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

import Report from "../models/Report.js";
import type {
  ReportCategory,
  ReportStatus,
  ReportPriority,
} from "../models/Report.js";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface GeoJSONPointInput {
  type?: string;
  coordinates?: number[];
}

interface CreateReportRequestBody {
  title?: string;
  description?: string;
  category?: ReportCategory;
  images?: string[];
  location?: GeoJSONPointInput;
  priority?: ReportPriority;
}

interface UpdateReportRequestBody {
  title?: string;
  description?: string;
  category?: ReportCategory;
  status?: ReportStatus;
  images?: string[];
  location?: GeoJSONPointInput;
  priority?: ReportPriority;
  isDuplicate?: boolean;
}

interface GetAllReportsQuery {
  category?: string;
  status?: string;
  priority?: string;
  page?: string;
  limit?: string;
  near?: string;
  maxDistance?: string;
}

const VALID_CATEGORIES: ReportCategory[] = [
  'pothole',
  'garbage',
  'water-leakage',
  'streetlight',
  'traffic',
  'pollution',
  'stray-animals',
  'other',
];

const VALID_STATUSES: ReportStatus[] = [
  'pending',
  'in-progress',
  'resolved',
  'rejected',
];

const VALID_PRIORITIES: ReportPriority[] = ['low', 'medium', 'high'];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_MAX_DISTANCE_METERS = 5000;

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

function isValidImagesArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string' && item.trim().length > 0)
  );
}

export async function createReport(
  req: AuthenticatedRequest & { body: CreateReportRequestBody },
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

    const { title, description, category, images, location, priority } =
      req.body;

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: 'Title is required and must be at least 3 characters long.',
      });
      return;
    }

    if (
      !description ||
      typeof description !== 'string' ||
      description.trim().length < 10
    ) {
      res.status(400).json({
        success: false,
        message:
          'Description is required and must be at least 10 characters long.',
      });
      return;
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      res.status(400).json({
        success: false,
        message: 'A valid category is required.',
      });
      return;
    }

    if (!isValidGeoJSONPoint(location)) {
      res.status(400).json({
        success: false,
        message:
          'A valid GeoJSON Point location with [longitude, latitude] coordinates is required.',
      });
      return;
    }

    if (images !== undefined && !isValidImagesArray(images)) {
      res.status(400).json({
        success: false,
        message: 'Images must be an array of non-empty URL strings.',
      });
      return;
    }

    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      res.status(400).json({
        success: false,
        message: 'Invalid priority provided.',
      });
      return;
    }
    const existingDuplicate = await Report.findOne({
  category,
  isDuplicate: false,
  location: {
    $near: {
      $geometry: location,
      $maxDistance: 50,
    },
  },
});

const newReport = await Report.create({
  title: title.trim(),
  description: description.trim(),
  category,
  images: images ?? [],
  location,
  reportedBy: req.userId,
  priority: priority ?? 'low',
  isDuplicate: !!existingDuplicate,
  });
    const populatedReport = await newReport.populate('reportedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Report created successfully.',
      data: {
        report: populatedReport,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllReports(
  req: Request<unknown, unknown, unknown, GetAllReportsQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { category, status, priority, page, limit, near, maxDistance } =
      req.query;

    const filter: Record<string, unknown> = {};

    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category as ReportCategory)) {
        res.status(400).json({
          success: false,
          message: 'Invalid category filter provided.',
        });
        return;
      }
      filter.category = category;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status as ReportStatus)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status filter provided.',
        });
        return;
      }
      filter.status = status;
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority as ReportPriority)) {
        res.status(400).json({
          success: false,
          message: 'Invalid priority filter provided.',
        });
        return;
      }
      filter.priority = priority;
    }

    if (near !== undefined) {
      const coordinates = near.split(',').map((value) => Number(value.trim()));

      if (
        coordinates.length !== 2 ||
        coordinates.some((value) => Number.isNaN(value))
      ) {
        res.status(400).json({
          success: false,
          message: 'near must be in the format "longitude,latitude".',
        });
        return;
      }

      const longitude = coordinates[0]!;
      const latitude = coordinates[1]!;

      if (
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        res.status(400).json({
          success: false,
          message: 'near coordinates are out of valid range.',
        });
        return;
      }

      const parsedMaxDistance = Number.parseInt(maxDistance ?? '', 10);
      const distanceInMeters =
        Number.isFinite(parsedMaxDistance) && parsedMaxDistance > 0
          ? parsedMaxDistance
          : DEFAULT_MAX_DISTANCE_METERS;

      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: distanceInMeters,
        },
      };
    }

    const parsedPage = Number.parseInt(page ?? '', 10);
    const parsedLimit = Number.parseInt(limit ?? '', 10);

    const currentPage =
      Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : DEFAULT_PAGE;
    const currentLimit =
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;

    const skip = (currentPage - 1) * currentLimit;

    const query = Report.find(filter).populate('reportedBy', 'name email');

    if (!near) {
      query.sort({ createdAt: -1 });
    }

    const [reports, totalCount] = await Promise.all([
      query.skip(skip).limit(currentLimit),
      Report.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage,
          limit: currentLimit,
          totalCount,
          totalPages: Math.ceil(totalCount / currentLimit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getReportById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid report ID.',
      });
      return;
    }

    const report = await Report.findById(id).populate(
      'reportedBy',
      'name email',
    );

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        report,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReport(
  req: AuthenticatedRequest & {
    params: { id: string };
    body: UpdateReportRequestBody;
  },
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

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid report ID.',
      });
      return;
    }

    const existingReport = await Report.findById(id);

    if (!existingReport) {
      res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
      return;
    }

    if (existingReport.reportedBy.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to update this report.',
      });
      return;
    }

    const {
      title,
      description,
      category,
      status,
      images,
      location,
      priority,
      isDuplicate,
    } = req.body;

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length < 3) {
        res.status(400).json({
          success: false,
          message: 'Title must be at least 3 characters long.',
        });
        return;
      }
      existingReport.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length < 10) {
        res.status(400).json({
          success: false,
          message: 'Description must be at least 10 characters long.',
        });
        return;
      }
      existingReport.description = description.trim();
    }

    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category)) {
        res.status(400).json({
          success: false,
          message: 'Invalid category provided.',
        });
        return;
      }
      existingReport.category = category;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status provided.',
        });
        return;
      }
      existingReport.status = status;
    }

    if (location !== undefined) {
      if (!isValidGeoJSONPoint(location)) {
        res.status(400).json({
          success: false,
          message:
            'A valid GeoJSON Point location with [longitude, latitude] coordinates is required.',
        });
        return;
      }
      existingReport.location = location;
    }

    if (images !== undefined) {
      if (!isValidImagesArray(images)) {
        res.status(400).json({
          success: false,
          message: 'Images must be an array of non-empty URL strings.',
        });
        return;
      }
      existingReport.images = images;
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        res.status(400).json({
          success: false,
          message: 'Invalid priority provided.',
        });
        return;
      }
      existingReport.priority = priority;
    }

    if (isDuplicate !== undefined) {
      if (typeof isDuplicate !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'isDuplicate must be a boolean value.',
        });
        return;
      }
      existingReport.isDuplicate = isDuplicate;
    }

    const updatedReport = await existingReport.save();
    const populatedReport = await updatedReport.populate(
      'reportedBy',
      'name email',
    );

    res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      data: {
        report: populatedReport,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReport(
  req: AuthenticatedRequest & { params: { id: string } },
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

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid report ID.',
      });
      return;
    }

    const existingReport = await Report.findById(id);

    if (!existingReport) {
      res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
      return;
    }

    if (existingReport.reportedBy.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this report.',
      });
      return;
    }

    await existingReport.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getNearbyReports(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { lng, lat, distance } = req.query;

    const longitude = Number(lng);
    const latitude = Number(lat);
    const maxDistance = Number(distance);

    if (
      Number.isNaN(longitude) ||
      Number.isNaN(latitude) ||
      Number.isNaN(maxDistance)
    ) {
      res.status(400).json({
        success: false,
        message: "Valid lng, lat and distance query parameters are required.",
      });
      return;
    }

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        reports,
      },
    });

  } catch (error) {
    next(error);
  }
}

export async function upvoteReport(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    try {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated.',
    });
    return;
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid report ID.',
    });
    return;
  }

  const report = await Report.findById(id);

  if (!report) {
    res.status(404).json({
      success: false,
      message: 'Report not found.',
    });
    return;
  }

  const alreadyUpvoted = report.upvotes.some(
    (userId) => userId.toString() === req.userId,
  );

  if (alreadyUpvoted) {
    res.status(400).json({
      success: false,
      message: 'You have already upvoted this report.',
    });
    return;
  }

  report.upvotes.push(new Types.ObjectId(req.userId));
  await report.save();

  res.status(200).json({
    success: true,
    message: 'Report upvoted successfully.',
    data: {
      upvotes: report.upvotes.length,
    },
  });
} catch (error) {
  next(error);
}
    

  } catch (error) {
    next(error);
  }
}

export async function removeUpvote(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    try {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated.',
    });
    return;
  }

  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid report ID.',
    });
    return;
  }

  const report = await Report.findById(id);

  if (!report) {
    res.status(404).json({
      success: false,
      message: 'Report not found.',
    });
    return;
  }

  const alreadyUpvoted = report.upvotes.some(
    (userId) => userId.toString() === req.userId,
  );

  if (!alreadyUpvoted) {
    res.status(400).json({
      success: false,
      message: 'You have not upvoted this report.',
    });
    return;
  }

  report.upvotes = report.upvotes.filter(
    (userId) => userId.toString() !== req.userId,
  );

  await report.save();

  res.status(200).json({
    success: true,
    message: 'Upvote removed successfully.',
    data: {
      upvotes: report.upvotes.length,
    },
  });
} catch (error) {
  next(error);
}

  } catch (error) {
    next(error);
  }
}
