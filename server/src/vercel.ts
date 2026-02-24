/**
 * Vercel serverless entry point.
 *
 * Unlike server.ts (which calls app.listen + process.exit),
 * this file ONLY connects to MongoDB and exports the Express app.
 * Includes retry logic for cold-start reliability. Mongoose buffers
 * queries until the connection is ready, and the global error handler
 * in app.ts catches anything that slips through.
 */
import mongoose from "mongoose";
import app from "./app";

const MONGO_URI = process.env.MONGO_URI || "";

let connectionPromise: Promise<void> | null = null;

function ensureConnection(): Promise<void> {
  if (mongoose.connection.readyState === 1) return Promise.resolve();

  if (!connectionPromise) {
    connectionPromise = (async () => {
      const MAX_RETRIES = 3;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
          });
          console.log("✅ MongoDB connected (serverless)");
          return;
        } catch (err) {
          console.error(`❌ MongoDB attempt ${attempt}/${MAX_RETRIES} failed:`, err);
          connectionPromise = null; // allow future retries
          if (attempt === MAX_RETRIES) throw err;
          await new Promise((r) => setTimeout(r, 500 * attempt));
        }
      }
    })();
  }

  return connectionPromise;
}

// Start connecting immediately on cold-start
if (MONGO_URI) {
  ensureConnection().catch(() => {});
}

export default app;
