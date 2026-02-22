import { Request, Response } from "express";
import { Event } from "../models/Event";
import { User } from "../models/User";
import { Registration } from "../models/Registration";
import { eventSchema, eventRegistrationSchema } from "../utils/validators";

/**
 * POST /api/events
 * Create a new event (admin only)
 */
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      res.status(400).json({ success: false, message: "Validation failed", errors: fieldErrors });
      return;
    }

    const event = await Event.create({
      ...parsed.data,
      date: new Date(parsed.data.date),
      createdBy: req.userId,
    });

    res.status(201).json({ success: true, message: "Event created", data: event });
  } catch (err) {
    console.error("CreateEvent error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/events
 * List all active events (public)
 */
export const getAllEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    console.error("GetAllEvents error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/events/:id
 * Single event detail (public)
 */
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }
    res.json({ success: true, data: event });
  } catch (err) {
    console.error("GetEventById error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/events/category/:category
 * Filter events by category (public)
 */
export const getEventsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ category: req.params.category, isActive: true }).sort({ date: 1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    console.error("GetEventsByCategory error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/events/:id
 * Update event (admin only)
 */
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        ...parsed.data,
        date: new Date(parsed.data.date),
      },
      { new: true, runValidators: true },
    );

    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    res.json({ success: true, message: "Event updated", data: event });
  } catch (err) {
    console.error("UpdateEvent error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE /api/events/:id
 * Soft-delete event (admin only)
 */
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    console.error("DeleteEvent error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/events/:id/register
 * Phase 1: Individual registration + payment.
 * For team events the user just registers themselves — team formation
 * happens later via POST /:id/create-team.
 */
export const registerForEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Check if already registered
    const existingReg = await Registration.findOne({ event: event._id, user: req.userId });
    if (existingReg) {
      res.status(400).json({ success: false, message: "Already registered for this event" });
      return;
    }

    const amount = event.cost || 0;

    // For paid events, registration is created via the payment flow (/api/payments/create-order)
    if (amount > 0) {
      res.status(400).json({
        success: false,
        message: "This is a paid event. Please use the payment flow to register.",
      });
      return;
    }

    // Free event — register directly
    const registration = await Registration.create({
      event: event._id,
      user: req.userId,
      teamMembers: [],
      paymentStatus: "completed",
      amount: 0,
    });

    // Update user's registered events
    if (!user.registeredEvents.map(String).includes(String(event._id))) {
      user.registeredEvents.push(event._id as any);
      await user.save();
    }

    res.json({
      success: true,
      message: `Registered for "${event.title}"`,
      data: registration,
    });
  } catch (err) {
    console.error("RegisterForEvent error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/events/:id/create-team
 * Phase 2 (team events only): After everyone has registered + paid individually,
 * the team leader forms a team by providing teamName + member emails.
 * Each member must already be registered with paymentStatus "completed".
 */
export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    if (event.participationType !== "team") {
      res.status(400).json({ success: false, message: "This is not a team event" });
      return;
    }

    // Leader must be registered + paid
    const leaderReg = await Registration.findOne({ event: event._id, user: req.userId });
    if (!leaderReg) {
      res.status(400).json({ success: false, message: "You must register for this event first" });
      return;
    }
    if (leaderReg.paymentStatus !== "completed") {
      res.status(400).json({ success: false, message: "You must complete payment before creating a team" });
      return;
    }

    // Already has a team?
    if (leaderReg.teamName) {
      res.status(400).json({ success: false, message: "You already have a team for this event" });
      return;
    }

    // Check if leader is already part of another person's team
    const user = await User.findById(req.userId);
    if (user) {
      const inOtherTeam = await Registration.findOne({
        event: event._id,
        "teamMembers.email": user.email.toLowerCase(),
      });
      if (inOtherTeam) {
        res.status(400).json({ success: false, message: "You are already a member of another team for this event" });
        return;
      }
    }

    const { teamName, teamMembers } = req.body || {};

    if (!teamName || !String(teamName).trim()) {
      res.status(400).json({ success: false, message: "Team name is required" });
      return;
    }

    const members: { name: string; email: string; phone: string }[] = Array.isArray(teamMembers) ? teamMembers : [];

    // Total = leader + members
    const totalSize = 1 + members.length;
    const minSize = event.minTeamSize || 2;
    const maxSize = event.maxTeamSize || 5;

    if (totalSize < minSize) {
      res.status(400).json({
        success: false,
        message: `Team must have at least ${minSize} members (including you). Currently: ${totalSize}`,
      });
      return;
    }
    if (totalSize > maxSize) {
      res.status(400).json({
        success: false,
        message: `Team can have at most ${maxSize} members (including you). Currently: ${totalSize}`,
      });
      return;
    }

    // Validate each member
    for (const member of members) {
      const memberUser = await User.findOne({ email: member.email.toLowerCase() });
      if (!memberUser) {
        res.status(400).json({
          success: false,
          message: `"${member.email}" is not registered on the website.`,
        });
        return;
      }

      // Must have their own registration with completed payment
      const memberReg = await Registration.findOne({ event: event._id, user: memberUser._id });
      if (!memberReg) {
        res.status(400).json({
          success: false,
          message: `"${member.email}" has not registered for this event yet.`,
        });
        return;
      }
      if (memberReg.paymentStatus !== "completed") {
        res.status(400).json({
          success: false,
          message: `"${member.email}" has not completed payment for this event yet.`,
        });
        return;
      }

      // Already in another team?
      const inOtherTeam = await Registration.findOne({
        event: event._id,
        "teamMembers.email": member.email.toLowerCase(),
      });
      if (inOtherTeam) {
        res.status(400).json({
          success: false,
          message: `"${member.email}" is already part of another team for this event.`,
        });
        return;
      }

      // Already a team leader themselves?
      if (memberReg.teamName) {
        res.status(400).json({
          success: false,
          message: `"${member.email}" is already a team leader for this event.`,
        });
        return;
      }
    }

    // All good — update leader's registration with team info
    leaderReg.teamName = String(teamName).trim();
    leaderReg.teamMembers = members;
    await leaderReg.save();

    res.json({
      success: true,
      message: `Team "${teamName}" created successfully!`,
      data: leaderReg,
    });
  } catch (err) {
    console.error("CreateTeam error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/events/:id/add-team-member
 * Leader adds a new member to their existing team
 */
export const addTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }
    if (event.participationType !== "team") {
      res.status(400).json({ success: false, message: "This is not a team event" });
      return;
    }

    // Must be the team leader
    const leaderReg = await Registration.findOne({ event: event._id, user: req.userId });
    if (!leaderReg || !leaderReg.teamName) {
      res.status(400).json({ success: false, message: "You don't have a team for this event" });
      return;
    }

    const { email } = req.body || {};
    if (!email || !String(email).trim()) {
      res.status(400).json({ success: false, message: "Member email is required" });
      return;
    }
    const memberEmail = String(email).trim().toLowerCase();

    // Check max team size
    const maxSize = event.maxTeamSize || 5;
    if (leaderReg.teamMembers.length + 1 >= maxSize) {
      res.status(400).json({
        success: false,
        message: `Team is at max capacity (${maxSize} members including you)`,
      });
      return;
    }

    // Check if already in this team
    if (leaderReg.teamMembers.some((m: any) => m.email.toLowerCase() === memberEmail)) {
      res.status(400).json({ success: false, message: "This person is already in your team" });
      return;
    }

    // Validate the member
    const memberUser = await User.findOne({ email: memberEmail });
    if (!memberUser) {
      res.status(400).json({ success: false, message: `"${memberEmail}" is not registered on the website.` });
      return;
    }

    const memberReg = await Registration.findOne({ event: event._id, user: memberUser._id });
    if (!memberReg) {
      res.status(400).json({ success: false, message: `"${memberEmail}" has not registered for this event yet.` });
      return;
    }
    if (memberReg.paymentStatus !== "completed") {
      res.status(400).json({ success: false, message: `"${memberEmail}" has not completed payment yet.` });
      return;
    }
    if (memberReg.teamName) {
      res.status(400).json({ success: false, message: `"${memberEmail}" is already a team leader for this event.` });
      return;
    }

    const inOtherTeam = await Registration.findOne({
      event: event._id,
      "teamMembers.email": memberEmail,
    });
    if (inOtherTeam) {
      res.status(400).json({ success: false, message: `"${memberEmail}" is already part of another team.` });
      return;
    }

    leaderReg.teamMembers.push({ name: memberUser.name, email: memberUser.email, phone: memberUser.phone || "" });
    await leaderReg.save();

    res.json({ success: true, message: `${memberUser.name} added to team!`, data: leaderReg });
  } catch (err) {
    console.error("AddTeamMember error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE /api/events/:id/remove-team-member
 * Leader removes a member from their team
 */
export const removeTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.isActive) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    const leaderReg = await Registration.findOne({ event: event._id, user: req.userId });
    if (!leaderReg || !leaderReg.teamName) {
      res.status(400).json({ success: false, message: "You don't have a team for this event" });
      return;
    }

    const { email } = req.body || {};
    if (!email) {
      res.status(400).json({ success: false, message: "Member email is required" });
      return;
    }

    const memberEmail = String(email).trim().toLowerCase();
    const idx = leaderReg.teamMembers.findIndex((m: any) => m.email.toLowerCase() === memberEmail);
    if (idx === -1) {
      res.status(400).json({ success: false, message: "This person is not in your team" });
      return;
    }

    leaderReg.teamMembers.splice(idx, 1);
    await leaderReg.save();

    res.json({ success: true, message: "Member removed from team", data: leaderReg });
  } catch (err) {
    console.error("RemoveTeamMember error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/events/:id/registrations
 * Admin: get all registrations for an event (with user details)
 */
export const getEventRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
      .populate("user", "name email phone university collegeName role gender")
      .populate("event", "title category date")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    console.error("GetEventRegistrations error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/events/user/my-registrations
 * Get registrations for the current authenticated user
 */
export const getMyRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    // Direct registrations
    const directRegs = await Registration.find({ user: req.userId })
      .populate("event", "title category cost date venue participationType image")
      .sort({ createdAt: -1 });

    // Also find registrations where this user's email is in teamMembers
    const user = await User.findById(req.userId);
    let teamRegs: any[] = [];
    if (user) {
      teamRegs = await Registration.find({
        user: { $ne: req.userId },
        "teamMembers.email": user.email.toLowerCase(),
      })
        .populate("event", "title category cost date venue participationType image")
        .populate("user", "name email")
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, count: directRegs.length + teamRegs.length, data: directRegs, teamData: teamRegs });
  } catch (err) {
    console.error("GetMyRegistrations error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/events/:id/check-registration
 * Check if current user is registered for this event.
 * Returns full registration data (team info, payment, etc.) so the
 * EventDetailPage can show "Your Team" details.
 * Also checks if the user appears as a teamMember in another leader's registration.
 */
export const checkRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check direct registration (user is the leader)
    const directReg = await Registration.findOne({ event: req.params.id, user: req.userId })
      .populate("user", "name email phone university collegeName");

    // Always check if the user is a team member in someone else's registration
    const currentUser = await User.findById(req.userId);
    let teamReg = null;
    if (currentUser) {
      teamReg = await Registration.findOne({
        event: req.params.id,
        "teamMembers.email": currentUser.email.toLowerCase(),
      }).populate("user", "name email phone university collegeName");
    }

    // If user is in someone else's team, prioritize that view
    if (teamReg) {
      res.json({ success: true, registered: true, registration: teamReg, asTeamMember: true });
      return;
    }

    if (directReg) {
      res.json({ success: true, registered: true, registration: directReg });
      return;
    }

    res.json({ success: true, registered: false, registration: null });
  } catch (err) {
    console.error("CheckRegistration error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE /api/events/registrations/:regId
 * User deletes their own registration
 */
export const deleteRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const reg = await Registration.findById(req.params.regId);
    if (!reg) {
      res.status(404).json({ success: false, message: "Registration not found" });
      return;
    }
    if (String(reg.user) !== String(req.userId)) {
      res.status(403).json({ success: false, message: "Not your registration" });
      return;
    }

    // Remove from user's registeredEvents
    await User.findByIdAndUpdate(req.userId, { $pull: { registeredEvents: reg.event } });

    await Registration.findByIdAndDelete(req.params.regId);

    res.json({ success: true, message: "Registration deleted" });
  } catch (err) {
    console.error("DeleteRegistration error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
