'use client';

import React from 'react';
import { DashboardLayoutLoadingProps } from '@/types/layout';

/**
 * COMPONENTE DE ESTADO DE CARGA PARA EL LAYOUT
 * 
 * Muestra un spinner y mensaje mientras se inicializa el sistema
 */
export default function DashboardLayoutLoading({ 
  className = '' 
}: DashboardLayoutLoadingProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-sm text-gray-600">Cargando sistema...</p>
        <p className="text-xs text-gray-400 mt-1">Inicializando permisos y configuración</p>
      </div>
    </div>
  );
}
