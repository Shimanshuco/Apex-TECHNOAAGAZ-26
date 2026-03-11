import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, Button } from "../components";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import AnimatedBackground from "../components/AnimatedBackground";
import AuthNavbar from "../components/AuthNavbar";
import {
  Upload,
  X,
  IndianRupee,
  QrCode,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  PartyPopper,
  Eye,
  EyeOff,
} from "lucide-react";

/* ── Event details ── */
const TRIBE_NIGHT_PRICE = 300;

/* ── Gender options ── */
const GENDER_OPTIONS = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

/* ── Compress image to base64 (max 1200px, quality 0.7) ── */
const compressImage = (file: File, maxWidth = 1200, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = (h * maxWidth) / w;
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas error");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const TribeNightRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  /* ── Handle screenshot file select ── */
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Maximum 5MB allowed.");
      return;
    }
    try {
      setError("");
      const compressed = await compressImage(file);
      setScreenshot(compressed);
      setScreenshotName(file.name);
    } catch {
      setError("Failed to process image. Please try another file.");
    }
  }, []);

  /* ── Remove screenshot ── */
  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Submit registration ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!form.phone.trim() || form.phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    if (!form.gender) {
      setError("Please select your gender");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!screenshot) {
      setError("Please upload a payment screenshot");
      return;
    }

    setLoading(true);
    try {
      await api("/tribe-night/register", {
        method: "POST",
        body: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          gender: form.gender,
          password: form.password,
          paymentScreenshot: screenshot,
        },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <AnimatedBackground variant="cyan" />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card variant="neon" glowColor="navy" className="max-w-md w-full text-center p-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-amber-500/20">
              <Clock size={40} className="text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Payment Under Verification
            </h2>
            <p className="text-gray-400 mb-4">
              Your registration for{" "}
              <span className="text-gold font-semibold">Tribe Night</span>{" "}
              has been submitted. The organizers will verify your payment.
            </p>
            <p className="text-amber-400 text-sm mb-6">
              ₹{TRIBE_NIGHT_PRICE} — Payment screenshot submitted for verification
            </p>
            <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 text-left mb-6">
              <p className="text-sm text-gold font-semibold mb-1 flex items-center gap-2">
                <QrCode size={16} /> What happens next?
              </p>
              <p className="text-gray-400 text-sm">
                Once your payment is verified, you will receive a QR code that serves as your entry pass.
                You can check your status by logging in with your email and password.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={() => navigate("/tribe-night/status")}>
                Check Status
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12 relative">
      <AuthNavbar />
      <AnimatedBackground variant="cyan" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <PartyPopper size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-gold bg-clip-text text-transparent">
            Tribe Night Registration
          </h1>
          <p className="text-gray-400 mt-2">
            Register for the ultimate night event
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
            <IndianRupee size={16} className="text-gold" />
            <span className="text-gold font-bold">{TRIBE_NIGHT_PRICE}</span>
            <span className="text-gray-400 text-sm">Entry Fee</span>
          </div>
        </div>

        <Card variant="neon" glowColor="gold" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Name */}
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
            </div>

            {/* Gender */}
            <Select
              label="Gender"
              options={GENDER_OPTIONS}
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              required
            />

            {/* Payment Section */}
            <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <QrCode size={18} className="text-gold" /> Payment Details
              </h3>

              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-gray-300">Entry Fee</span>
                <span className="text-2xl font-bold text-gold flex items-center gap-1">
                  <IndianRupee size={18} /> {TRIBE_NIGHT_PRICE}
                </span>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-300 mb-3 text-center">
                  Scan the QR code below with any UPI app and pay{" "}
                  <span className="text-gold font-semibold">₹{TRIBE_NIGHT_PRICE}</span>
                </p>
                <div className="bg-white rounded-xl p-3">
                  <img
                    src="/qr.jpeg"
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-white">
                  Upload Payment Screenshot
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {!screenshot ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 rounded-xl border-2 border-dashed border-white/15 hover:border-gold/40 transition-colors bg-white/3 flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Click to upload screenshot
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG up to 5MB
                    </span>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={screenshot}
                      alt="Payment screenshot"
                      className="w-full max-h-48 object-contain bg-black/40"
                    />
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-red-500/80 transition-colors"
                    >
                      <X size={16} className="text-white" />
                    </button>
                    <div className="p-2 bg-black/30 text-xs text-gray-400 truncate">
                      {screenshotName}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} className="text-green-400/70" />
                Your payment will be verified by the organizers.
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Use this password to check your registration status and access your QR code after verification.
            </p>

            {/* Submit Button */}
            <Button
              variant="neon"
              size="lg"
              className="w-full"
              type="submit"
              disabled={loading || !screenshot}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Registering...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle size={18} />
                  Complete Registration
                </span>
              )}
            </Button>
          </form>
        </Card>

        {/* Login link */}
        <p className="text-center text-gray-500 mt-4">
          Already registered?{" "}
          <button
            onClick={() => navigate("/tribe-night/status")}
            className="text-gold hover:underline font-medium"
          >
            Check your status
          </button>
        </p>
      </div>
    </div>
  );
};

export default TribeNightRegistrationPage;
