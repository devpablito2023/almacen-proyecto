interface BadgeProps {
  text: string;
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({ text, color = "bg-gray-200 text-gray-800" }) => (
  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
    {text}
  </span>
);
