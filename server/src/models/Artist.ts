import mongoose, { Schema, Document } from "mongoose";

/* ── Document interface ── */
export interface IArtist extends Document {
  name: string;
  description: string;
  photo: string;             // URL / path to artist photo
  createdAt: Date;
  updatedAt: Date;
}

/* ── Schema ── */
const artistSchema = new Schema<IArtist>(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, required: true },
    photo:       { type: String, required: true },    // image URL
  },
  { timestamps: true },
);

artistSchema.index({ name: 1 });

export const Artist = mongoose.model<IArtist>("Artist", artistSchema);
