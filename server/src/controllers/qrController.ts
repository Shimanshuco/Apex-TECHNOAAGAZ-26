import { Request, Response } from "express";
import { User } from "../models/User";
import { qrVerifySchema } from "../utils/validators";

/**
 * POST /api/qr/verify
 * Volunteer or admin scans a QR → first scan = ALLOWED, subsequent = DENIED.
 * Tracks every scan attempt with who scanned and when.
 * Body: { userId: string }
 */
export const verifyQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = qrVerifySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { userId } = parsed.data;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const scannedById = req.userId!; // from authenticate middleware

    // ALREADY VERIFIED → ACCESS DENIED
    if (user.isVerified) {
      // Still log the denied attempt
      user.scanCount += 1;
      user.scanHistory.push({
        scannedBy: scannedById as any,
        scannedAt: new Date(),
        result: "denied",
      });
      await user.save();

      res.status(403).json({
        success: false,
        message: "⛔ ACCESS DENIED — Already scanned!",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          university: user.university,
          collegeName: user.collegeName,
          isVerified: true,
          scanCount: user.scanCount,
          firstScannedAt: user.scanHistory.find(s => s.result === "allowed")?.scannedAt || null,
        },
      });
      return;
    }

    // FIRST SCAN → ALLOW ENTRY
    user.isVerified = true;
    user.scanCount = 1;
    user.scanHistory.push({
      scannedBy: scannedById as any,
      scannedAt: new Date(),
      result: "allowed",
    });
    await user.save();

    res.json({
      success: true,
      message: "✅ Entry Allowed — Verified successfully!",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        university: user.university,
        collegeName: user.collegeName,
        isVerified: true,
        scanCount: 1,
      },
    });
  } catch (err) {
    console.error("VerifyQR error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/qr/user/:id
 * Fetch a user's QR code (admin / volunteer)
 */
export const getUserQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("name email role qrCode isVerified");
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
        role: user.role,
        qrCode: user.qrCode,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("GetUserQR error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/qr/stats
 * Admin dashboard: verification stats
 */
export const verificationStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const total = await User.countDocuments({ role: "participant" });
    const verified = await User.countDocuments({
      role: "participant",
      isVerified: true,
    });
    const deniedScans = await User.aggregate([
      { $match: { role: "participant" } },
      { $project: { denied: { $size: { $filter: { input: { $ifNull: ["$scanHistory", []] }, as: "s", cond: { $eq: ["$$s.result", "denied"] } } } } } },
      { $group: { _id: null, total: { $sum: "$denied" } } },
    ]);

    res.json({
      success: true,
      data: {
        total,
        verified,
        pending: total - verified,
        totalDeniedScans: deniedScans[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error("VerificationStats error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
