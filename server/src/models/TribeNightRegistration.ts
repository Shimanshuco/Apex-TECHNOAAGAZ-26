import mongoose, { Schema, Document } from "mongoose";

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
