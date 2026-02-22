import React from 'react';
import type { IconProps } from '../icons';

export interface NavItemProps {
  icon: React.FC<IconProps>;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  href = '#',
  isActive = false,
  onClick,
  className = '',
}) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300
        group cursor-pointer
        ${isActive 
          ? 'bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20' 
          : 'text-gray-400 hover:text-cyan-400 hover:bg-white/5'
        }
        ${className}
      `}
    >
      <div className={`
        p-3 rounded-lg transition-all duration-300
        ${isActive 
          ? 'bg-cyan-500/30 shadow-lg shadow-cyan-400/30' 
          : 'bg-white/5 group-hover:bg-cyan-500/20 group-hover:shadow-lg group-hover:shadow-cyan-400/20'
        }
      `}>
        <Icon size={24} className="transition-all duration-300" />
      </div>
      <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
    </a>
  );
};
