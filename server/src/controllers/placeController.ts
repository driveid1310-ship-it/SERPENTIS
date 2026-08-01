import type { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";

import Place, {
  PLACE_CATEGORIES,
  type PlaceCategory,
} from "../models/Place.js";

import PlaceReview from "../models/PlaceReview.js";
import PlaceFavorite from "../models/PlaceFavorite.js";

import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
// ===============================
// Get All Places
// ===============================
export async function getAllPlaces(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const total = await Place.countDocuments();

    const places = await Place.find()
      .sort({
        averageRating: -1,
        name: 1,
      })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        places,
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
// ===============================
// Get Single Place
// ===============================
export async function getPlaceById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid place ID.",
      });
      return;
    }

    const place = await Place.findByIdAndUpdate(
  id,
  {
    $inc: {
      views: 1,
    },
  },
  {
    new: true,
  },
);

    if (!place) {
      res.status(404).json({
        success: false,
        message: "Place not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        place,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ===============================
// Create Place
// ===============================
export async function createPlace(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const place = await Place.create(req.body);

    res.status(201).json({
      success: true,
      message: "Place created successfully.",
      data: {
        place,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function searchPlaces(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = req.query.query;

    if (typeof query !== "string" || query.trim() === "") {
      res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

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
          history: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    };

    const total = await Place.countDocuments(filter);

    const places = await Place.find(filter)
      .sort({
        averageRating: -1,
      })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        places,
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
export async function getNearbyPlaces(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { lng, lat, distance, page, limit } = req.query;

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

    if (
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      res.status(400).json({
        success: false,
        message: "Coordinates are out of valid range.",
      });
      return;
    }

    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * currentLimit;

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

    const total = await Place.countDocuments(filter);

    const places = await Place.find(filter)
      .skip(skip)
      .limit(currentLimit);

    res.status(200).json({
      success: true,
      data: {
        places,
        pagination: {
          page: currentPage,
          limit: currentLimit,
          total,
          totalPages: Math.ceil(total / currentLimit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function addReview(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid place ID.",
      });
      return;
    }

    if (
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5
    ) {
      res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
      return;
    }

    const existingReview = await PlaceReview.findOne({
      place: id,
      user: req.userId,
    });

    if (existingReview) {
      res.status(400).json({
        success: false,
        message: "You have already reviewed this place.",
      });
      return;
    }

    const review = await PlaceReview.create({
      place: id,
      user: req.userId,
      rating,
      comment,
    });

    const reviews = await PlaceReview.find({
      place: id,
    });

    const total = reviews.reduce(
      (sum, item) => sum + item.rating,
      0,
    );

    await Place.findByIdAndUpdate(id, {
      averageRating: total / reviews.length,
      totalReviews: reviews.length,
    });

    res.status(201).json({
      success: true,
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
}export async function favoritePlace(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { id } = req.params;

    const exists = await PlaceFavorite.findOne({
      place: id,
      user: req.userId,
    });

    if (!exists) {
      await PlaceFavorite.create({
        place: id,
        user: req.userId,
      });

      await Place.findByIdAndUpdate(id, {
        $inc: {
          favorites: 1,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Added to favorites.",
    });
  } catch (error) {
    next(error);
  }
}
export async function unfavoritePlace(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { id } = req.params;

    const deleted = await PlaceFavorite.findOneAndDelete({
      place: id,
      user: req.userId,
    });

    if (deleted) {
      await Place.findByIdAndUpdate(id, {
        $inc: {
          favorites: -1,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from favorites.",
    });
  } catch (error) {
    next(error);
  }
}
export async function getTopRatedPlaces(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const places = await Place.find()
    .sort({
    averageRating: -1,
    totalReviews: -1,
    })
  .limit(10);
    res.status(200).json({
      success: true,
      data: {
        places,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function getTrendingPlaces(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const places = await Place.find()
      .sort({
       views: -1,
       favorites: -1,
      averageRating: -1,
  })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        places,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function getPlacesByCategory(
  req: Request<{ category: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = req.params.category as PlaceCategory;

    if (!PLACE_CATEGORIES.includes(category)) {
      res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
      return;
    }

    const places = await Place.find({
      category,
    });

    res.status(200).json({
      success: true,
      data: {
        places,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function deleteReview(
  req: AuthenticatedRequest & { params: { reviewId: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const review = await PlaceReview.findById(req.params.reviewId);

    if (!review) {
      res.status(404).json({
        success: false,
        message: "Review not found.",
      });
      return;
    }

    if (review.user.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: "Not allowed.",
      });
      return;
    }

    const placeId = review.place;

    await review.deleteOne();

    const reviews = await PlaceReview.find({
      place: placeId,
    });

    const average =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, item) => sum + item.rating, 0) /
          reviews.length;

    await Place.findByIdAndUpdate(placeId, {
      averageRating: average,
      totalReviews: reviews.length,
    });

    res.status(200).json({
      success: true,
      message: "Review deleted.",
    });

  } catch (error) {
    next(error);
  }
}
export async function getFavoritePlaces(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const favorites = await PlaceFavorite.find({
      user: req.userId,
    }).populate("place");

    res.status(200).json({
      success: true,
      data: {
        favorites,
      },
    });

  } catch (error) {
    next(error);
  }
}

export async function getMyReviews(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const reviews = await PlaceReview.find({
      user: req.userId,
    })
      .populate("place")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function updatePlace(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid place ID.",
      });
      return;
    }

    const place = await Place.findById(id);

    if (!place) {
      res.status(404).json({
        success: false,
        message: "Place not found.",
      });
      return;
    }

    const updatedPlace = await Place.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Place updated successfully.",
      data: {
        place: updatedPlace,
      },
    });
  } catch (error) {
    next(error);
  }
}
export async function deletePlace(
  req: AuthenticatedRequest & { params: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid place ID.",
      });
      return;
    }

    const place = await Place.findById(id);

    if (!place) {
      res.status(404).json({
        success: false,
        message: "Place not found.",
      });
      return;
    }

    await PlaceReview.deleteMany({
      place: id,
    });

    await PlaceFavorite.deleteMany({
      place: id,
    });

    await place.deleteOne();

    res.status(200).json({
      success: true,
      message: "Place deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}