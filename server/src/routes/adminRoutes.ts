import { Router } from "express";
import {
  volunteerSignup,
  adminSignup,
  adminLogin,
  getAllUsers,
  getUsersByRole,
} from "../controllers/adminController";
import { authenticate } from "../middlewares/auth";
import { roleGuard } from "../middlewares/roleGuard";

const router = Router();

// Volunteer self-register with secret code (no auth needed)
router.post("/signup/volunteer", volunteerSignup);

// Admin self-register with secret code (no auth needed)
router.post("/signup/admin", adminSignup);

// Admin / volunteer login
router.post("/login", adminLogin);

// Admin-only: list all users
router.get("/users", authenticate, roleGuard("admin"), getAllUsers);

// Admin-only: list users by role
router.get("/users/:role", authenticate, roleGuard("admin"), getUsersByRole);

export default router;
