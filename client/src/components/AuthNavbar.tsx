import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, CalendarDays } from "lucide-react";

const AuthNavbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Brand */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <span className="text-lg font-bold bg-linear-to-r from-navy to-gold bg-clip-text text-transparent">
            TECHNOAAGAZ
          </span>
        </button>

        {/* Right: quick links */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Home size={16} />
            <span className="hidden sm:inline">Home</span>
          </button>
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <CalendarDays size={16} />
            <span className="hidden sm:inline">Events</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;
