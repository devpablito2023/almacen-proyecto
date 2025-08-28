import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) => {
  const base = "px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent",
    ghost: "text-gray-700 hover:bg-gray-50",
  } as const;

  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      disabled={loading || props.disabled}
    >
      {loading && <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />}
      {children}
    </button>
  );
};
