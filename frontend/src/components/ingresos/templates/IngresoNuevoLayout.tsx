"use client";

import { Card } from "@/components/common/atoms/Card";

export const IngresoNuevoLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-6 space-y-6">
    <h1 className="text-2xl font-bold">{title}</h1>
    <Card className="p-6">{children}</Card>
  </div>
);
