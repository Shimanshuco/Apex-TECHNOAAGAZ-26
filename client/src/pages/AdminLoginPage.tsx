import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components";
import { Input } from "../components/Input";
import AnimatedBackground from "../components/AnimatedBackground";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!secretCode.trim()) {
      setError("Secret code is required");
      return;
    }

    setLoading(true);
    try {
      await adminLogin(email, password, secretCode);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials or not an admin/volunteer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <AnimatedBackground variant="cyan" />

      <div className="relative z-10 w-full max-w-md">
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
            Admin Portal
          </h1>
          <p className="text-gray-400 mt-2">
            Login for admins &amp; volunteers
          </p>
        </div>

        <Card variant="neon" glowColor="navy" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Secret Code"
              type="password"
              placeholder="Enter admin/volunteer secret code"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="admin@technoaagaz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Admin Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Need an account?{" "}
            <Link
              to="/admin/signup"
              className="text-gold hover:text-gold-light transition-colors"
            >
              Sign up here
            </Link>
          </div>

          <div className="mt-3 text-center text-sm text-gray-500">
            <Link
              to="/login"
              className="hover:text-gold transition-colors"
            >
              ← Back to participant login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;
