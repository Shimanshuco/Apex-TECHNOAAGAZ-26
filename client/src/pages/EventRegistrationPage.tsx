import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components";
import AnimatedBackground from "../components/AnimatedBackground";

import {
  ArrowLeft,
  Users,
  CreditCard,
  CalendarDays,
  MapPin,
  CheckCircle,
  IndianRupee,
  QrCode,
  ShieldCheck,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";

/* ── Razorpay type declaration ── */
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  method?: { upi?: boolean; card?: boolean; netbanking?: boolean; wallet?: boolean };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

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

/* ── Load Razorpay script once ── */
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const EventRegistrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Payment flow state
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api<{ data: EventDetail }>(`/events/${id}`);
        setEvent(res.data);
        if (token) {
          try {
            const check = await api<{ registered: boolean }>(
              `/events/${id}/check-registration`,
              { token }
            );
            setAlreadyRegistered(check.registered);
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

  /* ── Free event: register directly ── */
  const handleFreeRegistration = useCallback(async () => {
    if (!event || !token) return;
    setPaymentLoading(true);
    setError("");
    try {
      await api(`/events/${id}/register`, { method: "POST", body: {}, token });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setPaymentLoading(false);
    }
  }, [event, id, token]);

  /* ── Paid event: Razorpay checkout (QR shows automatically) ── */
  const handlePaidRegistration = useCallback(async () => {
    if (!event || !token) return;
    setPaymentLoading(true);
    setError("");

    try {
      // 1) Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Failed to load payment gateway. Please check your internet connection.");
        setPaymentLoading(false);
        return;
      }

      // 2) Create order on backend
      const orderRes = await api<{
        data: {
          orderId: string;
          amount: number;
          amountInPaise: number;
          currency: string;
          keyId: string;
          eventTitle: string;
          userName: string;
          userEmail: string;
          userPhone: string;
        };
      }>("/payments/create-order", {
        method: "POST",
        body: { eventId: id },
        token,
      });

      const {
        orderId,
        amountInPaise,
        currency,
        keyId,
        eventTitle,
        userName,
        userEmail,
        userPhone,
      } = orderRes.data;

      setPaymentLoading(false);

      // 3) Open Razorpay checkout — QR is shown automatically for UPI
      const options: RazorpayOptions = {
        key: keyId,
        amount: amountInPaise,
        currency,
        name: "TECHNOAAGAZ 2026",
        description: `Registration: ${eventTitle}`,
        order_id: orderId,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: { color: "#D4A843" },
        handler: async (response: RazorpayResponse) => {
          // 4) Verify payment on backend
          setVerifying(true);
          try {
            await api("/payments/verify", {
              method: "POST",
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              token,
            });
            setSuccess(true);
          } catch (err: any) {
            setError(err.message || "Payment verification failed. Contact support if money was deducted.");
          } finally {
            setVerifying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled. You can try again.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment");
      setPaymentLoading(false);
    }
  }, [event, id, token]);

  /* ── Main action ── */
  const handleProceed = () => {
    if (!event) return;
    if (event.cost > 0) {
      handlePaidRegistration();
    } else {
      handleFreeRegistration();
    }
  };

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  /* ── Verifying payment screen ── */
  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <AnimatedBackground variant="cyan" />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card variant="neon" glowColor="gold" className="max-w-md w-full text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 size={40} className="text-gold animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
            <p className="text-gray-400">
              Please wait while we confirm your payment...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  /* ── Already registered screen ── */
  if (alreadyRegistered) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <AnimatedBackground variant="cyan" />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card variant="neon" glowColor="gold" className="max-w-md w-full text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} className="text-gold" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Already Registered!
            </h2>
            <p className="text-gray-400 mb-6">
              You are already registered for{" "}
              <span className="text-gold font-semibold">{event.title}</span>.
              {isTeamEvent && (
                <span className="block mt-2 text-sm">
                  Go to the event page to create or view your team.
                </span>
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
          <Card variant="neon" glowColor="gold" className="max-w-md w-full text-center p-8">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-400 mb-2">
              You have been registered for{" "}
              <span className="text-gold font-semibold">{event.title}</span>
            </p>
            {event.cost > 0 && (
              <p className="text-green-400 text-sm mb-4">
                Payment of ₹{event.cost} confirmed
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

            {/* Payment info card */}
            {event.cost > 0 && (
              <Card variant="neon" glowColor="gold">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                  <CreditCard size={18} className="text-gold" /> Payment Details
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
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold text-gold flex items-center gap-1">
                      <IndianRupee size={18} /> {event.cost}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-900/60 border border-white/5 mb-5">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <QrCode size={20} className="text-gold shrink-0" />
                    <div>
                      <p className="text-white font-medium mb-0.5">Scan &amp; Pay via UPI</p>
                      <p className="text-xs text-gray-500">
                        Clicking the button below will open a secure Razorpay payment window.
                        Scan the QR code with any UPI app (GPay, PhonePe, Paytm, etc.) to pay
                        exactly <span className="text-gold">₹{event.cost}</span>. Payment is
                        verified automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <ShieldCheck size={14} className="text-green-400/70" />
                  Payments are secured by Razorpay. We never store your card/UPI details.
                </div>
              </Card>
            )}

            {/* Action button */}
            <Button
              variant="neon"
              size="lg"
              className="w-full"
              onClick={handleProceed}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Preparing Payment…
                </span>
              ) : event.cost > 0 ? (
                <span className="flex items-center justify-center gap-2">
                  <QrCode size={18} /> Pay ₹{event.cost} — Scan QR
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Complete Registration (Free)
                </span>
              )}
            </Button>
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
                  {event.cost > 0 ? (
                    <span className="text-white">₹{event.cost}</span>
                  ) : (
                    <span className="text-green-400">Free</span>
                  )}
                </div>
              </div>

              {/* Trust badges */}
              {event.cost > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <ShieldCheck size={12} className="text-green-400/70" />
                    Secure Payment by Razorpay
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <QrCode size={12} className="text-gold/50" />
                    UPI QR • GPay • PhonePe • Paytm
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
