"use client";

interface LoadingSpinnerProps {
  size?: number; // px
  color?: string; // tailwind color classes
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 16, color = "border-blue-500" }) => {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-t-transparent ${color}`}
      style={{ width: size, height: size }}
    />
  );
};
