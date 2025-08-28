// src/app/(dashboard)/dashboard/page.tsx
import React from 'react';
import DashboardMain from '@/components/dashboard/DashboardMain';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Sistema Control de Almacén',
  description: 'Panel de control del sistema de almacén',
};

/**
 * PÁGINA DEL DASHBOARD
 * 
 * Simple wrapper que usa el componente DashboardMain modularizado
 */
export default function DashboardPage() {
  return <DashboardMain />;
}