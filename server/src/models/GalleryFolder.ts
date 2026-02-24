import mongoose, { Schema, Document } from "mongoose";

export interface IGalleryFolder extends Document {
  year: number;
  title: string;
  driveFolderId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryFolderSchema = new Schema<IGalleryFolder>(
  {
    year: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    driveFolderId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const GalleryFolder = mongoose.model<IGalleryFolder>("GalleryFolder", GalleryFolderSchema);
