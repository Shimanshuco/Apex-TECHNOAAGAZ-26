import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import AnimatedBackground from "../components/AnimatedBackground";

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

const UNIVERSITY_OPTIONS = [
  { value: "", label: "Select University" },
  { value: "apex_university", label: "Apex University" },
  { value: "other", label: "Other" },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    university: "" as "" | "apex_university" | "other",
    collegeName: "",
    gender: "",
    bloodGroup: "",
    address: "",
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

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!form.university) {
      setError("Please select a university");
      return;
    }
    if (form.university === "other" && !form.collegeName.trim()) {
      setError("Please enter your college name");
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
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        university: form.university as "apex_university" | "other",
        collegeName: form.university === "other" ? form.collegeName : undefined,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        address: form.address,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate("/profile");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <AnimatedBackground variant="cyan" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="TECHNOAAGAZ"
            className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,168,67,0.6)]"
          />
          <h1 className="text-3xl font-bold bg-linear-to-r from-navy to-gold bg-clip-text text-transparent">
            Join TECHNOAAGAZ
          </h1>
          <p className="text-gray-400 mt-2">
            Create your participant account
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

            <Select
              label="University"
              options={UNIVERSITY_OPTIONS}
              value={form.university}
              onChange={(e) => update("university", e.target.value)}
              required
            />

            {form.university === "other" && (
              <Input
                label="College Name"
                placeholder="Enter your college name"
                value={form.collegeName}
                onChange={(e) => update("collegeName", e.target.value)}
                required
              />
            )}

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

            <Input
              label="Address"
              placeholder="Your address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              required
            />

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
              {loading ? "Creating Account…" : "Register Now"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-gold hover:text-gold-light transition-colors"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-3 text-center text-xs text-gray-500">
            <Link to="/volunteer/signup" className="text-gold/70 hover:text-gold transition-colors">
              Volunteer Signup
            </Link>
            {" · "}
            <Link to="/admin/signup" className="text-gold/70 hover:text-gold transition-colors">
              Admin Signup
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
