import mongoose, { Schema, Document } from "mongoose";

/* ── Category enum ── */
export type EventCategory =
  | "cultural"
  | "literary"
  | "trending_event"
  | "technical";

/* ── Participation type ── */
export type ParticipationType = "solo" | "team";

/* ── Coordinator sub-doc ── */
export interface ICoordinator {
  name: string;
  phone: string;
}

/* ── Document interface ── */
export interface IEvent extends Document {
  title: string;
  category: EventCategory;
  cost: number;                          // ₹ entry fee (0 = free)
  venue: string;
  participationType: ParticipationType;  // solo or team
  minTeamSize: number;                   // min members (including leader)
  maxTeamSize: number;                   // max members (including leader)
  date: Date;
  image?: string;                        // URL / link (optional)
  studentCoordinators: ICoordinator[];
  facultyCoordinators: ICoordinator[];
  rules?: string;
  prizes?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/* ── Schema ── */
const coordinatorSubDoc = {
  name:  { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
};

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["cultural", "literary", "trending_event", "technical"],
      required: true,
    },
    cost:              { type: Number, default: 0, min: 0 },
    venue:             { type: String, required: true, trim: true },
    participationType: {
      type: String,
      enum: ["solo", "team"],
      required: true,
    },
    minTeamSize:       { type: Number, default: 2, min: 1 },
    maxTeamSize:       { type: Number, default: 5, min: 1 },
    date:              { type: Date, required: true },
    image:             { type: String },        // optional link
    studentCoordinators: [coordinatorSubDoc],
    facultyCoordinators: [coordinatorSubDoc],
    rules:             { type: String },
    prizes:            { type: String },
    isActive:          { type: Boolean, default: true },
    createdBy:         { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

eventSchema.index({ category: 1 });
eventSchema.index({ date: 1 });

export const Event = mongoose.model<IEvent>("Event", eventSchema);
