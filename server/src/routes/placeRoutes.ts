import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  getAllPlaces,
  getPlaceById,
  createPlace,
  searchPlaces,
  getNearbyPlaces,
  addReview,
  favoritePlace,
  unfavoritePlace,
  getTopRatedPlaces,
  getTrendingPlaces,
  getPlacesByCategory,
  deleteReview,
  getFavoritePlaces,
  getMyReviews,
  updatePlace,
  deletePlace,
} from "../controllers/placeController.js";

const router = Router();

// ===============================
// Public Routes
// ===============================

router.get("/", getAllPlaces);

router.get("/search", searchPlaces);

router.get("/near", getNearbyPlaces);

router.get("/top-rated", getTopRatedPlaces);

router.get("/trending", getTrendingPlaces);

router.get("/category/:category", getPlacesByCategory);

router.get(
  "/favorites",
  authMiddleware,
  getFavoritePlaces,
);

router.get(
  "/reviews",
  authMiddleware,
  getMyReviews,
);

// Keep this LAST among GET routes
router.get("/:id", getPlaceById);

// ===============================
// User Routes
// ===============================

router.post("/:id/review", authMiddleware, addReview);

router.post("/:id/favorite", authMiddleware, favoritePlace);

router.delete("/:id/favorite", authMiddleware, unfavoritePlace);

// ===============================
// Admin / Moderator
// ===============================

router.post("/", authMiddleware, createPlace);
router.put("/:id", authMiddleware, updatePlace);
router.delete("/:id", authMiddleware, deletePlace);

router.delete(
  "/review/:reviewId",
  authMiddleware,
  deleteReview,
);
export default router;