import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AnimatedBackground from "./AnimatedBackground";
import {
  Home,
  CalendarDays,
  Music,
  Info,
  Mail,
  UserCircle,
  ShieldCheck,
  QrCode,
  LogOut,
  LogIn,
  UserPlus,
  Image,
} from "lucide-react";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  /* ── Build nav links dynamically ─────────────────── */
  const navLinks: { path: string; icon: React.FC<any>; label: string }[] = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/events", icon: CalendarDays, label: "Events" },
    { path: "/artists", icon: Music, label: "Artists" },
    { path: "/about", icon: Info, label: "About" },
    { path: "/contact", icon: Mail, label: "Contact" },
    { path: "/gallery", icon: Image, label: "Gallery" },
  ];

  if (user) {
    navLinks.push({ path: "/profile", icon: UserCircle, label: "Profile" });
    if (user.role === "admin") {
      navLinks.push({ path: "/admin/dashboard", icon: ShieldCheck, label: "Admin" });
    }
    if (user.role === "admin" || user.role === "volunteer") {
      navLinks.push({ path: "/qr/verify", icon: QrCode, label: "QR Scan" });
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-950 pb-20 md:pb-0">
      {/* ── Animated cyberpunk background ──────────── */}
      <AnimatedBackground variant="cyan" />

      {/* ── Top navbar ───────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: brand */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => navigate("/")}
          >
            <span className="text-lg font-bold bg-linear-to-r from-navy to-gold bg-clip-text text-transparent">
              TECHNOAAGAZ
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => {
              const Icon = l.icon;
              const active = pathname === l.path;
              return (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-gold/20 text-gold"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} />
                  {l.label}
                </button>
              );
            })}
          </div>

          {/* Right: Logos + Auth controls */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <span className="text-sm text-gold/80 hidden sm:block mr-1 truncate max-w-[120px]">
                  {user.name}
                </span>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LogIn size={16} />
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white border border-gold bg-gold/10 hover:bg-gold/25 transition-all"
                >
                  <UserPlus size={16} />
                  <span className="hidden sm:inline">Register</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Page content ─────────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* ── Mobile bottom tab bar ────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/5 md:hidden">
        <div className="flex justify-around py-2 overflow-x-auto scrollbar-hide">
          {navLinks.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.path;
            return (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                className={`flex flex-col items-center gap-0.5 px-1.5 py-1 text-[10px] min-w-[52px] shrink-0 transition-all ${
                  active ? "text-gold" : "text-gray-500"
                }`}
              >
                <Icon size={18} />
                {l.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default PageLayout;
