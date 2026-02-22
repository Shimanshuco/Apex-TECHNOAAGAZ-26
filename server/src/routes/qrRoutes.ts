import { Router } from "express";
import { verifyQR, getUserQR, verificationStats } from "../controllers/qrController";
import { authenticate } from "../middlewares/auth";
import { roleGuard } from "../middlewares/roleGuard";

const router = Router();

// Volunteer & admin can verify QR
router.post("/verify", authenticate, roleGuard("volunteer", "admin"), verifyQR);

// Volunteer & admin can look up user QR
router.get("/user/:id", authenticate, roleGuard("volunteer", "admin"), getUserQR);

// Admin-only stats
router.get("/stats", authenticate, roleGuard("admin"), verificationStats);

export default router;
