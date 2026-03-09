import { Router } from "express";
import {
  registerWalkIn,
  getWalkInRegistrations,
  deleteWalkInRegistration,
} from "../controllers/walkInController";
import { authenticate } from "../middlewares/auth";
import { roleGuard } from "../middlewares/roleGuard";

const router = Router();

// Public: Register a walk-in attendee (no auth required)
router.post("/register", registerWalkIn);

// Admin-only: Get all walk-in registrations
router.get("/registrations", authenticate, roleGuard("admin"), getWalkInRegistrations);

// Admin-only: Delete a walk-in registration
router.delete("/registrations/:id", authenticate, roleGuard("admin"), deleteWalkInRegistration);

export default router;
