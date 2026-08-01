import type { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";

import PublicService, {
  SERVICE_CATEGORIES,
  type ServiceCategory,
} from "../models/PublicService.js";

import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const isValidCategory = (
  category: string,
): category is ServiceCategory => {
  return SERVICE_CATEGORIES.includes(
    category as ServiceCategory,
  );
};

function getPagination(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

// =======================================================
// GET ALL SERVICES
// =======================================================

export async function getAllServices(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit, skip } =
      getPagination(req);

    const total =
      await PublicService.countDocuments();

    const services =
      await PublicService.find()
        .sort({
          name: 1,
        })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(
            total / limit,
          ),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// =======================================================
// GET SERVICE BY ID
// =======================================================

export async function getServiceById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid service ID.",
      });
      return;
    }

    const service =
      await PublicService.findById(id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        service,
      },
    });
  } catch (error) {
    next(error);
  }
}
// =======================================================
// CREATE SERVICE
// =======================================================

export async function createService(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      name,
      description,
      category,
      address,
      phone,
      email,
      website,
      openingHours,
      isEmergency,
      images,
      location,
    } = req.body;

    if (!isValidCategory(category)) {
      res.status(400).json({
        success: false,
        message: "Invalid service category.",
      });
      return;
    }

    const service = await PublicService.create({
      name,
      description,
      category,
      address,
      phone,
      email,
      website,
      openingHours,
      isEmergency,
      images,
      location,
    });

    res.status(201).json({
      success: true,
      message: "Public service created successfully.",
      data: {
        service,
      },
    });
  } catch (error) {
    next(error);
  }
}

// =======================================================
// UPDATE SERVICE
// =======================================================

export async function updateService(
  req: AuthenticatedRequest & {
    params: {
      id: string;
    };
  },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid service ID.",
      });
      return;
    }

    if (
      req.body.category &&
      !isValidCategory(req.body.category)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid service category.",
      });
      return;
    }

    const service =
      await PublicService.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Public service updated successfully.",
      data: {
        service,
      },
    });
  } catch (error) {
    next(error);
  }
}
// =======================================================
// DELETE SERVICE
// =======================================================

export async function deleteService(
  req: AuthenticatedRequest & {
    params: {
      id: string;
    };
  },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid service ID.",
      });
      return;
    }

    const service = await PublicService.findById(id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service not found.",
      });
      return;
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: "Public service deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

// =======================================================
// SEARCH SERVICES
// =======================================================

export async function searchServices(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = req.query.query;

    if (
      typeof query !== "string" ||
      query.trim() === ""
    ) {
      res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
      return;
    }

    const { page, limit, skip } =
      getPagination(req);

    const filter = {
      $or: [
        {
          name: {
            $regex: query,
            $options: "i",
          },
        },
        {
          description: {
            $regex: query,
            $options: "i",
          },
        },
        {
          address: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    };

    const total =
      await PublicService.countDocuments(filter);

    const services =
      await PublicService.find(filter)
        .sort({
          name: 1,
        })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(
            total / limit,
          ),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
// =======================================================
// GET NEARBY SERVICES
// =======================================================

export async function getNearbyServices(
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
        message: "Valid longitude, latitude and distance are required.",
      });
      return;
    }

    const { page, limit, skip } = getPagination(req);

    const filter = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    };

    const total = await PublicService.countDocuments(filter);

    const services = await PublicService.find(filter)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// =======================================================
// GET SERVICES BY CATEGORY
// =======================================================

export async function getServicesByCategory(
  req: Request<{ category: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = req.params.category;

    if (!category || !isValidCategory(category)) {
  res.status(400).json({
    success: false,
    message: "Invalid service category.",
  });
  return;
}
    const { page, limit, skip } = getPagination(req);

    const filter = {
      category,
    };

    const total = await PublicService.countDocuments(filter);

    const services = await PublicService.find(filter)
      .sort({
        name: 1,
      })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
