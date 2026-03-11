import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card, Button } from "../components";
import { Input } from "../components/Input";
import AnimatedBackground from "../components/AnimatedBackground";
import AuthNavbar from "../components/AuthNavbar";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  QrCode,
  PartyPopper,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

interface RegistrationData {
  id: string;
  name: string;
  email: string;
  phone: string;
  paymentStatus: "pending" | "completed" | "failed";
  qrCode?: string;
  amount: number;
}

const TribeNightStatusPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState<RegistrationData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const res = await api<{ success: boolean; data: RegistrationData }>("/tribe-night/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });
      setRegistration(res.data);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!registration) return null;

    switch (registration.paymentStatus) {
      case "completed":
        return {
          icon: <CheckCircle size={40} className="text-green-400" />,
          title: "Payment Verified!",
          description: "Your payment has been verified. Here is your entry QR code:",
          bgColor: "bg-green-500/20",
          showQR: true,
        };
      case "pending":
        return {
          icon: <Clock size={40} className="text-amber-400" />,
          title: "Payment Under Verification",
          description: "Our team is reviewing your payment. Please check back later.",
          bgColor: "bg-amber-500/20",
          showQR: false,
        };
      case "failed":
        return {
          icon: <XCircle size={40} className="text-red-400" />,
          title: "Payment Rejected",
          description: "Your payment could not be verified. Please register again with a valid payment screenshot.",
          bgColor: "bg-red-500/20",
          showQR: false,
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12 relative">
      <AuthNavbar />
      <AnimatedBackground variant="cyan" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <PartyPopper size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 via-pink-400 to-gold bg-clip-text text-transparent">
            Tribe Night Status
          </h1>
          <p className="text-gray-400 mt-2">
            Check your registration status and QR code
          </p>
        </div>

        {!registration ? (
          <Card variant="neon" glowColor="gold" className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <Button
                variant="neon"
                size="lg"
                className="w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Checking...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <QrCode size={18} />
                    Check Status
                  </span>
                )}
              </Button>
            </form>
          </Card>
        ) : (
          <Card variant="neon" glowColor={registration.paymentStatus === "completed" ? "gold" : "navy"} className="p-8 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${statusInfo?.bgColor}`}>
              {statusInfo?.icon}
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {statusInfo?.title}
            </h2>

            <p className="text-gray-400 mb-4">
              {statusInfo?.description}
            </p>

            {/* User Info */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name</span>
                  <span className="text-white font-medium">{registration.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white font-medium">{registration.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone</span>
                  <span className="text-white font-medium">{registration.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount Paid</span>
                  <span className="text-gold font-medium">₹{registration.amount}</span>
                </div>
              </div>
            </div>

            {/* QR Code Display */}
            {statusInfo?.showQR && registration.qrCode && (
              <div className="mb-6">
                <div className="bg-white rounded-xl p-4 inline-block">
                  <img
                    src={registration.qrCode}
                    alt="Entry QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  Show this QR code at the venue entrance
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              {registration.paymentStatus === "failed" && (
                <Button variant="primary" onClick={() => navigate("/tribe-night")}>
                  Register Again
                </Button>
              )}
              <Button variant="outline" onClick={() => setRegistration(null)}>
                Check Another
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </Card>
        )}

        {/* Register link */}
        {!registration && (
          <p className="text-center text-gray-500 mt-4">
            Not registered yet?{" "}
            <button
              onClick={() => navigate("/tribe-night")}
              className="text-gold hover:underline font-medium"
            >
              Register now
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default TribeNightStatusPage;
