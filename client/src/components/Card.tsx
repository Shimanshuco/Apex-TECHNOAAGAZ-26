import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'neon';
  className?: string;
  glowColor?: 'cyan' | 'pink' | 'purple' | 'gold' | 'navy';
}

const variantStyles: Record<string, string> = {
  glass: 'bg-white/5 backdrop-blur-md border border-white/10',
  solid: 'bg-gray-900/90 border border-gray-800',
  neon: 'bg-black/40 backdrop-blur-md border-2',
};

const glowStyles: Record<string, string> = {
  cyan: 'border-gold/50 shadow-lg shadow-gold/20',
  pink: 'border-gold/50 shadow-lg shadow-gold/20',
  purple: 'border-navy/50 shadow-lg shadow-navy/20',
  gold: 'border-gold/50 shadow-lg shadow-gold/20',
  navy: 'border-navy/50 shadow-lg shadow-navy/20',
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  className = '',
  glowColor = 'cyan',
}) => {
  return (
    <div
      className={`
        rounded-2xl p-6 transition-all duration-300
        ${variantStyles[variant]}
        ${variant === 'neon' ? glowStyles[glowColor] : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
