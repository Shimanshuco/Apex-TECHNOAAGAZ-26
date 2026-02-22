import { Request, Response } from "express";
import { Artist } from "../models/Artist";
import { artistSchema } from "../utils/validators";

/**
 * POST /api/artists
 * Create a new artist (admin only)
 */
export const createArtist = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = artistSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const artist = await Artist.create(parsed.data);
    res.status(201).json({ success: true, message: "Artist created", data: artist });
  } catch (err) {
    console.error("CreateArtist error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/artists
 * List all artists (public)
 */
export const getAllArtists = async (_req: Request, res: Response): Promise<void> => {
  try {
    const artists = await Artist.find().sort({ createdAt: -1 });
    res.json({ success: true, count: artists.length, data: artists });
  } catch (err) {
    console.error("GetAllArtists error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/artists/:id
 * Single artist detail (public)
 */
export const getArtistById = async (req: Request, res: Response): Promise<void> => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      res.status(404).json({ success: false, message: "Artist not found" });
      return;
    }
    res.json({ success: true, data: artist });
  } catch (err) {
    console.error("GetArtistById error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/artists/:id
 * Update an artist (admin only)
 */
export const updateArtist = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = artistSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const artist = await Artist.findByIdAndUpdate(req.params.id, parsed.data, {
      new: true,
      runValidators: true,
    });

    if (!artist) {
      res.status(404).json({ success: false, message: "Artist not found" });
      return;
    }

    res.json({ success: true, message: "Artist updated", data: artist });
  } catch (err) {
    console.error("UpdateArtist error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE /api/artists/:id
 * Delete an artist (admin only)
 */
export const deleteArtist = async (req: Request, res: Response): Promise<void> => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);
    if (!artist) {
      res.status(404).json({ success: false, message: "Artist not found" });
      return;
    }
    res.json({ success: true, message: "Artist deleted" });
  } catch (err) {
    console.error("DeleteArtist error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
