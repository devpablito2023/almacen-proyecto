// src/app/(dashboard)/layout.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { usePathname } from 'next/navigation';

/**
 * LAYOUT PRINCIPAL PROFESIONAL
 * 
 * Layout completo con:
 * - Sidebar inteligente con permisos
 * - Header responsive con búsqueda
 * - Breadcrumbs automáticos
 * - Estados de carga y error
 * - Responsive design completo
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, isLoading, isInitialized } = useAuth();
  const pathname = usePathname();
  
  // Estado del sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Generar breadcrumbs automáticamente
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href?: string }[] = [];

    if (segments.length > 1) {
      // Mapeo de rutas a nombres amigables
      const routeNames: Record<string, string> = {
        dashboard: 'Dashboard',
        productos: 'Productos',
        stock: 'Stock',
        ingresos: 'Ingresos',
        ot: 'Órdenes de Trabajo',
        solicitudes: 'Solicitudes',
        asignaciones: 'Asignaciones',
        kardex: 'Kardex',
        colaboradores: 'Colaboradores',
        usuarios: 'Usuarios',
        reportes: 'Reportes',
        configuracion: 'Configuración'
      };

      let currentPath = '';
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;
        
        if (segment !== 'dashboard' || segments.length > 1) {
          breadcrumbs.push({
            label: routeNames[segment] || segment,
            href: isLast ? undefined : currentPath
          });
        }
      });
    }

    return breadcrumbs;
  };

  // Generar título de página
  const generatePageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return 'Dashboard';
    
    const routeNames: Record<string, string> = {
      productos: 'Gestión de Productos',
      stock: 'Control de Stock',
      ingresos: 'Ingresos de Mercancía',
      ot: 'Órdenes de Trabajo',
      solicitudes: 'Solicitudes de Materiales',
      asignaciones: 'Asignaciones de Productos',
      kardex: 'Kardex de Movimientos',
      colaboradores: 'Gestión de Colaboradores',
      usuarios: 'Administración de Usuarios',
      reportes: 'Reportes y Analytics',
      configuracion: 'Configuración del Sistema'
    };

    const lastSegment = segments[segments.length - 1];
    return routeNames[lastSegment] || lastSegment;
  };

  const breadcrumbs = generateBreadcrumbs();
  const pageTitle = generatePageTitle();

  // Estados de carga
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-gray-600">Cargando sistema...</p>
          <p className="text-xs text-gray-400 mt-1">Inicializando permisos y configuración</p>
        </div>
      </div>
    );
  }

  // Estado de error (usuario no autenticado)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
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
          <button
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={setIsSidebarCollapsed}
        />
      </div>

      {/* Sidebar Mobile - Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          {/* Sidebar móvil */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Navegación</h2>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Header */}
        <Header 
          title={pageTitle}
          breadcrumbs={breadcrumbs}
        />

        {/* Botón menú móvil */}
        <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-gray-200 px-4 py-2">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menú
          </button>
        </div>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
              isSidebarCollapsed ? 'lg:px-6' : 'lg:px-8'
            }`}>
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
            <div>
              Sistema Control de Almacén &copy; {new Date().getFullYear()}
            </div>
            <div className="flex items-center space-x-4">
              <span>Usuario: {user.nombre_usuario}</span>
              <span>•</span>
              <span>Versión 1.0.0</span>
              <span>•</span>
              <span className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-1"></div>
                Sistema Activo
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Debug panel para desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-40">
          <details className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-xs">
            <summary className="p-3 cursor-pointer text-xs font-medium text-gray-700 hover:bg-gray-50">
              🔧 Layout Debug
            </summary>
            <div className="p-3 border-t border-gray-200 text-xs font-mono space-y-1">
              <div><strong>Path:</strong> {pathname}</div>
              <div><strong>Title:</strong> {pageTitle}</div>
              <div><strong>Breadcrumbs:</strong> {breadcrumbs.length}</div>
              <div><strong>Sidebar:</strong> {isSidebarCollapsed ? 'Collapsed' : 'Expanded'}</div>
              <div><strong>Mobile:</strong> {isMobileSidebarOpen ? 'Open' : 'Closed'}</div>
              <div><strong>User Role:</strong> {user.tipo_usuario}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;