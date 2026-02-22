import { Router } from "express";
import { register, login, getMe, updateProfile, lookupByEmail } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateProfile);
router.get("/lookup", authenticate, lookupByEmail);

export default router;
