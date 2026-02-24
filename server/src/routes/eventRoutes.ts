import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  getEventsByCategory,
  updateEvent,
  deleteEvent,
  registerForEvent,
  createTeam,
  addTeamMember,
  removeTeamMember,
  getEventRegistrations,
  getMyRegistrations,
  checkRegistration,
  getPricing,
} from "../controllers/eventController";
import { authenticate } from "../middlewares/auth";
import { roleGuard } from "../middlewares/roleGuard";

const router = Router();

// Public
router.get("/", getAllEvents);
router.get("/category/:category", getEventsByCategory);
router.get("/pricing", getPricing);

// Authenticated user: my registrations (must be BEFORE /:id)
router.get("/user/my-registrations", authenticate, getMyRegistrations);

router.get("/:id", getEventById);

// Check if user is registered for an event
router.get("/:id/check-registration", authenticate, checkRegistration);

// Admin only
router.post("/", authenticate, roleGuard("admin"), createEvent);
router.put("/:id", authenticate, roleGuard("admin"), updateEvent);
router.delete("/:id", authenticate, roleGuard("admin"), deleteEvent);

// Admin: view registrations for an event
router.get("/:id/registrations", authenticate, roleGuard("admin"), getEventRegistrations);

// Any authenticated user can register for an event
router.post("/:id/register", authenticate, registerForEvent);

// Team events: form a team after everyone has registered + paid
router.post("/:id/create-team", authenticate, createTeam);

// Leader: manage team members
router.post("/:id/add-team-member", authenticate, addTeamMember);
router.delete("/:id/remove-team-member", authenticate, removeTeamMember);

export default router;
