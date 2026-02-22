import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Registration } from "../models/Registration";
import { signToken } from "../utils/jwt";
import { generateQR } from "../utils/qrGenerator";
import { registerSchema, loginSchema, updateProfileSchema } from "../utils/validators";

/**
 * GET /api/auth/lookup?email=...&eventId=...
 * Authenticated users can look up a registered user by email.
 * If eventId is provided, also checks that the user has already registered
 * AND paid (paymentStatus === "completed") for that event.
 */
export const lookupByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = (req.query.email as string || "").trim().toLowerCase();
    const eventId = (req.query.eventId as string || "").trim();

    if (!email) {
      res.status(400).json({ success: false, message: "Email query parameter is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "No registered user found with this email" });
      return;
    }

    // If eventId is provided, verify this user has registered + paid for the event
    if (eventId) {
      const registration = await Registration.findOne({
        event: eventId,
        user: user._id,
      });

      if (!registration) {
        res.status(400).json({
          success: false,
          message: `"${email}" has not registered for this event yet. They must register and complete payment first.`,
        });
        return;
      }

      if (registration.paymentStatus !== "completed") {
        res.status(400).json({
          success: false,
          message: `"${email}" has registered but payment is still pending. They must complete payment first.`,
        });
        return;
      }

      // Check if this person is already a team leader
      if (registration.teamName) {
        res.status(400).json({
          success: false,
          message: `"${email}" is already a team leader for this event.`,
        });
        return;
      }

      // Check if this person is already in someone else's team
      const inOtherTeam = await Registration.findOne({
        event: eventId,
        "teamMembers.email": email,
      });
      if (inOtherTeam) {
        res.status(400).json({
          success: false,
          message: `"${email}" is already part of another team for this event.`,
        });
        return;
      }
    }

    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        university: user.university,
        collegeName: user.collegeName,
        gender: user.gender,
      },
    });
  } catch (err) {
    console.error("LookupByEmail error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/auth/register
 * Role: participant
 * Fields: name, email, phone, university, collegeName, gender, bloodGroup, address, password, confirmPassword
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { name, email, phone, password, university, collegeName, gender, bloodGroup, address } = parsed.data;

    // Check duplicate
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409).json({ success: false, message: "Email already registered" });
      return;
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: "participant",
      university,
      collegeName: university === "other" ? collegeName : undefined,
      gender,
      bloodGroup,
      address,
    });

    // Generate QR
    const qrCode = await generateQR({
      userId: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    });
    user.qrCode = qrCode;
    await user.save();

    // Token
    const token = signToken({ id: String(user._id), role: user.role });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          university: user.university,
          collegeName: user.collegeName,
          gender: user.gender,
          bloodGroup: user.bloodGroup,
          address: user.address,
          qrCode: user.qrCode,
        },
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/auth/login
 * Any role can login here
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const token = signToken({ id: String(user._id), role: user.role });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          university: user.university,
          collegeName: user.collegeName,
          gender: user.gender,
          bloodGroup: user.bloodGroup,
          address: user.address,
          qrCode: user.qrCode,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).populate("registeredEvents");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        university: user.university,
        collegeName: user.collegeName,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        address: user.address,
        qrCode: user.qrCode,
        isVerified: user.isVerified,
        registeredEvents: user.registeredEvents,
      },
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/auth/me
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const updates: Record<string, unknown> = { ...parsed.data };

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).populate("registeredEvents");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      message: "Profile updated",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        university: user.university,
        collegeName: user.collegeName,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        address: user.address,
        qrCode: user.qrCode,
        isVerified: user.isVerified,
        registeredEvents: user.registeredEvents,
      },
    });
  } catch (err) {
    console.error("UpdateProfile error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
