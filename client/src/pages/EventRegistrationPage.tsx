import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components";
import AnimatedBackground from "../components/AnimatedBackground";

import {
  ArrowLeft,
  Users,
  CalendarDays,
  MapPin,
  CheckCircle,
  IndianRupee,
  QrCode,
  ShieldCheck,
  User,
  Loader2,
  AlertCircle,
  Upload,
  X,
  Clock,
} from "lucide-react";

interface EventDetail {
  _id: string;
  title: string;
  category: string;
  cost: number;
  venue: string;
  participationType: "solo" | "team";
  minTeamSize: number;
  maxTeamSize: number;
  date: string;
  image?: string;
}

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

const EventRegistrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registrationPaymentStatus, setRegistrationPaymentStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Screenshot state
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState("");

  // Pricing from API
  const [pricing, setPricing] = useState<{
    apex: number;
    otherEarly: number;
    otherRegular: number;
    earlyBirdDeadline: string;
    isEarlyBird: boolean;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventRes, pricingRes] = await Promise.all([
          api<{ data: EventDetail }>(`/events/${id}`),
          api<{ data: { apex: number; otherEarly: number; otherRegular: number; earlyBirdDeadline: string; isEarlyBird: boolean } }>("/events/pricing"),
        ]);
        setEvent(eventRes.data);
        setPricing(pricingRes.data);
        if (token) {
          try {
            const check = await api<{ registered: boolean; registration?: { paymentStatus: string } }>(
              `/events/${id}/check-registration`,
              { token }
            );
            // Don't block re-registration if payment was rejected
            const isRejected = check.registration?.paymentStatus === "failed";
            setAlreadyRegistered(check.registered && !isRejected);
            if (check.registration?.paymentStatus) {
              setRegistrationPaymentStatus(check.registration.paymentStatus);
            }
          } catch {
            /* ignore */
          }
        }
      } catch {
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, token]);

  const isTeamEvent = event?.participationType === "team";
  const isPaidEvent = event ? event.cost > 0 : false;

  // Dynamic pricing from API
  const dynamicPrice = (() => {
    if (!pricing) return 0;
    if (user?.university === "apex_university") return pricing.apex;
    return pricing.isEarlyBird ? pricing.otherEarly : pricing.otherRegular;
  })();
  const displayPrice = isPaidEvent ? dynamicPrice : 0;

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

  /* ── Register (free or paid with screenshot) ── */
  const handleProceed = useCallback(async () => {
    if (!event || !token) return;
    if (isPaidEvent && !screenshot) {
      setError("Please upload a screenshot of your payment before proceeding.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api(`/events/${id}/register`, {
        method: "POST",
        body: isPaidEvent ? { paymentScreenshot: screenshot } : {},
        token,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }, [event, id, token, isPaidEvent, screenshot]);

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  /* ── Already registered screen ── */
  if (alreadyRegistered) {
    const isPending = registrationPaymentStatus === "pending";
    const isRejected = registrationPaymentStatus === "failed";

    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <AnimatedBackground variant="cyan" />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card variant="neon" glowColor={isPending ? "navy" : isRejected ? "navy" : "gold"} className="max-w-md w-full text-center p-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isPending ? "bg-amber-500/20" : isRejected ? "bg-red-500/20" : "bg-gold/20"
            }`}>
              {isPending ? (
                <Clock size={40} className="text-amber-400" />
              ) : isRejected ? (
                <AlertCircle size={40} className="text-red-400" />
              ) : (
                <ShieldCheck size={40} className="text-gold" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isPending
                ? "Payment Under Verification"
                : isRejected
                ? "Payment Rejected"
                : "Already Registered!"}
            </h2>
            <p className="text-gray-400 mb-6">
              {isPending ? (
                <>
                  Your payment screenshot for{" "}
                  <span className="text-gold font-semibold">{event.title}</span>{" "}
                  is being reviewed by the organizers. You will be confirmed once approved.
                </>
              ) : isRejected ? (
                <>
                  Your payment for{" "}
                  <span className="text-gold font-semibold">{event.title}</span>{" "}
                  was not verified. Please contact the organizers or re-register with a valid screenshot.
                </>
              ) : (
                <>
                  You are already registered for{" "}
                  <span className="text-gold font-semibold">{event.title}</span>.
                  {isTeamEvent && (
                    <span className="block mt-2 text-sm">
                      Go to the event page to create or view your team.
                    </span>
                  )}
                </>
              )}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={() => navigate(`/events/${id}`)}>
                Event Details
              </Button>
              <Button variant="outline" onClick={() => navigate("/profile")}>
                View Profile
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <AnimatedBackground variant="cyan" />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card variant="neon" glowColor={isPaidEvent ? "navy" : "gold"} className="max-w-md w-full text-center p-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isPaidEvent ? "bg-amber-500/20" : "bg-green-500/20"
            }`}>
              {isPaidEvent ? (
                <Clock size={40} className="text-amber-400" />
              ) : (
                <CheckCircle size={40} className="text-green-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isPaidEvent ? "Payment Under Verification" : "Registration Successful!"}
            </h2>
            <p className="text-gray-400 mb-2">
              {isPaidEvent ? (
                <>
                  Your screenshot for{" "}
                  <span className="text-gold font-semibold">{event.title}</span>{" "}
                  has been submitted. The organizers will verify your payment.
                </>
              ) : (
                <>
                  You have been registered for{" "}
                  <span className="text-gold font-semibold">{event.title}</span>
                </>
              )}
            </p>
            {displayPrice > 0 && (
              <p className="text-amber-400 text-sm mb-4">
                ₹{displayPrice} — Payment screenshot submitted for verification
              </p>
            )}
            {isTeamEvent && (
              <div className="mt-4 p-4 rounded-xl bg-gold/5 border border-gold/20 text-left">
                <p className="text-sm text-gold font-semibold mb-1 flex items-center gap-2">
                  <Users size={16} /> Team Event — Next Step
                </p>
                <p className="text-gray-400 text-sm">
                  Now go to the event page to <strong className="text-white">create your team</strong> and
                  add members. Each member must also register &amp; pay individually first.
                </p>
              </div>
            )}
            <div className="flex gap-3 mt-6 justify-center">
              {isTeamEvent ? (
                <Button variant="primary" onClick={() => navigate(`/events/${id}`)}>
                  Create Team →
                </Button>
              ) : (
                <Button variant="primary" onClick={() => navigate("/profile")}>
                  View Profile
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate("/events")}>
                Browse Events
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* ── Main registration page ── */
  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <AnimatedBackground variant="cyan" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(`/events/${id}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft size={18} /> Back to Event
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-linear-to-r from-navy to-gold bg-clip-text text-transparent">
                Register for Event
              </span>
            </h1>
            <p className="text-gray-400 mb-6">{event.title}</p>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Your Details */}
            <Card variant="glass">
              <h3 className="text-lg font-semibold text-white mb-4">
                Your Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-white font-medium">{user?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-white font-medium">{user?.phone || "—"}</p>
                </div>
                {user?.university && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">University</p>
                    <p className="text-white font-medium capitalize">
                      {user.university === "apex_university"
                        ? "Apex University"
                        : user.collegeName || "Other"}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Team event info banner */}
            {isTeamEvent && (
              <Card variant="glass" className="border-gold/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Users size={20} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">
                      This is a Team Event
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Team size:{" "}
                      <span className="text-gold font-medium">
                        {event.minTeamSize || 2}–{event.maxTeamSize || 5} members
                      </span>
                    </p>
                    <div className="mt-3 p-3 rounded-lg bg-white/3 border border-white/5">
                      <p className="text-xs text-gray-400 leading-relaxed">
                        <strong className="text-gray-300">How it works:</strong>
                      </p>
                      <ol className="mt-1.5 text-xs text-gray-400 space-y-1 list-decimal list-inside">
                        <li>Register &amp; pay individually (this step)</li>
                        <li>After payment, go to the event page</li>
                        <li>Create a team and add members by email</li>
                        <li>Each member must also have registered &amp; paid</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Payment info card — QR + Screenshot Upload */}
            {isPaidEvent && (
              <Card variant="neon" glowColor="gold">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                  <QrCode size={18} className="text-gold" /> Payment Details
                </h3>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Event</span>
                    <span className="text-white font-medium">{event.title}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Participant</span>
                    <span className="text-white font-medium">{user?.name}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>University</span>
                    <span className="text-white font-medium">
                      {user?.university === "apex_university" ? "Apex University" : user?.collegeName || "Other"}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold text-gold flex items-center gap-1">
                      <IndianRupee size={18} /> {displayPrice}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {user?.university === "apex_university"
                      ? `Apex University students: ₹${pricing?.apex ?? 149}`
                      : pricing?.isEarlyBird
                      ? `Early Bird (before ${pricing?.earlyBirdDeadline ?? "28 Feb"}): ₹${pricing?.otherEarly ?? 300}`
                      : `Registration fee for external participants: ₹${pricing?.otherRegular ?? 350}`}
                  </p>
                </div>

                {/* QR Code Image */}
                <div className="flex flex-col items-center mb-5">
                  <p className="text-sm text-gray-300 mb-3 text-center">
                    Scan the QR code below with any UPI app (GPay, PhonePe, Paytm, etc.) and pay{" "}
                    <span className="text-gold font-semibold">₹{displayPrice}</span>
                  </p>
                  <div className="bg-white rounded-xl p-3">
                    <img
                      src="/qr.jpeg"
                      alt="Payment QR Code"
                      className="w-52 h-52 object-contain"
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
                        className="w-full max-h-64 object-contain bg-black/40"
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

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                  <ShieldCheck size={14} className="text-green-400/70" />
                  Your payment screenshot will be verified by the organizers.
                </div>
              </Card>
            )}

            {/* Action button */}
            <Button
              variant="neon"
              size="lg"
              className="w-full"
              onClick={handleProceed}
              disabled={submitting || (isPaidEvent && !screenshot)}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Registering…
                </span>
              ) : isPaidEvent ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Complete Registration — ₹{displayPrice} Paid
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Complete Registration (Free)
                </span>
              )}
            </Button>

            {isPaidEvent && !screenshot && (
              <p className="text-xs text-center text-gray-500 mt-2">
                Upload your payment screenshot above to enable registration
              </p>
            )}
          </div>

          {/* Sidebar — Event summary */}
          <div>
            <Card variant="glass" className="sticky top-8">
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-lg font-bold text-white mb-3">{event.title}</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-gold/70" />
                  {new Date(event.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gold/70" />
                  {event.venue}
                </div>
                <div className="flex items-center gap-2">
                  {event.participationType === "team" ? (
                    <Users size={14} className="text-gold/70" />
                  ) : (
                    <User size={14} className="text-gold/70" />
                  )}
                  <span className="capitalize">
                    {event.participationType}
                    {isTeamEvent && ` (${event.minTeamSize || 2}–${event.maxTeamSize || 5})`}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <IndianRupee size={14} className="text-gold/70" />
                  {isPaidEvent ? (
                    <span className="text-white">₹{displayPrice}</span>
                  ) : (
                    <span className="text-green-400">Free</span>
                  )}
                </div>
              </div>

              {/* Trust badges */}
              {isPaidEvent && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <ShieldCheck size={12} className="text-green-400/70" />
                    Payment verified by organizers
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <QrCode size={12} className="text-gold/50" />
                    Scan QR &amp; Upload Screenshot
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationPage;
