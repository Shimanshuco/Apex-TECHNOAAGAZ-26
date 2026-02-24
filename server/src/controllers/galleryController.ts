import { Request, Response } from "express";
import { GalleryFolder } from "../models/GalleryFolder";

/**
 * Extract Google Drive folder ID from various URL formats
 * e.g. https://drive.google.com/drive/folders/1ABC123?usp=sharing → 1ABC123
 */
function extractFolderId(input: string): string {
  const trimmed = input.trim();
  // If it's already just an ID (no slashes or URL characters)
  if (/^[\w-]+$/.test(trimmed)) return trimmed;
  // Try matching the folders/ pattern
  const match = trimmed.match(/folders\/([^/?]+)/);
  return match ? match[1] : trimmed;
}

/**
 * GET /api/gallery
 * List all active gallery folders (public)
 */
export const getGalleryFolders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const folders = await GalleryFolder.find({ isActive: true }).sort({ year: -1 });
    res.json({ success: true, data: folders });
  } catch (err) {
    console.error("GetGalleryFolders error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/gallery/all
 * List ALL gallery folders — admin only
 */
export const getAllGalleryFolders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const folders = await GalleryFolder.find().sort({ year: -1 });
    res.json({ success: true, data: folders });
  } catch (err) {
    console.error("GetAllGalleryFolders error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/gallery
 * Create a gallery folder entry (admin only)
 */
export const createGalleryFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, title, driveFolderLink } = req.body;

    if (!year || !title || !driveFolderLink) {
      res.status(400).json({ success: false, message: "year, title, and driveFolderLink are required" });
      return;
    }

    const driveFolderId = extractFolderId(driveFolderLink);

    // Check for duplicate year
    const existing = await GalleryFolder.findOne({ year });
    if (existing) {
      res.status(400).json({ success: false, message: `Gallery folder for year ${year} already exists` });
      return;
    }

    const folder = await GalleryFolder.create({
      year: Number(year),
      title: String(title).trim(),
      driveFolderId,
    });

    res.status(201).json({ success: true, message: "Gallery folder created", data: folder });
  } catch (err) {
    console.error("CreateGalleryFolder error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/gallery/:id
 * Update a gallery folder entry (admin only)
 */
export const updateGalleryFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, title, driveFolderLink, isActive } = req.body;

    const update: any = {};
    if (year !== undefined) update.year = Number(year);
    if (title !== undefined) update.title = String(title).trim();
    if (driveFolderLink !== undefined) update.driveFolderId = extractFolderId(driveFolderLink);
    if (isActive !== undefined) update.isActive = Boolean(isActive);

    const folder = await GalleryFolder.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });

    if (!folder) {
      res.status(404).json({ success: false, message: "Gallery folder not found" });
      return;
    }

    res.json({ success: true, message: "Gallery folder updated", data: folder });
  } catch (err) {
    console.error("UpdateGalleryFolder error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE /api/gallery/:id
 * Delete a gallery folder entry (admin only)
 */
export const deleteGalleryFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const folder = await GalleryFolder.findByIdAndDelete(req.params.id);
    if (!folder) {
      res.status(404).json({ success: false, message: "Gallery folder not found" });
      return;
    }
    res.json({ success: true, message: "Gallery folder deleted" });
  } catch (err) {
    console.error("DeleteGalleryFolder error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/gallery/:id/images
 * Proxy Google Drive API to list images in a folder.
 * This keeps the API key server-side.
 */
export const getGalleryImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const folder = await GalleryFolder.findById(req.params.id);
    if (!folder || !folder.isActive) {
      res.status(404).json({ success: false, message: "Gallery folder not found" });
      return;
    }

    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    if (!apiKey) {
      res.status(500).json({ success: false, message: "Google Drive API key not configured" });
      return;
    }

    const url = `https://www.googleapis.com/drive/v3/files?q='${folder.driveFolderId}'+in+parents+and+mimeType+contains+'image'&key=${apiKey}&fields=files(id,name,mimeType,thumbnailLink)&pageSize=100&orderBy=name`;

    const response = await fetch(url);
    const data = await response.json() as { files?: { id: string; name: string; mimeType: string; thumbnailLink?: string }[] };

    if (!response.ok) {
      console.error("Google Drive API error:", data);
      res.status(502).json({ success: false, message: "Failed to fetch images from Google Drive" });
      return;
    }

    // Map to usable image URLs
    const images = (data.files || []).map((file: any, index: number) => ({
      id: file.id,
      name: file.name,
      src: `https://lh3.googleusercontent.com/d/${file.id}=s1200`,
      thumbnail: `https://lh3.googleusercontent.com/d/${file.id}=s400`,
      index: index + 1,
    }));

    res.json({ success: true, data: images, count: images.length });
  } catch (err) {
    console.error("GetGalleryImages error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
