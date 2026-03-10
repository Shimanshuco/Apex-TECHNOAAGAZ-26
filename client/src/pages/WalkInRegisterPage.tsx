import React, { useState } from "react";
import { api } from "../lib/api";
import { Card, Button } from "../components";
import {
  User,
  Phone,
  GraduationCap,
  Building2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  PartyPopper,
  ArrowRight,
} from "lucide-react";

/* ─── Component ─────────────────────────────────────── */
const WalkInRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    course: "",
    college: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.course.trim() || !formData.college.trim()) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    // Phone validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      setError("Please enter a valid 10-digit Indian phone number");
      setLoading(false);
      return;
    }

    try {
      await api("/walkin/register", {
        method: "POST",
        body: formData,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: "", phone: "", course: "", college: "" });
    setSuccess(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center shadow-lg shadow-gold/20">
            <PartyPopper size={40} className="text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Technoaagaz 2026</h1>
          <p className="text-gold text-sm font-medium">Walk-In Registration</p>
        </div>

        {!success ? (
          <Card variant="glass" className="p-6 border border-gold/20">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User size={14} className="inline mr-2 text-gold" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                  autoComplete="name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone size={14} className="inline mr-2 text-gold" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                  autoComplete="tel"
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <GraduationCap size={14} className="inline mr-2 text-gold" />
                  Course / Program
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="e.g., B.Tech CSE, MBA, BBA"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                />
              </div>

              {/* College */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Building2 size={14} className="inline mr-2 text-gold" />
                  College / University
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Enter your college name"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-400 shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" /> Registering...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Register <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-gray-500 text-xs mt-4">
              By registering, you agree to receive event updates
            </p>
          </Card>
        ) : (
          <Card variant="glass" className="p-8 text-center border border-emerald-500/30">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle size={48} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
            <p className="text-emerald-400 font-medium mb-4">Registration Successful</p>
            <p className="text-gray-400 text-sm mb-6">
              You're all set! Enjoy Technoaagaz 2026!
            </p>

            <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10 mb-6">
              <h4 className="text-sm font-semibold text-gold mb-3">Your Details</h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-300">
                  <User size={14} className="text-gold/70" />
                  <span className="font-medium">{formData.name}</span>
                </p>
                <p className="flex items-center gap-2 text-gray-300">
                  <Phone size={14} className="text-gold/70" />
                  {formData.phone}
                </p>
                <p className="flex items-center gap-2 text-gray-300">
                  <GraduationCap size={14} className="text-gold/70" />
                  {formData.course}
                </p>
                <p className="flex items-center gap-2 text-gray-300">
                  <Building2 size={14} className="text-gold/70" />
                  {formData.college}
                </p>
              </div>
            </div>
          </Card>
        )}

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2026 Apex University • Technoaagaz
        </p>
      </div>
    </div>
  );
};

export default WalkInRegisterPage;
