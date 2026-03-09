import { Router } from "express";
import {
  volunteerSignup,
  adminLogin,
  getAllUsers,
  getUsersByRole,
  getPendingPayments,
  approvePayment,
  rejectPayment,
  getEventRegistrationStats,
  exportEventsToExcel,
  getScanHistory,
} from "../controllers/adminController";
import { authenticate } from "../middlewares/auth";
import { roleGuard } from "../middlewares/roleGuard";

const router = Router();

// Volunteer self-register with secret code (no auth needed)
router.post("/signup/volunteer", volunteerSignup);

// Admin / volunteer login
router.post("/login", adminLogin);

// Admin-only: list all users
router.get("/users", authenticate, roleGuard("admin"), getAllUsers);

// Admin-only: list users by role
router.get("/users/:role", authenticate, roleGuard("admin"), getUsersByRole);

// Admin-only: event registration stats
router.get("/events/registration-stats", authenticate, roleGuard("admin"), getEventRegistrationStats);

// Admin-only: export events to Excel
router.get("/export-events", authenticate, roleGuard("admin"), exportEventsToExcel);

// Admin-only: scan history (day-wise)
router.get("/scan-history", authenticate, roleGuard("admin"), getScanHistory);

// Admin-only: payment verification
router.get("/registrations/pending", authenticate, roleGuard("admin"), getPendingPayments);
router.patch("/registrations/:id/approve", authenticate, roleGuard("admin"), approvePayment);
router.patch("/registrations/:id/reject", authenticate, roleGuard("admin"), rejectPayment);

export default router;
