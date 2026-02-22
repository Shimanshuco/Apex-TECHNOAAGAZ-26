import express from "express";
import cors from "cors";
import { ENV } from "./config/env";

// Route imports
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import eventRoutes from "./routes/eventRoutes";
import qrRoutes from "./routes/qrRoutes";
import artistRoutes from "./routes/artistRoutes";
import paymentRoutes from "./routes/paymentRoutes";

const app = express();

/* ── Global middleware ──────────────────────────────── */
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "5mb" })); // QR codes can be large base64

/* ── Health check ───────────────────────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ── API routes ─────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/payments", paymentRoutes);

/* ── 404 catch-all ──────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
