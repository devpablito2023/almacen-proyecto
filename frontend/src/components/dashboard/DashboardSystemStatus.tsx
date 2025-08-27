'use client';

import React from 'react';
import { DashboardSystemStatusProps, SystemStatusProps } from '@/types/dashboard';

/**
 * ESTADO DEL SISTEMA
 * 
 * Muestra el estado de diferentes componentes del sistema
 */
export default function DashboardSystemStatus({
  isAuthenticated,
  isDataLoaded,
  stats
}: DashboardSystemStatusProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Estado del Sistema
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SystemStatus
          label="Autenticación"
          status={isAuthenticated ? 'Activo' : 'Inactivo'}
          isHealthy={isAuthenticated}
        />
        
        <SystemStatus
          label="Conexión API"
          status={isDataLoaded ? 'Conectado' : 'Desconectado'}
          isHealthy={isDataLoaded}
        />
        
        <SystemStatus
          label="Datos en Tiempo Real"
          status={stats ? 'Activo' : 'Inactivo'}
          isHealthy={!!stats}
        />
        
        <SystemStatus
          label="Última Actualización"
          status={stats?.ultima_actualizacion ? new Date(stats.ultima_actualizacion).toLocaleTimeString() : 'N/A'}
          isHealthy={!!stats}
        />
      </div>
      
      {/* Información adicional del dashboard */}
      {stats && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Productos por Categoría</h4>
              <div className="space-y-1">
                {Object.entries(stats.productos_por_categoria || {}).map(([categoria, cantidad]) => (
                  <div key={categoria} className="flex justify-between text-sm">
                    <span className="text-gray-600">{categoria || 'Sin categoría'}:</span>
                    <span className="font-medium">{cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Productos por Tipo</h4>
              <div className="space-y-1">
                {Object.entries(stats.productos_por_tipo || {}).map(([tipo, cantidad]) => (
                  <div key={tipo} className="flex justify-between text-sm">
                    <span className="text-gray-600">{tipo || 'Sin tipo'}:</span>
                    <span className="font-medium">{cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * COMPONENTE PARA ESTADO DEL SISTEMA
 */
const SystemStatus: React.FC<SystemStatusProps> = ({ label, status, isHealthy }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <span className={`text-sm font-medium ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
      {isHealthy ? '🟢' : '🔴'} {status}
    </span>
  </div>
);
