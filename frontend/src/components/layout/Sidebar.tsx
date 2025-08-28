// src/components/layout/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SystemModule } from '@/types/auth';

/**
 * SIDEBAR PROFESIONAL CON PERMISOS
 * 
 * Funcionalidades:
 * - Navegación basada en permisos de usuario
 * - Indicadores de estado activo
 * - Badges con notificaciones
 * - Sidebar colapsible
 * - Responsive design
 * - Grupos de módulos organizados
 */

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

interface MenuItem {
  id: SystemModule;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: {
    text: string;
    color: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  };
  description?: string;
}

interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { hasModulePermission, userRole, roleName } = useAuth();
  
  const [internalCollapsed, setInternalCollapsed] = useState(isCollapsed);
  const collapsed = onToggleCollapse ? isCollapsed : internalCollapsed;

  // Definición de todos los módulos del sistema
  const menuGroups: MenuGroup[] = [
    {
      id: 'main',
      label: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v12H8V5z" />
            </svg>
          ),
          description: 'Panel principal del sistema'
        }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventario',
      items: [
        {
          id: 'productos',
          label: 'Productos',
          href: '/dashboard/productos',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          ),
          description: 'Gestión de productos e insumos',
          badge: { text: '1,250', color: 'blue' }
        },
        {
          id: 'stock',
          label: 'Stock',
          href: '/dashboard/stock',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          ),
          description: 'Control de inventario y stock',
          badge: { text: '25', color: 'red' } // Stock bajo
        },
        {
          id: 'ingresos',
          label: 'Ingresos',
          href: '/dashboard/ingresos',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ),
          description: 'Ingreso de productos al almacén'
        },
        {
          id: 'kardex',
          label: 'Kardex',
          href: '/dashboard/kardex',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          description: 'Historial de movimientos'
        }
      ]
    },
    {
      id: 'operations',
      label: 'Operaciones',
      items: [
        {
          id: 'ot',
          label: 'Órdenes de Trabajo',
          href: '/dashboard/ot',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          description: 'Gestión de órdenes de trabajo',
          badge: { text: '15', color: 'green' } // OT activas
        },
        {
          id: 'solicitudes',
          label: 'Solicitudes',
          href: '/dashboard/solicitudes',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
          description: 'Solicitudes de materiales',
          badge: { text: '8', color: 'yellow' } // Pendientes
        },
        {
          id: 'asignaciones',
          label: 'Asignaciones',
          href: '/dashboard/asignaciones',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-5 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ),
          description: 'Asignación de productos'
        }
      ]
    },
    {
      id: 'management',
      label: 'Gestión',
      items: [
        {
          id: 'colaboradores',
          label: 'Colaboradores',
          href: '/dashboard/colaboradores',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          ),
          description: 'Personal y terceros'
        },
        {
          id: 'usuarios',
          label: 'Usuarios',
          href: '/dashboard/usuarios',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          description: 'Gestión de usuarios del sistema'
        },
        {
          id: 'reportes',
          label: 'Reportes',
          href: '/dashboard/reportes',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          description: 'Reportes y analytics'
        },
        {
          id: 'configuracion',
          label: 'Configuración',
          href: '/dashboard/configuracion',
          icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          ),
          description: 'Configuración del sistema'
        }
      ]
    }
  ];

  // Filtrar elementos según permisos
  const getFilteredGroups = () => {
    return menuGroups.map(group => ({
      ...group,
      items: group.items.filter(item => hasModulePermission(item.id))
    })).filter(group => group.items.length > 0);
  };

  const filteredGroups = getFilteredGroups();

  // Manejar toggle del sidebar
  const handleToggle = () => {
    const newCollapsed = !collapsed;
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  };

  // Verificar si una ruta está activa
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  // Manejar navegación
  const handleNavigation = (href: string) => {
    router.push(href);
  };

  // Render del badge
  const renderBadge = (badge?: { text: string; color: string }) => {
    if (!badge || collapsed) return null;

    const colorClasses = {
      red: 'bg-red-100 text-red-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses[badge.color as keyof typeof colorClasses]}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 flex flex-col transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      
      {/* Header del sidebar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">Navegación</h2>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                {roleName}
              </span>
            </div>
          )}
          
          <button
            onClick={handleToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            <svg 
              className={`h-4 w-4 text-gray-600 transition-transform ${collapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {filteredGroups.map((group) => (
          <div key={group.id}>
            {/* Título del grupo */}
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {group.label}
              </h3>
            )}
            
            {/* Items del grupo */}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                        active
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } ${collapsed ? 'justify-center' : 'justify-between'}`}
                      title={collapsed ? `${item.label} - ${item.description}` : undefined}
                    >
                      <div className="flex items-center min-w-0">
                        {/* Icono */}
                        <div className={`flex-shrink-0 ${collapsed ? '' : 'mr-3'} ${
                          active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                        }`}>
                          {item.icon}
                        </div>
                        
                        {/* Label y descripción */}
                        {!collapsed && (
                          <div className="min-w-0 flex-1">
                            <span className="block truncate">{item.label}</span>
                            {item.description && (
                              <span className="block text-xs text-gray-400 truncate">
                                {item.description}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Badge */}
                      {renderBadge(item.badge)}
                      
                      {/* Indicador activo para sidebar colapsado */}
                      {collapsed && active && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l"></div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer del sidebar */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed ? (
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Rol:</span>
              <span className="font-medium">{roleName}</span>
            </div>
            <div className="flex justify-between">
              <span>Módulos:</span>
              <span className="font-medium">{filteredGroups.reduce((acc, group) => acc + group.items.length, 0)}</span>
            </div>
            <div className="text-center pt-2">
              <span className="text-blue-600 font-medium">v1.0.0</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {userRole !== null ? userRole.toString() : 'U'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip para sidebar colapsado */}
      {collapsed && (
        <div className="sr-only">
          Sidebar colapsado. Haz clic en el botón de expandir para ver todos los módulos disponibles.
        </div>
      )}
    </div>
  );
};

export default Sidebar;