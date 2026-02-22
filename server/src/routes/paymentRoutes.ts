import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  razorpayWebhook,
  getPaymentStatus,
} from "../controllers/paymentController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Create a Razorpay order (authenticated)
router.post("/create-order", authenticate, createOrder);

// Verify payment after Razorpay checkout (authenticated)
router.post("/verify", authenticate, verifyPayment);

// Razorpay webhook (no auth — Razorpay calls this directly)
router.post("/webhook", razorpayWebhook);

// Check payment status by order ID (authenticated)
router.get("/status/:orderId", authenticate, getPaymentStatus);

export default router;
