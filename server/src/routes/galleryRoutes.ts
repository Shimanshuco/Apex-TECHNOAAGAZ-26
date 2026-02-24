import { Router } from "express";
import {
  getGalleryFolders,
  getAllGalleryFolders,
  createGalleryFolder,
  updateGalleryFolder,
  deleteGalleryFolder,
  getGalleryImages,
} from "../controllers/galleryController";
import { authenticate } from "../middlewares/auth";
import { roleGuard } from "../middlewares/roleGuard";

const router = Router();

// Public: get active gallery folders
router.get("/", getGalleryFolders);

// Public: get images for a folder (proxied via server)
router.get("/:id/images", getGalleryImages);

// Admin only
router.get("/all", authenticate, roleGuard("admin"), getAllGalleryFolders);
router.post("/", authenticate, roleGuard("admin"), createGalleryFolder);
router.put("/:id", authenticate, roleGuard("admin"), updateGalleryFolder);
router.delete("/:id", authenticate, roleGuard("admin"), deleteGalleryFolder);

export default router;
