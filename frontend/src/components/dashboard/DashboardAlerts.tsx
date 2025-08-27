'use client';

import React from 'react';
import { DashboardAlertsProps } from '@/types/dashboard';

/**
 * PANEL DE ALERTAS DEL DASHBOARD
 * 
 * Muestra las alertas del sistema clasificadas por prioridad
 */
export default function DashboardAlerts({ alerts, loading }: DashboardAlertsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        🚨 Alertas del Sistema
      </h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-gray-500 text-4xl mb-2 block">✅</span>
          <p className="text-gray-600">No hay alertas activas</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {alerts.slice(0, 5).map((alert, index) => (
            <div
              key={alert.id || index}
              className={`p-3 rounded-md border-l-4 ${
                alert.prioridad === 'alta' 
                  ? 'bg-red-50 border-red-400' 
                  : alert.prioridad === 'media'
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.titulo || alert.mensaje}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Ahora'}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  alert.prioridad === 'alta' 
                    ? 'bg-red-100 text-red-800' 
                    : alert.prioridad === 'media'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {alert.prioridad}
                </span>
              </div>
            </div>
          ))}
          {alerts.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                +{alerts.length - 5} alertas más
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
