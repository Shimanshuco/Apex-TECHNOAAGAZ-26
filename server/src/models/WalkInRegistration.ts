import mongoose, { Schema, Document } from "mongoose";

/* ── Document interface ── */
export interface IWalkInRegistration extends Document {
  name: string;
  phone: string;
  course: string;
  college: string;
  registeredAt: Date;
  registeredBy?: mongoose.Types.ObjectId; // volunteer who scanned (if logged in)
  createdAt: Date;
  updatedAt: Date;
}

/* ── Schema ── */
const walkInRegistrationSchema = new Schema<IWalkInRegistration>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    college: { type: String, required: true, trim: true },
    registeredAt: { type: Date, default: Date.now },
    registeredBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/* ── Index for quick lookups by date ── */
walkInRegistrationSchema.index({ registeredAt: -1 });
walkInRegistrationSchema.index({ phone: 1 });

export default mongoose.model<IWalkInRegistration>("WalkInRegistration", walkInRegistrationSchema);
