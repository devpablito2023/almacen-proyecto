'use client';

import React from 'react';
import { DashboardMobileMenuButtonProps } from '@/types/layout';
import { Button } from '../../commons';

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
      <Button
        onClick={onOpen}
        variant="secondary"
        size="sm"
        leftIcon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        }
        title="Abrir menú de navegación"
      >
        Menú
      </Button>
    </div>
  );
}
