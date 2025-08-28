import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, leftIcon, className = "", ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <div className="relative">
      {leftIcon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center">{leftIcon}</div>}
      <input
        {...props}
        className={`w-full ${leftIcon ? "pl-10" : "pl-3"} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
      />
    </div>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);