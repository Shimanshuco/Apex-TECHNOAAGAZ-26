import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
    )}
    <input
      className={`
        w-full px-4 py-3 bg-gray-900/80 border border-white/10 rounded-lg
        text-white placeholder-gray-500
        focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50
        transition-all duration-300
        ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : ""}
        ${className}
      `}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
  </div>
);
