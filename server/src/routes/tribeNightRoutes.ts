import { Router } from "express";
import {
  registerTribeNight,
  checkRegistration,
  loginTribeNight,
  getAllRegistrations,
  verifyPayment,
} from "../controllers/tribeNightController";
import { authenticate } from "../middlewares/auth";
import { roleGuard } from "../middlewares/roleGuard";

const router = Router();

// Public routes
router.post("/register", registerTribeNight);
router.get("/check/:email", checkRegistration);
router.post("/login", loginTribeNight);

// Admin only routes
router.get("/registrations", authenticate, roleGuard("admin"), getAllRegistrations);
router.put("/:id/verify", authenticate, roleGuard("admin"), verifyPayment);

export default router;
