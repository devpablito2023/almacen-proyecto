'use client';

import React from 'react';
import { DashboardActivityProps } from '@/types/dashboard';

/**
 * PANEL DE ACTIVIDAD RECIENTE
 * 
 * Muestra las actividades más recientes del sistema
 */
export default function DashboardActivity({ activity, loading }: DashboardActivityProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Actividad Reciente
      </h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : !activity || activity.actividad?.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-gray-500 text-4xl mb-2 block">📝</span>
          <p className="text-gray-600">No hay actividad reciente</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {activity.actividad?.slice(0, 8).map((item, index) => (
            <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  {item.action || 'Acción realizada'}
                </p>
                <p className="text-xs text-gray-500">
                  {item.user_name || 'Usuario'} • {
                    item.timestamp 
                      ? new Date(item.timestamp).toLocaleString() 
                      : 'Hace un momento'
                  }
                </p>
                {item.details && (
                  <p className="text-xs text-gray-400 truncate mt-1">
                    {typeof item.details === 'object' 
                      ? `Producto: ${(item.details as any).codigo || (item.details as any).product_id || 'N/A'}`
                      : String(item.details)
                    }
                  </p>
                )}
              </div>
            </div>
          )) || []}
          {activity?.total && activity.total > 8 && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                +{activity.total - 8} actividades más
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
