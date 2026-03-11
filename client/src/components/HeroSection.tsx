import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className={`relative z-20 min-h-screen flex flex-col items-center justify-center px-6 pb-72 md:pb-48 md:pl-32 md:pr-20 ${className}`}>
      <div className="text-center max-w-4xl mx-auto -mt-8 md:-mt-14 md:top-25">
        {/* Tagline */}
        <p className="text-cyan-300 text-base md:text-lg lg:text-xl font-semibold tracking-[0.3em] uppercase mb-2 animate-fade-in-down drop-shadow-[0_0_12px_rgba(0,255,255,0.6)]">
          Apex University Presents
        </p>

        {/* Main Title */}
        <h1 className="relative mb-3">
          <span className="block text-5xl md:text-7xl lg:text-8xl font-black tracking-wider italic">
            <span className="bg-linear-to-r from-amber-300 via-orange-400 to-purple-500 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 40px rgba(255,180,0,0.6))' }}>
              TECHNOAAGAZ
            </span>
          </span>
          <span className="block text-4xl md:text-6xl lg:text-7xl font-bold text-white mt-1" style={{ textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(0,255,255,0.3)' }}>
            2026
          </span>
        </h1>

        {/* Date & Subtitle */}
        <p className="text-gray-200 text-base md:text-lg tracking-wider mb-1 font-medium" style={{ textShadow: '0 0 10px rgba(255,255,255,0.4)' }}>
          10<sup>th</sup> - 12<sup>th</sup> March &nbsp;&nbsp; 2 0 2 6
        </p>

        {/* Mobile-only Register Now / My Profile button */}
        <div className="mt-5 md:hidden flex flex-col items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white text-base border-2 border-cyan-400 bg-cyan-500/15 backdrop-blur-sm shadow-[0_0_25px_rgba(0,255,255,0.3)] hover:bg-cyan-500/30 hover:shadow-[0_0_35px_rgba(0,255,255,0.5)] transition-all duration-300 animate-fade-in-up"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </button>
          ) : (
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white text-base border-2 border-pink-400 bg-pink-500/15 backdrop-blur-sm shadow-[0_0_25px_rgba(255,0,128,0.3)] hover:bg-pink-500/30 hover:shadow-[0_0_35px_rgba(255,0,128,0.5)] transition-all duration-300 animate-fade-in-up animate-pulse-slow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Register Now
            </button>
          )}
          {/* Tribe Night Registration Button */}
          <button
            onClick={() => navigate('/tribe-night')}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white text-base border-2 border-purple-400 bg-purple-500/15 backdrop-blur-sm shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:bg-purple-500/30 hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all duration-300 animate-fade-in-up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg>
            Tribe Night Registration
          </button>
        </div>
      </div>
    </main>
  );
};

export default HeroSection;
