import { Request, Response } from "express";
import { User } from "../models/User";
import TribeNightRegistration from "../models/TribeNightRegistration";
import { qrVerifySchema } from "../utils/validators";

/**
 * POST /api/qr/verify
 * Volunteer or admin scans a QR → first scan per day = ALLOWED, subsequent same day = DENIED.
 * Each new day resets the allowance.
 * Tracks every scan attempt with who scanned and when.
 * Supports both regular users and Tribe Night registrations.
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
    const scannedById = req.userId!; // from authenticate middleware
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // First, try to find in User collection
    const user = await User.findById(userId);
    
    if (user) {
      // Regular user found - handle verification
      const todayAllowedScan = user.scanHistory.find(
        (s) => s.result === "allowed" && new Date(s.scannedAt) >= todayStart && new Date(s.scannedAt) < todayEnd
      );

      if (todayAllowedScan) {
        // Already verified today → ACCESS DENIED
        user.scanCount += 1;
        user.scanHistory.push({
          scannedBy: scannedById as any,
          scannedAt: now,
          result: "denied",
        });
        await user.save();

        res.status(403).json({
          success: false,
          message: "⛔ ACCESS DENIED — Already scanned today!",
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
            firstScannedTodayAt: todayAllowedScan.scannedAt,
          },
        });
        return;
      }

      // FIRST SCAN TODAY → ALLOW ENTRY
      user.isVerified = true;
      user.scanCount += 1;
      user.scanHistory.push({
        scannedBy: scannedById as any,
        scannedAt: now,
        result: "allowed",
      });
      await user.save();

      res.json({
        success: true,
        message: "✅ Entry Allowed — Verified successfully for today!",
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
        },
      });
      return;
    }

    // If not found in User, check TribeNightRegistration
    const tribeNightUser = await TribeNightRegistration.findById(userId);
    
    if (tribeNightUser) {
      // Check if payment is verified
      if (tribeNightUser.paymentStatus !== "completed") {
        res.status(403).json({
          success: false,
          message: "⛔ ACCESS DENIED — Payment not verified!",
          data: {
            id: tribeNightUser._id,
            name: tribeNightUser.name,
            email: tribeNightUser.email,
            role: "tribe-night-attendee",
            phone: tribeNightUser.phone,
            paymentStatus: tribeNightUser.paymentStatus,
          },
        });
        return;
      }

      // Check for today's allowed scan
      const todayAllowedScan = tribeNightUser.scanHistory.find(
        (s) => s.result === "allowed" && new Date(s.scannedAt) >= todayStart && new Date(s.scannedAt) < todayEnd
      );

      if (todayAllowedScan) {
        // Already verified today → ACCESS DENIED
        tribeNightUser.scanCount += 1;
        tribeNightUser.scanHistory.push({
          scannedBy: scannedById as any,
          scannedAt: now,
          result: "denied",
        });
        await tribeNightUser.save();

        res.status(403).json({
          success: false,
          message: "⛔ ACCESS DENIED — Already scanned today! (Tribe Night)",
          data: {
            id: tribeNightUser._id,
            name: tribeNightUser.name,
            email: tribeNightUser.email,
            role: "tribe-night-attendee",
            phone: tribeNightUser.phone,
            isVerified: true,
            scanCount: tribeNightUser.scanCount,
            firstScannedTodayAt: todayAllowedScan.scannedAt,
          },
        });
        return;
      }

      // FIRST SCAN TODAY → ALLOW ENTRY
      tribeNightUser.isVerified = true;
      tribeNightUser.scanCount += 1;
      tribeNightUser.scanHistory.push({
        scannedBy: scannedById as any,
        scannedAt: now,
        result: "allowed",
      });
      await tribeNightUser.save();

      res.json({
        success: true,
        message: "✅ Entry Allowed — Tribe Night verified for today!",
        data: {
          id: tribeNightUser._id,
          name: tribeNightUser.name,
          email: tribeNightUser.email,
          role: "tribe-night-attendee",
          phone: tribeNightUser.phone,
          isVerified: true,
          scanCount: tribeNightUser.scanCount,
        },
      });
      return;
    }

    // Not found in either collection
    res.status(404).json({ success: false, message: "User not found" });
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
