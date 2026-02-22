import React from 'react';

export interface AnimatedCarProps {
  className?: string;
}

const AnimatedCar: React.FC<AnimatedCarProps> = ({ className = '' }) => {
  return (
    <div className={`fixed bottom-2 left-0 z-20 animate-car-drive pointer-events-none ${className}`}>
      <div className="relative">
        {/* Headlight beam - projects forward */}
        <div
          className="absolute right-0 top-1/2 w-52 h-20 blur-lg opacity-50"
          style={{
            background: 'linear-gradient(to right, rgba(0,255,255,0.5), transparent)',
            transform: 'translateX(70%) translateY(-50%)',
          }}
        />
        {/* Neon underglow */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-cyan-400/50 blur-xl rounded-full" />
        {/* Car Image */}
        <img
          src="/car.png"
          alt="Car"
          className="w-64 md:w-80 lg:w-96 h-auto relative z-10 drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
        />
        {/* Light trail behind */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-40 h-0.5 bg-linear-to-l from-cyan-400/50 via-pink-500/20 to-transparent blur-sm" />
      </div>
    </div>
  );
};

export default AnimatedCar;
