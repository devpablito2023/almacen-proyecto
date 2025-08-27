// src/app/(dashboard)/layout.tsx
'use client';

import React from 'react';
import DashboardLayoutMain from '@/components/dashboard-layout/DashboardLayoutMain';

/**
 * LAYOUT DEL DASHBOARD
 * 
 * Simple wrapper que usa el componente DashboardLayoutMain modularizado
 */
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardLayoutMain>{children}</DashboardLayoutMain>;
}