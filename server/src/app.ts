import express, { Request, Response, NextFunction } from "express";

// Route imports
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import eventRoutes from "./routes/eventRoutes";
import qrRoutes from "./routes/qrRoutes";
import artistRoutes from "./routes/artistRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import galleryRoutes from "./routes/galleryRoutes";

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
app.use(express.json({ limit: "4.5mb" })); // Vercel serverless hard-limits body to 4.5 MB

/* ── Health check ───────────────────────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ── Drive credential diagnostic (admin only, no auth for now) ── */
app.get("/api/health/drive", async (_req, res) => {
  const { ENV } = await import("./config/env");
  const info: Record<string, string> = {};
  info.FOLDER_ID = ENV.GOOGLE_DRIVE_FOLDER_ID ? `set (${ENV.GOOGLE_DRIVE_FOLDER_ID.length} chars)` : "MISSING";
  info.SERVICE_EMAIL = ENV.GOOGLE_SERVICE_ACCOUNT_EMAIL || "MISSING";
  const pk = ENV.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!pk) {
    info.PRIVATE_KEY = "MISSING";
  } else if (!pk.includes("-----BEGIN")) {
    info.PRIVATE_KEY = `MALFORMED — starts with: '${pk.substring(0, 50)}...'`;
  } else {
    info.PRIVATE_KEY = `OK (${pk.length} chars, starts with -----BEGIN)`;
  }
  // Try to get an access token
  try {
    const { uploadScreenshotToDrive } = await import("./utils/driveUploader");
    // We won't actually upload, but calling getAccessToken via a tiny test
    // Just verify JWT signing works by checking the module loads
    info.MODULE_LOADS = "OK";
  } catch (e: any) {
    info.MODULE_LOADS = `FAIL: ${e.message}`;
  }
  res.json({ success: true, drive: info });
});

/* ── API routes ─────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/gallery", galleryRoutes);

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
