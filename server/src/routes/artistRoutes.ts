import { Router } from "express";
import {
  createArtist,
  getAllArtists,
  getArtistById,
  updateArtist,
  deleteArtist,
} from "../controllers/artistController";
import { authenticate } from "../middlewares/auth";
import { roleGuard } from "../middlewares/roleGuard";

const router = Router();

// Public
router.get("/", getAllArtists);
router.get("/:id", getArtistById);

// Admin only
router.post("/", authenticate, roleGuard("admin"), createArtist);
router.put("/:id", authenticate, roleGuard("admin"), updateArtist);
router.delete("/:id", authenticate, roleGuard("admin"), deleteArtist);

export default router;
