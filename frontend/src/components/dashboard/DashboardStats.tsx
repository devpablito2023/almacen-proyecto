'use client';

import React from 'react';
import { DashboardStatsProps, StatCardProps } from '@/types/dashboard';

/**
 * ESTADÍSTICAS DEL DASHBOARD
 * 
 * Muestra las tarjetas con estadísticas principales del sistema
 */
export default function DashboardStats({ stats, loading }: DashboardStatsProps) {
  return (
    <>
      {/* Primera fila de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Productos"
          value={stats.productos.toLocaleString()}
          icon="📦"
          color="blue"
          description="Total en sistema"
          loading={loading}
        />
        
        <StatCard
          title="Stock Bajo"
          value={stats.stockBajo}
          icon="⚠️"
          color="orange"
          description="Requieren atención"
          loading={loading}
        />
        
        <StatCard
          title="Solicitudes"
          value={stats.solicitudesPendientes}
          icon="📋"
          color="purple"
          description="Pendientes de procesar"
          loading={loading}
        />
        
        <StatCard
          title="OT Activas"
          value={stats.otActivas}
          icon="🔧"
          color="green"
          description="En proceso"
          loading={loading}
        />
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Movimientos"
          value={stats.movimientosHoy}
          icon="📊"
          color="indigo"
          description="Realizados hoy"
          loading={loading}
        />

        <StatCard
          title="Valor Inventario"
          value={`$${(stats.valorInventario || 0).toLocaleString()}`}
          icon="💰"
          color="emerald"
          description="Total en pesos"
          loading={loading}
        />

        <StatCard
          title="Usuarios Activos"
          value={stats.usuariosActivos}
          icon="👥"
          color="teal"
          description="Conectados"
          loading={loading}
        />
      </div>
    </>
  );
}

/**
 * COMPONENTE PARA TARJETAS DE ESTADÍSTICAS
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, description, loading = false }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    teal: 'bg-teal-50 text-teal-600 border-teal-200',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 min-h-[120px]">
      <div className="flex items-start h-full">
        <div className={`p-2 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate" title={title}>
            {title}
          </p>
          <div className="mt-1">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : (
              <p className="text-xl font-bold text-gray-900 truncate" title={String(value)}>
                {value}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2" title={description}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
