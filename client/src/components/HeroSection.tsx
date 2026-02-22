import React from 'react';

export interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  return (
    <main className={`relative z-20 min-h-screen flex flex-col items-center justify-center px-6 pb-72 md:pb-48 md:pl-32 md:pr-20 ${className}`}>
      <div className="text-center max-w-4xl mx-auto -mt-8 md:-mt-14">
        {/* Tagline */}
        <p className="text-cyan-300 text-base md:text-lg lg:text-xl font-semibold tracking-[0.3em] uppercase mb-2 animate-fade-in-down drop-shadow-[0_0_12px_rgba(0,255,255,0.6)]">
          Apex University Presents
        </p>

        {/* Main Title */}
        <h1 className="relative mb-3">
          <span className="block text-5xl md:text-7xl lg:text-8xl font-black tracking-wider">
            <span className="bg-linear-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 35px rgba(0,255,255,0.7))' }}>
              TECHNO
            </span>
            <span className="bg-linear-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 35px rgba(255,0,128,0.7))' }}>
              AAGAZ
            </span>
          </span>
          <span className="block text-4xl md:text-6xl lg:text-7xl font-bold text-white mt-1" style={{ textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(0,255,255,0.3)' }}>
            2026
          </span>
        </h1>

        {/* Date & Subtitle */}
        <p className="text-gray-200 text-base md:text-lg tracking-wider mb-1 font-medium" style={{ textShadow: '0 0 10px rgba(255,255,255,0.4)' }}>
          10<sup>th</sup> - 13<sup>th</sup> March &nbsp;&nbsp; 2 0 2 6
        </p>

        
      </div>
    </main>
  );
};

export default HeroSection;
