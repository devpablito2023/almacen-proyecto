'use client';

import React from 'react';
import { DashboardMobileMenuButtonProps } from '@/types/layout';

/**
 * BOTÓN DE MENÚ MÓVIL PARA EL LAYOUT
 * 
 * Botón para abrir el sidebar en dispositivos móviles
 */
export default function DashboardMobileMenuButton({ 
  onOpen,
  className = '' 
}: DashboardMobileMenuButtonProps) {
  return (
    <div className={`lg:hidden sticky top-16 z-30 bg-white border-b border-gray-200 px-4 py-2 ${className}`}>
      <button
        onClick={onOpen}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Abrir menú de navegación"
      >
        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Menú
      </button>
    </div>
  );
}
