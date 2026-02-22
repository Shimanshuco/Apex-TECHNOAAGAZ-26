import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Button } from "../components";
import { Input } from "../components/Input";
import AnimatedBackground from "../components/AnimatedBackground";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/events");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Animated BG */}
      <AnimatedBackground variant="cyan" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="TECHNOAAGAZ"
            className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(212,168,67,0.6)]"
          />
          <h1 className="text-3xl font-bold bg-linear-to-r from-navy to-gold bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-400 mt-2">
            Sign in to your TECHNOAAGAZ account
          </p>
        </div>

        <Card variant="glass" className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
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
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don&#39;t have an account?{" "}
            <Link
              to="/register"
              className="text-gold hover:text-gold-light transition-colors"
            >
              Register here
            </Link>
          </div>

          <div className="mt-3 text-center text-sm text-gray-500">
            <Link
              to="/admin/login"
              className="hover:text-gold transition-colors"
            >
              Admin / Volunteer Login →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
