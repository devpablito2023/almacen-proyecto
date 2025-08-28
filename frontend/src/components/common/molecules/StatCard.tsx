import * as React from "react";
import { Card } from "../atoms/Card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: "blue" | "green" | "red" | "purple" | "yellow" | "gray";
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, accent = "blue" }) => {
  const map: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <Card className="p-6">
      <div className="flex items-center">
        {icon && <div className={`p-3 rounded-full ${map[accent]}`}>{icon}</div>}
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
};
