// src/app/(dashboard)/dashboard/page.tsx
'use client';

import React from 'react';
import DashboardMain from '@/components/dashboard/DashboardMain';

/**
 * PÁGINA DEL DASHBOARD
 * 
 * Simple wrapper que usa el componente DashboardMain modularizado
 */
export default function DashboardPage() {
  return (
    <>
      {/* Metadata para SEO */}
      <head>
        <title>Dashboard - Sistema Control de Almacén</title>
        <meta name="description" content="Panel de control del sistema de almacén" />
      </head>

      {/* Componente principal modularizado */}
      <DashboardMain />
    </>
  );
}