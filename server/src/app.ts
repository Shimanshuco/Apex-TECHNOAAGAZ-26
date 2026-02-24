import express, { Request, Response, NextFunction } from "express";

// Route imports
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import eventRoutes from "./routes/eventRoutes";
import qrRoutes from "./routes/qrRoutes";
import artistRoutes from "./routes/artistRoutes";
import paymentRoutes from "./routes/paymentRoutes";

const app = express();

/* ── CORS — manual, bulletproof, no dependencies ─────── */
app.use((req, res, next) => {
  // Reflect the requesting origin (credentials-compatible)
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Preflight → respond immediately with 204
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

/* ── Global middleware ──────────────────────────────── */
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

/* ── Global error handler ───────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("🔥 Unhandled error:", err);
  const message =
    err instanceof Error ? err.message : "Internal server error";
  if (!res.headersSent) {
    res.status(500).json({ success: false, message });
  }
});

/* ── 404 catch-all ──────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
