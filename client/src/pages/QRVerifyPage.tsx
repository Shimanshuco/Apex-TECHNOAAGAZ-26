import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components";
import {
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Mail,
  Phone,
  GraduationCap,
  Shield,
  ScanLine,
  RotateCcw,
  Loader2,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────── */
interface ScannedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  university?: string;
  collegeName?: string;
  isVerified: boolean;
  scanCount: number;
  firstScannedAt?: string | null;
}

type ResultType = "allowed" | "denied" | "error";

interface ScanResult {
  type: ResultType;
  message: string;
  user?: ScannedUser;
}

/* ─── Component ─────────────────────────────────────── */
const QRVerifyPage: React.FC = () => {
  const { token } = useAuth();

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef(false); // prevent double-processing

  /* ─── Parse QR content ────────────────────────────── */
  const extractUserId = (raw: string): string | null => {
    try {
      // QR encodes JSON: { userId, name, email, role }
      const parsed = JSON.parse(raw);
      if (parsed.userId) return parsed.userId;
    } catch {
      // Might be a plain userId string
    }
    // If it looks like a MongoDB ObjectId (24 hex chars), use directly
    if (/^[a-f0-9]{24}$/i.test(raw.trim())) return raw.trim();
    return null;
  };

  /* ─── Call backend verify ─────────────────────────── */
  const verifyScan = useCallback(
    async (userId: string) => {
      if (loading || cooldown) return;
      setLoading(true);
      setResult(null);

      try {
        const res = await api<{ message: string; data: ScannedUser }>(
          "/qr/verify",
          { method: "POST", body: { userId }, token },
        );
        setResult({ type: "allowed", message: res.message, user: res.data });
      } catch (err: any) {
        if (err.status === 403 && err.data) {
          // ACCESS DENIED — already scanned
          setResult({
            type: "denied",
            message: err.message || "Access Denied",
            user: err.data,
          });
        } else {
          setResult({
            type: "error",
            message: err.message || "Verification failed",
          });
        }
      } finally {
        setLoading(false);
        // Cooldown to prevent rapid re-scans
        setCooldown(true);
        setTimeout(() => {
          setCooldown(false);
          processedRef.current = false;
        }, 3000);
      }
    },
    [token, loading, cooldown],
  );

  /* ─── QR decoded callback ─────────────────────────── */
  const onScanSuccess = useCallback(
    (decodedText: string) => {
      if (processedRef.current || loading || cooldown) return;
      processedRef.current = true;

      const userId = extractUserId(decodedText);
      if (!userId) {
        setResult({ type: "error", message: "Invalid QR code — no user ID found" });
        setTimeout(() => { processedRef.current = false; }, 2000);
        return;
      }

      verifyScan(userId);
    },
    [verifyScan, loading, cooldown],
  );

  /* ─── Start camera ────────────────────────────────── */
  const startScanner = useCallback(async () => {
    if (scannerRef.current) return;
    setResult(null);
    processedRef.current = false;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        onScanSuccess,
        () => {}, // ignore scan failures (no QR in frame)
      );
      setScanning(true);
    } catch (err) {
      console.error("Camera start error:", err);
      setResult({
        type: "error",
        message: "Could not access camera. Please allow camera permission and try again.",
      });
      scannerRef.current = null;
    }
  }, [onScanSuccess]);

  /* ─── Stop camera ─────────────────────────────────── */
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // scanner might already be stopped
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  /* ─── Cleanup on unmount ──────────────────────────── */
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  /* ─── Reset for next scan ─────────────────────────── */
  const handleReset = () => {
    setResult(null);
    processedRef.current = false;
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">
        <ScanLine className="inline-block mr-2 text-gold" size={28} />
        QR Scanner
      </h1>
      <p className="text-gray-400 mb-8">
        Point the camera at an attendee's QR code to verify entry
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ─── Camera Section ───────────────────────── */}
        <Card variant="neon" glowColor="gold" className="overflow-hidden">
          <div className="p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Camera size={18} className="text-gold" /> Camera Scanner
            </h3>

            {/* Scanner container */}
            <div
              ref={containerRef}
              className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10"
              style={{ minHeight: 300 }}
            >
              <div id="qr-reader" className="w-full" />

              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-navy/50 border-2 border-gold/40 flex items-center justify-center">
                    <CameraOff size={36} className="text-gray-500" />
                  </div>
                  <p className="text-gray-500 text-sm">Camera is off</p>
                </div>
              )}
            </div>

            {/* Camera controls */}
            <div className="flex gap-3 mt-4">
              {!scanning ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={startScanner}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Camera size={18} /> Start Camera
                  </span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={stopScanner}
                >
                  <span className="flex items-center justify-center gap-2">
                    <CameraOff size={18} /> Stop Camera
                  </span>
                </Button>
              )}
            </div>

            {scanning && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gold animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                Scanning for QR codes…
              </div>
            )}
          </div>
        </Card>

        {/* ─── Result Section ───────────────────────── */}
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Scan Result
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 size={40} className="text-gold animate-spin" />
              <p className="text-gray-400">Verifying…</p>
            </div>
          ) : !result ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <ScanLine size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Point camera at a QR code</p>
              <p className="text-xs text-gray-700 mt-1">
                Result will appear here automatically
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ── Status Banner ── */}
              {result.type === "allowed" && (
                <div className="p-5 rounded-xl bg-green-500/10 border-2 border-green-500/50 text-center">
                  <CheckCircle size={48} className="text-green-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-green-400">ENTRY ALLOWED</p>
                  <p className="text-green-300/80 text-sm mt-1">{result.message}</p>
                </div>
              )}

              {result.type === "denied" && (
                <div className="p-5 rounded-xl bg-red-500/10 border-2 border-red-500/50 text-center">
                  <XCircle size={48} className="text-red-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-red-400">ACCESS DENIED</p>
                  <p className="text-red-300/80 text-sm mt-1">{result.message}</p>
                  {result.user && (
                    <div className="mt-3 space-y-1">
                      <p className="text-red-300 text-sm font-medium">
                        Total scan attempts: {result.user.scanCount}
                      </p>
                      {result.user.firstScannedAt && (
                        <p className="text-red-300/60 text-xs">
                          First scanned: {new Date(result.user.firstScannedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {result.type === "error" && (
                <div className="p-5 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/50 text-center">
                  <AlertTriangle size={48} className="text-yellow-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-yellow-400">ERROR</p>
                  <p className="text-yellow-300/80 text-sm mt-1">{result.message}</p>
                </div>
              )}

              {/* ── User Details ── */}
              {result.user && (
                <div className="mt-4 space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Attendee Details
                  </h4>
                  <div className="flex items-center gap-3 text-gray-300">
                    <User size={16} className="text-gold/70 shrink-0" />
                    <span className="font-medium">{result.user.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail size={16} className="text-gold/70 shrink-0" />
                    <span>{result.user.email}</span>
                  </div>
                  {result.user.phone && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Phone size={16} className="text-gold/70 shrink-0" />
                      <span>{result.user.phone}</span>
                    </div>
                  )}
                  {(result.user.university || result.user.collegeName) && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <GraduationCap size={16} className="text-gold/70 shrink-0" />
                      <span>
                        {result.user.university === "apex_university"
                          ? "Apex University"
                          : result.user.collegeName || result.user.university}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-300">
                    <Shield size={16} className="text-gold/70 shrink-0" />
                    <span className="capitalize">{result.user.role}</span>
                  </div>
                </div>
              )}

              {/* ── Reset Button ── */}
              <Button
                variant="outline"
                size="md"
                className="w-full mt-2"
                onClick={handleReset}
              >
                <span className="flex items-center justify-center gap-2">
                  <RotateCcw size={16} /> Scan Next
                </span>
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* ─── How It Works ───────────────────────────── */}
      <Card variant="glass" className="mt-8 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How Scanning Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-gold font-bold text-lg">1</span>
            </div>
            <h4 className="text-white font-medium mb-1">Start Camera</h4>
            <p className="text-gray-400 text-sm">
              Click "Start Camera" and point it at the attendee's QR code on their phone
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-green-400 font-bold text-lg">2</span>
            </div>
            <h4 className="text-white font-medium mb-1">First Scan = Entry</h4>
            <p className="text-gray-400 text-sm">
              If this is the first scan, the attendee is verified and allowed in. Green screen appears.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-red-400 font-bold text-lg">3</span>
            </div>
            <h4 className="text-white font-medium mb-1">Repeat = Denied</h4>
            <p className="text-gray-400 text-sm">
              If already scanned, a red "ACCESS DENIED" screen shows with total scan attempts.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
};

export default QRVerifyPage;
