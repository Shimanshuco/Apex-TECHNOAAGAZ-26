import mongoose, { Schema, Document } from "mongoose";

/* ── Role enum ── */
export type UserRole = "participant" | "volunteer" | "admin";

/* ── University enum ── */
export type UniversityType = "apex_university" | "other";

/* ── Gender enum ── */
export type Gender = "male" | "female";

/* ── Document interface ── */
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;

  /* ── Participant-specific fields ── */
  university?: UniversityType;        // "apex_university" or "other"
  collegeName?: string;               // filled when university = "other"
  gender?: Gender;
  bloodGroup?: string;
  address?: string;

  /* ── Common ── */
  qrCode: string;                     // base-64 data-URL of QR png
  isVerified: boolean;                // QR-scanned at venue
  scanCount: number;                  // how many times QR was scanned
  scanHistory: {
    scannedBy: mongoose.Types.ObjectId; // volunteer/admin who scanned
    scannedAt: Date;
    result: 'allowed' | 'denied';       // first scan = allowed, rest = denied
  }[];
  registeredEvents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/* ── Schema ── */
const userSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:    { type: String, trim: true },
    password: { type: String, required: true, select: false },      // hidden by default
    role: {
      type: String,
      enum: ["participant", "volunteer", "admin"],
      default: "participant",
    },

    /* ── Participant / Volunteer fields ── */
    university: {
      type: String,
      enum: ["apex_university", "other"],
    },
    collegeName: { type: String, trim: true },                      // if university = "other"
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    address: { type: String, trim: true },

    /* ── Common ── */
    qrCode:   { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    scanCount: { type: Number, default: 0 },
    scanHistory: [{
      scannedBy: { type: Schema.Types.ObjectId, ref: "User" },
      scannedAt: { type: Date, default: Date.now },
      result: { type: String, enum: ["allowed", "denied"] },
    }],
    registeredEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  },
  { timestamps: true },
);

/* ── Index for fast look-ups ── */
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
