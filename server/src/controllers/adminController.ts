import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";
import { generateQR } from "../utils/qrGenerator";
import { volunteerSignupSchema, adminSignupSchema, adminLoginSchema } from "../utils/validators";
import { ENV } from "../config/env";

/**
 * POST /api/admin/signup/volunteer
 * Volunteer self-signup with secret code.
 * Fields: secretCode, name, email, phone, gender, bloodGroup, password, confirmPassword
 * Volunteer is from Apex University by default.
 */
export const volunteerSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = volunteerSignupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { secretCode, name, email, phone, gender, bloodGroup, password } = parsed.data;

    // Validate volunteer secret code
    if (secretCode !== ENV.VOLUNTEER_SECRET) {
      res.status(403).json({ success: false, message: "Invalid volunteer secret code" });
      return;
    }

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409).json({ success: false, message: "Email already registered" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: "volunteer",
      university: "apex_university",      // volunteer is Apex by default
      gender,
      bloodGroup,
    });

    const qrCode = await generateQR({
      userId: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    });
    user.qrCode = qrCode;
    await user.save();

    const token = signToken({ id: String(user._id), role: user.role });

    res.status(201).json({
      success: true,
      message: "Volunteer account created",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          gender: user.gender,
          bloodGroup: user.bloodGroup,
          university: user.university,
          qrCode: user.qrCode,
        },
      },
    });
  } catch (err) {
    console.error("Volunteer signup error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/admin/signup/admin
 * Admin signup with secret code.
 * Fields: secretCode, name, email, password, confirmPassword
 */
export const adminSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = adminSignupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { secretCode, name, email, password } = parsed.data;

    // Validate admin secret code
    if (secretCode !== ENV.ADMIN_SECRET) {
      res.status(403).json({ success: false, message: "Invalid admin secret code" });
      return;
    }

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409).json({ success: false, message: "Email already registered" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "admin",
    });

    const token = signToken({ id: String(user._id), role: user.role });

    res.status(201).json({
      success: true,
      message: "Admin account created",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error("Admin signup error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/admin/login
 * Admin & volunteer login
 */
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = adminLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password, secretCode } = parsed.data;

    const user = await User.findOne({ email, role: { $in: ["admin", "volunteer"] } }).select("+password");
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials or not an admin/volunteer" });
      return;
    }

    // Verify secret code based on role
    const expectedSecret = user.role === "admin" ? ENV.ADMIN_SECRET : ENV.VOLUNTEER_SECRET;
    if (secretCode !== expectedSecret) {
      res.status(403).json({ success: false, message: "Invalid secret code" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = signToken({ id: String(user._id), role: user.role });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          qrCode: user.qrCode,
        },
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error("GetAllUsers error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/admin/users/:role
 * List users filtered by role
 */
export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error("GetUsersByRole error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
