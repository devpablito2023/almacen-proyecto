'use client';

import React from 'react';
import { DashboardHeaderProps } from '@/types/dashboard';

/**
 * HEADER DEL DASHBOARD
 * 
 * Muestra:
 * - Saludo de bienvenida con nombre del usuario
 * - Rol del usuario
 * - Estado de conexión
 * - Botón de refresh
 * - Alertas críticas
 * - Errores de conexión
 */
export default function DashboardHeader({
  user,
  roleName,
  isDataLoaded,
  loading,
  hasAlerts,
  criticalAlerts,
  error,
  isRefreshing,
  onRefresh
}: DashboardHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.nombre_usuario}!
          </h1>
          <p className="text-gray-600">
            Sistema de Control de Almacén • Rol: <span className="font-semibold text-blue-600">{roleName}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Indicador de estado de datos */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isDataLoaded ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {loading ? 'Actualizando...' : isDataLoaded ? 'Datos en tiempo real' : 'Sin conexión'}
            </span>
          </div>

          {/* Botón de refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isRefreshing ? '🔄' : '↻'} Actualizar
          </button>
        </div>
      </div>

      {/* Alertas críticas */}
      {hasAlerts && criticalAlerts.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-800 font-medium">
              {criticalAlerts.length} alerta{criticalAlerts.length !== 1 ? 's' : ''} crítica{criticalAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Error de conexión */}
      {error && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-yellow-800">
              Error al cargar datos: {error}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
