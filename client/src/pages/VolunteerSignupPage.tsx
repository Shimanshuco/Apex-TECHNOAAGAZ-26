import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import AnimatedBackground from "../components/AnimatedBackground";
import AuthNavbar from "../components/AuthNavbar";

const GENDER_OPTIONS = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const BLOOD_GROUP_OPTIONS = [
  { value: "", label: "Select Blood Group" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

const VolunteerSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { volunteerSignup } = useAuth();

  const [form, setForm] = useState({
    secretCode: "",
    name: "",
    email: "",
    phone: "",
    gender: "",
    bloodGroup: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.secretCode.trim()) {
      setError("Volunteer secret code is required");
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
    if (!form.gender) {
      setError("Please select your gender");
      return;
    }
    if (!form.bloodGroup) {
      setError("Please select your blood group");
      return;
    }

    setLoading(true);
    try {
      await volunteerSignup({
        secretCode: form.secretCode,
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate("/qr/verify");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12 relative">
      <AuthNavbar />
      <AnimatedBackground variant="cyan" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-navy to-gold bg-clip-text text-transparent">
            Become a Volunteer
          </h1>
          <p className="text-gray-400 mt-2">
            Help us make TECHNOAAGAZ amazing
          </p>
          
        </div>

        <Card variant="neon" glowColor="gold" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Volunteer Secret Code"
              type="password"
              placeholder="Enter the volunteer secret code"
              value={form.secretCode}
              onChange={(e) => update("secretCode", e.target.value)}
              required
            />

            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />

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
                label="Phone"
                type="tel"
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Gender"
                options={GENDER_OPTIONS}
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                required
              />
              <Select
                label="Blood Group"
                options={BLOOD_GROUP_OPTIONS}
                value={form.bloodGroup}
                onChange={(e) => update("bloodGroup", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing Up…" : "Sign Up as Volunteer"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already a volunteer?{" "}
            <Link
              to="/admin/login"
              className="text-gold hover:text-gold-light transition-colors"
            >
              Login here
            </Link>
          </div>

          <div className="mt-3 text-center text-sm text-gray-500">
            <Link
              to="/register"
              className="hover:text-gold transition-colors"
            >
              ← Register as participant instead
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VolunteerSignupPage;
