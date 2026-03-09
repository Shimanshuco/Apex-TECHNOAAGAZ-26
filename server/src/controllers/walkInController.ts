import { Request, Response } from "express";
import WalkInRegistration from "../models/WalkInRegistration";

/* ═══════════════════════════════════════════════════════
   WALK-IN REGISTRATION CONTROLLER
   Public endpoint for walk-in registrations via QR scan
   ═══════════════════════════════════════════════════════ */

/**
 * POST /api/walkin/register
 * Register a walk-in attendee (public endpoint - no auth required)
 */
export const registerWalkIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, course, college } = req.body;

    // Validate required fields
    if (!name || !phone || !course || !college) {
      res.status(400).json({
        success: false,
        message: "All fields are required: name, phone, course, college",
      });
      return;
    }

    // Check if phone already registered today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingToday = await WalkInRegistration.findOne({
      phone,
      registeredAt: { $gte: todayStart, $lte: todayEnd },
    });

    if (existingToday) {
      res.status(400).json({
        success: false,
        message: "This phone number is already registered today!",
      });
      return;
    }

    // Create new walk-in registration
    const walkIn = await WalkInRegistration.create({
      name,
      phone,
      course,
      college,
      registeredAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to Technoaagaz 2026!",
      data: walkIn,
    });
  } catch (err) {
    console.error("WalkIn registration error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/walkin/registrations
 * Get all walk-in registrations (admin only)
 */
export const getWalkInRegistrations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const registrations = await WalkInRegistration.find()
      .populate("registeredBy", "name email role")
      .sort({ registeredAt: -1 });

    // Group by date
    const dayWiseData: Record<string, any[]> = {};

    for (const reg of registrations) {
      const dateKey = new Date(reg.registeredAt).toLocaleDateString("en-IN");
      if (!dayWiseData[dateKey]) {
        dayWiseData[dateKey] = [];
      }
      dayWiseData[dateKey].push({
        _id: reg._id,
        name: reg.name,
        phone: reg.phone,
        course: reg.course,
        college: reg.college,
        registeredAt: reg.registeredAt,
        registeredBy: reg.registeredBy,
      });
    }

    // Sort each day's registrations by time
    for (const date of Object.keys(dayWiseData)) {
      dayWiseData[date].sort(
        (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      );
    }

    // Convert to array sorted by date (newest first)
    const sortedDates = Object.keys(dayWiseData).sort((a, b) => {
      const dateA = new Date(a.split("/").reverse().join("-"));
      const dateB = new Date(b.split("/").reverse().join("-"));
      return dateB.getTime() - dateA.getTime();
    });

    const result = sortedDates.map((date) => ({
      date,
      count: dayWiseData[date].length,
      registrations: dayWiseData[date],
    }));

    res.json({
      success: true,
      totalCount: registrations.length,
      data: result,
    });
  } catch (err) {
    console.error("GetWalkInRegistrations error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE /api/walkin/registrations/:id
 * Delete a walk-in registration (admin only)
 */
export const deleteWalkInRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const reg = await WalkInRegistration.findByIdAndDelete(req.params.id);
    if (!reg) {
      res.status(404).json({ success: false, message: "Registration not found" });
      return;
    }
    res.json({ success: true, message: "Registration deleted successfully" });
  } catch (err) {
    console.error("DeleteWalkInRegistration error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
