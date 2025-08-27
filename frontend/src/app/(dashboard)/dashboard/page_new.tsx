// src/app/(dashboard)/dashboard/page.tsx
'use client';

import React from 'react';
import DashboardMain from '@/components/dashboard/DashboardMain';

/**
 * PÁGINA PRINCIPAL DEL DASHBOARD
 * 
 * Simple wrapper que usa el componente DashboardMain modularizado
 */
export default function DashboardPage() {
  return (
    <>
      {/* Metadata para SEO */}
      <head>
        <title>Dashboard - Sistema Control de Almacén</title>
        <meta name="description" content="Panel principal del sistema de control de almacén" />
      </head>

      {/* Componente principal modularizado */}
      <DashboardMain className="animate-fade-in" />
    </>
  );
}
