import React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = "",
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
    )}
    <select
      className={`
        w-full px-4 py-3 bg-gray-900/80 border border-white/10 rounded-lg
        text-white
        focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50
        transition-all duration-300
        ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : ""}
        ${className}
      `}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-gray-900">
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
  </div>
);
