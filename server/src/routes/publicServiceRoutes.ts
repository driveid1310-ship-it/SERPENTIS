import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  searchServices,
  getNearbyServices,
  getServicesByCategory,
} from "../controllers/publicServiceController.js";

const router = Router();

// ===============================
// Public Routes
// ===============================

router.get("/", getAllServices);

router.get("/search", searchServices);

router.get("/nearby", getNearbyServices);

router.get("/category/:category", getServicesByCategory);

router.get("/:id", getServiceById);

// ===============================
// Admin Routes
// ===============================

router.post("/", authMiddleware, createService);

router.put("/:id", authMiddleware, updateService);

router.delete("/:id", authMiddleware, deleteService);

export default router;