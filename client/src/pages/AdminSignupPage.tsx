import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components";
import { Input } from "../components/Input";
import AnimatedBackground from "../components/AnimatedBackground";

const AdminSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminSignup } = useAuth();

  const [form, setForm] = useState({
    secretCode: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.secretCode.trim()) {
      setError("Admin secret code is required");
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

    setLoading(true);
    try {
      await adminSignup({
        secretCode: form.secretCode,
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccess("Admin account created successfully!");
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <AnimatedBackground variant="cyan" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-navy/30 border border-navy-light/30 flex items-center justify-center">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-navy to-gold bg-clip-text text-transparent">
            Admin Signup
          </h1>
          <p className="text-gray-400 mt-2">
            Create an admin account for TECHNOAAGAZ
          </p>
        </div>

        <Card variant="neon" glowColor="navy" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                {success}
              </div>
            )}

            <Input
              label="Admin Secret Code"
              type="password"
              placeholder="Enter the admin secret code"
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

            <Input
              label="Email"
              type="email"
              placeholder="admin@technoaagaz.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
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
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating Account…" : "Create Admin Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/admin/login"
              className="text-gold hover:text-gold-light transition-colors"
            >
              Sign in here
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

export default AdminSignupPage;
