'use client';

import React from 'react';
import { DashboardMainContentProps } from '@/types/layout';

/**
 * ÁREA DE CONTENIDO PRINCIPAL DEL LAYOUT
 * 
 * Container principal para el contenido de las páginas
 */
export default function DashboardMainContent({ 
  children,
  isSidebarCollapsed,
  className = '' 
}: DashboardMainContentProps) {
  return (
    <main className={`flex-1 overflow-y-auto focus:outline-none ${className}`}>
      <div className="py-6">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isSidebarCollapsed ? 'lg:px-6' : 'lg:px-8'
        }`}>
          {children}
        </div>
      </div>
    </main>
  );
}
