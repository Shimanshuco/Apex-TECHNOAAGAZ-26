import mongoose, { Schema, Document } from "mongoose";

/* ── Scan history entry ── */
interface ScanEntry {
  scannedBy: mongoose.Types.ObjectId;
  scannedAt: Date;
  result: "allowed" | "denied";
}

/* ── Document interface ── */
export interface ITribeNightRegistration extends Document {
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  password: string;
  paymentScreenshot: string;
  paymentStatus: "pending" | "completed" | "failed";
  amount: number;
  qrCode?: string;
  isVerified: boolean;
  scanCount: number;
  scanHistory: ScanEntry[];
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/* ── Schema ── */
const tribeNightRegistrationSchema = new Schema<ITribeNightRegistration>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ["male", "female"] },
    password: { type: String, required: true },
    paymentScreenshot: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    amount: { type: Number, required: true, default: 300 },
    qrCode: { type: String },
    isVerified: { type: Boolean, default: false },
    scanCount: { type: Number, default: 0 },
    scanHistory: [
      {
        scannedBy: { type: Schema.Types.ObjectId, ref: "User" },
        scannedAt: { type: Date, default: Date.now },
        result: { type: String, enum: ["allowed", "denied"] },
      },
    ],
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/* ── Indexes ── */
tribeNightRegistrationSchema.index({ email: 1 }, { unique: true });
tribeNightRegistrationSchema.index({ phone: 1 });
tribeNightRegistrationSchema.index({ registeredAt: -1 });
tribeNightRegistrationSchema.index({ paymentStatus: 1 });

export default mongoose.model<ITribeNightRegistration>("TribeNightRegistration", tribeNightRegistrationSchema);
