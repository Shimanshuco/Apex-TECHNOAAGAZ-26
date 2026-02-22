import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'neon' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<string, string> = {
  primary: 'bg-gold hover:bg-gold-dark text-white shadow-lg shadow-gold/30',
  secondary: 'bg-navy hover:bg-navy-dark text-white shadow-lg shadow-navy/30',
  outline: 'border-2 border-gold text-gold hover:bg-gold/10',
  neon: 'bg-transparent border-2 border-gold text-gold hover:bg-gold/20 shadow-lg shadow-gold/30 hover:shadow-gold/50',
  ghost: 'bg-transparent text-white hover:bg-white/10',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-semibold rounded-lg transition-all duration-300 transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};
