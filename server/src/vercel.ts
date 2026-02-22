/**
 * Vercel serverless entry point.
 *
 * Unlike server.ts (which calls app.listen + process.exit),
 * this file ONLY connects to MongoDB and exports the Express app.
 * Mongoose buffers queries until the connection is ready, so
 * requests arriving during a cold-start will wait automatically.
 */
import mongoose from "mongoose";
import app from "./app";

const MONGO_URI = process.env.MONGO_URI || "";

// Connect once per cold-start; Mongoose caches the connection.
if (mongoose.connection.readyState === 0 && MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected (serverless)"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
}

export default app;
