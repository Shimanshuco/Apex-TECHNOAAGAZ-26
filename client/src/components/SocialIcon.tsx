import React from 'react';
import type { IconProps } from '../icons';

export interface SocialIconProps {
  icon: React.FC<IconProps>;
  href: string;
  label: string;
  color?: 'cyan' | 'pink' | 'purple' | 'red' | 'blue';
  className?: string;
}

const colorStyles: Record<string, string> = {
  cyan: 'hover:text-cyan-400 hover:shadow-cyan-400/50 hover:border-cyan-400',
  pink: 'hover:text-pink-400 hover:shadow-pink-400/50 hover:border-pink-400',
  purple: 'hover:text-purple-400 hover:shadow-purple-400/50 hover:border-purple-400',
  red: 'hover:text-red-500 hover:shadow-red-500/50 hover:border-red-500',
  blue: 'hover:text-blue-500 hover:shadow-blue-500/50 hover:border-blue-500',
};

export const SocialIcon: React.FC<SocialIconProps> = ({
  icon: Icon,
  href,
  label,
  color = 'cyan',
  className = '',
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`
        flex items-center justify-center w-12 h-12 rounded-full
        border-2 border-white/20 bg-black/30 backdrop-blur-sm
        text-gray-400 transition-all duration-300
        hover:scale-110 hover:bg-black/50 hover:shadow-lg
        ${colorStyles[color]}
        ${className}
      `}
    >
      <Icon size={20} />
    </a>
  );
};
