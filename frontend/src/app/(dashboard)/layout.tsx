// src/app/(dashboard)/layout.tsx
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * LAYOUT PRINCIPAL PARA DASHBOARD
 * 
 * Layout básico para testing del sistema de auth.
 * Incluye sidebar simple y header con info del usuario.
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, isLoading, logout, roleName } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">❌</div>
          <p className="text-red-700">Usuario no autenticado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  Control de Almacén
                </h1>
                <p className="text-sm text-gray-500">
                  Sistema de Gestión de Inventario
                </p>
              </div>
            </div>

            {/* Info del usuario y logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.nombre_usuario}
                </p>
                <p className="text-xs text-gray-500">
                  {roleName} • {user.email_usuario}
                </p>
              </div>
              
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <nav className="bg-white w-64 min-h-screen shadow-sm border-r border-gray-200">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Módulos
            </h2>
            <div className="space-y-1">
              <a
                href="/dashboard"
                className="bg-blue-50 text-blue-700 border-blue-200 group flex items-center px-3 py-2 text-sm font-medium rounded-md border"
              >
                <svg className="text-blue-500 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v12H8V5z" />
                </svg>
                Dashboard
              </a>

              <a
                href="/dashboard/productos"
                className="text-gray-600 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                <svg className="text-gray-400 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Productos
              </a>

              <a
                href="/dashboard/stock"
                className="text-gray-600 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              >
                <svg className="text-gray-400 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Stock
              </a>
            </div>
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Debug panel para desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4">
          <details className="bg-white rounded-lg shadow-lg border border-gray-200">
            <summary className="p-3 cursor-pointer text-xs font-medium text-gray-700">
              🔧 Auth Debug
            </summary>
            <div className="p-3 border-t border-gray-200 text-xs font-mono">
              <div><strong>User:</strong> {user.nombre_usuario}</div>
              <div><strong>Role:</strong> {user.tipo_usuario} ({roleName})</div>
              <div><strong>Email:</strong> {user.email_usuario}</div>
              <div><strong>Area:</strong> {user.area_usuario || 'N/A'}</div>
              <div><strong>Status:</strong> {user.estado_usuario === 1 ? 'Activo' : 'Inactivo'}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;