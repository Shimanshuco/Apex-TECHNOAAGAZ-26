import mongoose, { Schema, Document } from "mongoose";

/* ── Payment status enum ── */
export type PaymentStatus = "pending" | "completed" | "failed";

/* ── Team member sub-doc ── */
export interface ITeamMember {
  name: string;
  email: string;
  phone: string;
}

/* ── Document interface ── */
export interface IRegistration extends Document {
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  teamName?: string;
  teamMembers: ITeamMember[];
  paymentStatus: PaymentStatus;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayQrId?: string;
  paymentScreenshot?: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

/* ── Schema ── */
const registrationSchema = new Schema<IRegistration>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    teamName: { type: String, trim: true },
    teamMembers: [
      {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
      },
    ],
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpayQrId: { type: String },
    paymentScreenshot: { type: String },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

registrationSchema.index({ event: 1, user: 1 }, { unique: true });
registrationSchema.index({ user: 1 });
registrationSchema.index({ event: 1 });

export const Registration = mongoose.model<IRegistration>(
  "Registration",
  registrationSchema,
);
