import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { deletePlace } from "../controllers/placeController.js";

import { deleteService } from "../controllers/publicServiceController.js";
import {
  getDashboard,
  getAllUsers,
  getAllReports,
  deleteReport,
} from "../controllers/adminController.js";

import {
  updateReportStatus,
} from "../controllers/reportController.js";

const router = Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);
router.delete("/places/:id", deletePlace);

router.delete(
  "/public-services/:id",
  deleteService,
);
// Dashboard
router.get("/dashboard", getDashboard);

// Users
router.get("/users", getAllUsers);

// Reports
router.get("/reports", getAllReports);

router.put(
  "/reports/:id/status",
  updateReportStatus,
);

router.delete(
  "/reports/:id",
  deleteReport,
);

export default router;