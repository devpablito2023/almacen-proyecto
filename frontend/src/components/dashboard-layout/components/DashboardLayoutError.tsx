'use client';

import React from 'react';
import { DashboardLayoutErrorProps } from '@/types/layout';
import { Button } from '../../commons';

/**
 * COMPONENTE DE ERROR PARA EL LAYOUT
 * 
 * Se muestra cuando el usuario no está autenticado o no tiene permisos
 */
export default function DashboardLayoutError({ 
  onReturnLogin,
  className = '' 
}: DashboardLayoutErrorProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-red-50 ${className}`}>
      <div className="text-center max-w-md">
        <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.863-.833-2.634 0L4.168 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Acceso No Autorizado
        </h2>
        <p className="text-gray-600 mb-4">
          Tu sesión ha expirado o no tienes permisos para acceder a esta área.
        </p>
        <Button
          onClick={onReturnLogin}
          variant="primary"
        >
          Volver al Login
        </Button>
      </div>
    </div>
  );
}
