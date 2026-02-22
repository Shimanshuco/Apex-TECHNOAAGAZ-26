import React from 'react';

export interface DroneProps {
  className?: string;
}

const Drone: React.FC<DroneProps> = ({ className = '' }) => {
  return (
    <div className={`fixed z-30 left-0 animate-drone pointer-events-none ${className}`}>
      <div className="relative">
        {/* Drone Body */}
        <div className="w-16 h-6 bg-linear-to-r from-gray-700 to-gray-600 rounded-full shadow-lg relative">
          {/* Propellers */}
          <div className="absolute -top-2 -left-4 w-8 h-1 bg-gray-500 rounded-full animate-spin-fast origin-right" />
          <div className="absolute -top-2 -right-4 w-8 h-1 bg-gray-500 rounded-full animate-spin-fast origin-left" />
          {/* Lights */}
          <div className="absolute top-1/2 left-1 w-2 h-2 bg-red-500 rounded-full animate-blink -translate-y-1/2" />
          <div className="absolute top-1/2 right-1 w-2 h-2 bg-green-500 rounded-full animate-blink -translate-y-1/2" />
          {/* Camera */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rounded-full border border-cyan-400">
            <div className="absolute inset-1 bg-cyan-400 rounded-full animate-pulse" />
          </div>
        </div>
        {/* Light beam below drone */}
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-40 bg-linear-to-b from-cyan-400/20 to-transparent blur-sm"
          style={{ clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)' }}
        />
      </div>
    </div>
  );
};

export default Drone;
