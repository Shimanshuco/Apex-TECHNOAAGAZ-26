import { Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { ENV } from "../config/env";
import { Registration } from "../models/Registration";
import { Event } from "../models/Event";
import { User } from "../models/User";

/* ── Razorpay instance ── */
const razorpay = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID,
  key_secret: ENV.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for the given event.
 * The frontend will use this order to show QR / checkout.
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      res.status(400).json({ success: false, message: "eventId is required" });
      return;
    }

    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    if (!event.cost || event.cost <= 0) {
      res.status(400).json({ success: false, message: "This event is free — no payment needed" });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Check if user already has a completed registration
    const existingReg = await Registration.findOne({ event: event._id, user: req.userId });
    if (existingReg && existingReg.paymentStatus === "completed") {
      res.status(400).json({ success: false, message: "Already registered and paid" });
      return;
    }

    // Amount in paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(event.cost * 100);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `evt_${event._id}_usr_${req.userId}_${Date.now()}`,
      notes: {
        eventId: String(event._id),
        eventTitle: event.title,
        userId: String(req.userId),
        userName: user.name,
        userEmail: user.email,
      },
    });

    // If a pending registration already exists, update it with the new order ID
    if (existingReg) {
      existingReg.razorpayOrderId = order.id;
      existingReg.paymentStatus = "pending";
      await existingReg.save();
    } else {
      // Create a pending registration
      await Registration.create({
        event: event._id,
        user: req.userId,
        teamMembers: [],
        paymentStatus: "pending",
        razorpayOrderId: order.id,
        amount: event.cost,
      });

      // Add to user's registered events
      if (!user.registeredEvents.map(String).includes(String(event._id))) {
        user.registeredEvents.push(event._id as any);
        await user.save();
      }
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: event.cost,
        amountInPaise,
        currency: "INR",
        keyId: ENV.RAZORPAY_KEY_ID,
        eventTitle: event.title,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone || "",
      },
    });
  } catch (err) {
    console.error("CreateOrder error:", err);
    res.status(500).json({ success: false, message: "Failed to create payment order" });
  }
};

/**
 * POST /api/payments/verify
 * Verifies the Razorpay payment signature after the user completes payment.
 * Called by the frontend after Razorpay checkout success callback.
 */
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ success: false, message: "Missing payment verification data" });
      return;
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ success: false, message: "Payment verification failed — invalid signature" });
      return;
    }

    // Find the registration by order ID and update
    const registration = await Registration.findOne({ razorpayOrderId: razorpay_order_id });
    if (!registration) {
      res.status(404).json({ success: false, message: "Registration not found for this order" });
      return;
    }

    registration.paymentStatus = "completed";
    registration.paymentId = razorpay_payment_id;
    await registration.save();

    res.json({
      success: true,
      message: "Payment verified successfully!",
      data: { registrationId: registration._id, paymentId: razorpay_payment_id },
    });
  } catch (err) {
    console.error("VerifyPayment error:", err);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

/**
 * POST /api/payments/webhook
 * Razorpay webhook — handles payment.captured event as a fallback
 * (in case the frontend verify call fails/never fires)
 */
export const razorpayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookSecret = ENV.RAZORPAY_KEY_SECRET;
    const signature = req.headers["x-razorpay-signature"] as string;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSignature) {
      res.status(400).json({ success: false, message: "Invalid webhook signature" });
      return;
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured" || event === "order.paid") {
      const payment = payload.payment?.entity;
      const orderId = payment?.order_id || payload.order?.entity?.id;

      if (orderId) {
        const registration = await Registration.findOne({ razorpayOrderId: orderId });
        if (registration && registration.paymentStatus !== "completed") {
          registration.paymentStatus = "completed";
          registration.paymentId = payment?.id || "";
          await registration.save();
          console.log(`Webhook: Payment completed for order ${orderId}`);
        }
      }
    }

    // Always respond 200 to Razorpay
    res.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.json({ success: true }); // Always 200 for webhooks
  }
};

/**
 * GET /api/payments/status/:orderId
 * Frontend polls this to check if payment was completed
 * (useful as a fallback / for QR scan flows)
 */
export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const registration = await Registration.findOne({ razorpayOrderId: orderId });

    if (!registration) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res.json({
      success: true,
      data: {
        paymentStatus: registration.paymentStatus,
        paymentId: registration.paymentId || null,
      },
    });
  } catch (err) {
    console.error("GetPaymentStatus error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
