import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

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

router.post("/", authMiddleware, authorizeRoles("moderator", "admin"), createService);

router.put("/:id", authMiddleware, authorizeRoles("moderator", "admin"), updateService);

router.delete("/:id", authMiddleware, authorizeRoles("moderator", "admin"), deleteService);

export default router;