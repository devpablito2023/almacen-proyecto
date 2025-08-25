'use client';

import React from 'react';
import { PageLayout } from '../../../components/layout';
import { StatCard } from '../../../components/ui';

/**
 * Página principal del Dashboard
 * Ejemplo de implementación usando PageLayout
 */

const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [metrics, setMetrics] = React.useState({
    totalProducts: 0,
    lowStock: 0,
    pendingRequests: 0,
    inventoryValue: 0,
  });

  // Simular carga de datos
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMetrics({
        totalProducts: 1250,
        lowStock: 15,
        pendingRequests: 8,
        inventoryValue: 145000,
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Resumen general del sistema de almacén"
      isLoading={isLoading}
      showHeader={false} // No mostrar header adicional, ya está en MainLayout
    >
      <div className="space-y-6">
        
        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Productos"
            value={metrics.totalProducts.toLocaleString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            change={{
              value: 12,
              type: 'increase',
              period: 'mes anterior',
            }}
          />

          <StatCard
            title="Stock Bajo"
            value={metrics.lowStock}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
            change={{
              value: 3,
              type: 'decrease',
              period: 'semana anterior',
            }}
            variant="bordered"
          />

          <StatCard
            title="Solicitudes Pendientes"
            value={metrics.pendingRequests}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            hoverable
          />

          <StatCard
            title="Valor Inventario"
            value={`S/ ${metrics.inventoryValue.toLocaleString()}`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            change={{
              value: 8.5,
              type: 'increase',
              period: 'mes anterior',
            }}
            variant="elevated"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Ver todas
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  icon: '📦',
                  title: 'Ingreso de productos',
                  description: '25 productos agregados al inventario',
                  time: 'Hace 2 horas',
                },
                {
                  icon: '📋',
                  title: 'Nueva solicitud',
                  description: 'OT-2024-015 requiere validación',
                  time: 'Hace 4 horas',
                },
                {
                  icon: '✅',
                  title: 'Solicitud despachada',
                  description: 'OT-2024-012 completada exitosamente',
                  time: 'Hace 6 horas',
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  title: 'Nuevo Ingreso',
                  description: 'Registrar productos',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  ),
                  href: '/ingresos/nuevo',
                  color: 'bg-blue-500',
                },
                {
                  title: 'Nueva OT',
                  description: 'Crear orden de trabajo',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  ),
                  href: '/ot/nueva',
                  color: 'bg-green-500',
                },
                {
                  title: 'Ver Stock',
                  description: 'Consultar inventario',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  ),
                  href: '/stock',
                  color: 'bg-purple-500',
                },
                {
                  title: 'Reportes',
                  description: 'Generar informes',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  href: '/reportes',
                  color: 'bg-orange-500',
                },
              ].map((action, index) => (
                <button
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;