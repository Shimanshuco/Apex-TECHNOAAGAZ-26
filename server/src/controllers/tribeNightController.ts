import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import TribeNightRegistration from "../models/TribeNightRegistration";
import { z } from "zod";

/* ── Validation Schema ── */
const tribeNightRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  gender: z.enum(["male", "female"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
  paymentScreenshot: z.string().min(1, "Payment screenshot is required"),
});

/* ── Event Price ── */
const TRIBE_NIGHT_PRICE = 300;

/**
 * POST /api/tribe-night/register
 * Register for Tribe Night event
 */
export const registerTribeNight = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = tribeNightRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      res.status(400).json({ success: false, message: "Validation failed", errors: fieldErrors });
      return;
    }

    const { name, email, phone, gender, password, paymentScreenshot } = parsed.data;

    // Check if already registered
    const existingReg = await TribeNightRegistration.findOne({ email });
    if (existingReg) {
      // Allow re-registration if payment was rejected
      if (existingReg.paymentStatus === "failed") {
        await TribeNightRegistration.deleteOne({ _id: existingReg._id });
      } else {
        res.status(400).json({ success: false, message: "This email is already registered for Tribe Night" });
        return;
      }
    }

    // Check phone number
    const existingPhone = await TribeNightRegistration.findOne({ phone });
    if (existingPhone && existingPhone.paymentStatus !== "failed") {
      res.status(400).json({ success: false, message: "This phone number is already registered for Tribe Night" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload screenshot to Cloudinary
    let screenshotUrl: string;
    try {
      const { uploadScreenshot } = await import("../utils/screenshotUploader");
      screenshotUrl = await uploadScreenshot({
        base64Image: paymentScreenshot,
        userName: name,
        eventTitle: "TribeNight",
        eventDate: new Date().toISOString(),
      });
      console.log("Tribe Night screenshot uploaded:", screenshotUrl);
    } catch (uploadErr: any) {
      console.error("Screenshot upload error:", uploadErr);
      res.status(500).json({
        success: false,
        message: `Failed to upload payment screenshot: ${uploadErr.message || "Unknown error"}. Please try again.`,
      });
      return;
    }

    // Create registration
    const registration = await TribeNightRegistration.create({
      name,
      email,
      phone,
      gender,
      password: hashedPassword,
      paymentScreenshot: screenshotUrl,
      paymentStatus: "pending",
      amount: TRIBE_NIGHT_PRICE,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! Your payment is under verification.",
      data: {
        id: registration._id,
        name: registration.name,
        email: registration.email,
        paymentStatus: registration.paymentStatus,
        amount: registration.amount,
      },
    });
  } catch (err) {
    console.error("TribeNight registration error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/tribe-night/check/:email
 * Check if an email is already registered
 */
export const checkRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.params.email as string;
    const registration = await TribeNightRegistration.findOne({ email: email.toLowerCase() });
    
    if (!registration) {
      res.json({ success: true, registered: false });
      return;
    }

    res.json({
      success: true,
      registered: true,
      paymentStatus: registration.paymentStatus,
      hasQrCode: !!registration.qrCode,
    });
  } catch (err) {
    console.error("Check registration error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/tribe-night/login
 * Login to check registration status and get QR code
 */
export const loginTribeNight = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }

    const registration = await TribeNightRegistration.findOne({ email: email.toLowerCase() });
    if (!registration) {
      res.status(404).json({ success: false, message: "Registration not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, registration.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid password" });
      return;
    }

    res.json({
      success: true,
      data: {
        id: registration._id,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        paymentStatus: registration.paymentStatus,
        qrCode: registration.qrCode,
        amount: registration.amount,
      },
    });
  } catch (err) {
    console.error("TribeNight login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/tribe-night/registrations (Admin only)
 * Get all Tribe Night registrations
 */
export const getAllRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const registrations = await TribeNightRegistration.find()
      .select("-password")
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (err) {
    console.error("Get all registrations error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/tribe-night/:id/verify (Admin only)
 * Verify payment and generate QR code
 */
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["completed", "failed"].includes(status)) {
      res.status(400).json({ success: false, message: "Status must be 'completed' or 'failed'" });
      return;
    }

    const registration = await TribeNightRegistration.findById(id);
    if (!registration) {
      res.status(404).json({ success: false, message: "Registration not found" });
      return;
    }

    registration.paymentStatus = status;

    // Generate QR code if payment is verified
    if (status === "completed" && !registration.qrCode) {
      const { generateQR } = await import("../utils/qrGenerator");
      const qrCode = await generateQR({
        userId: String(registration._id),
        name: registration.name,
        email: registration.email,
        role: "tribe-night-attendee",
      });
      registration.qrCode = qrCode;
    }

    await registration.save();

    res.json({
      success: true,
      message: status === "completed" ? "Payment verified and QR code generated" : "Payment rejected",
      data: {
        id: registration._id,
        paymentStatus: registration.paymentStatus,
        qrCode: registration.qrCode,
      },
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
