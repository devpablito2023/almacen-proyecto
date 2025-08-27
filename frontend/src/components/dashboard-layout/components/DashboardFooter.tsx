'use client';

import React from 'react';
import { DashboardFooterProps } from '@/types/layout';

/**
 * FOOTER DEL LAYOUT DEL DASHBOARD
 * 
 * Muestra información del usuario, versión y estado del sistema
 */
export default function DashboardFooter({ 
  userName,
  version = '1.0.0',
  className = '' 
}: DashboardFooterProps) {
  return (
    <footer className={`bg-white border-t border-gray-200 px-4 py-3 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
        <div>
          Sistema Control de Almacén &copy; {new Date().getFullYear()}
        </div>
        <div className="flex items-center space-x-4">
          <span>Usuario: {userName}</span>
          <span>•</span>
          <span>Versión {version}</span>
          <span>•</span>
          <span className="flex items-center">
            <div className="h-2 w-2 bg-green-400 rounded-full mr-1"></div>
            Sistema Activo
          </span>
        </div>
      </div>
    </footer>
  );
}
