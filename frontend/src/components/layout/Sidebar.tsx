"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils/cn';
import  {useAuth}  from '../../hooks/useAuth';
import { ROUTES } from '../../lib/config/constants';

/**
 * Componente Sidebar de navegación
 * Navegación lateral con permisos basados en tipo de usuario
 */

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  requiredUserTypes: number[];
  badge?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: ROUTES.DASHBOARD,
    requiredUserTypes: [0, 1, 2, 3, 4, 5],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z" />
      </svg>
    ),
  },
  {
    name: 'Productos',
    href: ROUTES.PRODUCTOS,
    requiredUserTypes: [0, 1, 2, 3, 4, 5],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: 'Stock',
    href: ROUTES.STOCK,
    requiredUserTypes: [0, 1, 2, 3, 4, 5],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    badge: '5', // Ejemplo de badge para alertas
  },
  {
    name: 'Ingresos',
    href: ROUTES.INGRESOS,
    requiredUserTypes: [0, 5],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
  },
  {
    name: 'Órdenes de Trabajo',
    href: ROUTES.OT,
    requiredUserTypes: [0, 2],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    name: 'Solicitudes',
    href: ROUTES.SOLICITUDES,
    requiredUserTypes: [0, 2, 3, 4],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    badge: '12',
  },
  {
    name: 'Usuarios',
    href: ROUTES.USUARIOS,
    requiredUserTypes: [0],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    name: 'Reportes',
    href: ROUTES.REPORTES,
    requiredUserTypes: [0, 1],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: 'Configuración',
    href: ROUTES.CONFIGURACION,
    requiredUserTypes: [0],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onClose,
  className
}) => {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Cerrar sidebar en mobile al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (window.innerWidth < 1024 && onClose) { // Solo en mobile
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Filtrar elementos de navegación basado en permisos
  const filteredNavigation = navigationItems.filter(item => {
    if (!user) return false;
    return hasPermission(item.requiredUserTypes);
  });

  const isActive = (href: string) => {
    return pathname === href || (href !== ROUTES.DASHBOARD && pathname.startsWith(href));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Control Almacén</span>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
              onClick={() => {
                // Cerrar sidebar en mobile después de navegar
                if (window.innerWidth < 1024 && onClose) {
                  onClose();
                }
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <span className={cn(
                    'flex-shrink-0 mr-3',
                    isActive(item.href) ? 'text-primary-600' : 'text-gray-400'
                  )}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                </div>
                
                {/* Badge para notificaciones */}
                {item.badge && (
                  <span className={cn(
                    'inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full',
                    isActive(item.href) 
                      ? 'text-primary-800 bg-primary-200'
                      : 'text-white bg-danger-600'
                  )}>
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* User Info at Bottom */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.nombre_usuario?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.nombre_usuario || 'Usuario'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.tipo_usuario === 0 ? 'Superusuario' : 
                 user?.tipo_usuario === 1 ? 'Jefatura' :
                 user?.tipo_usuario === 2 ? 'Genera OT' :
                 user?.tipo_usuario === 3 ? 'Valida Solicitudes' :
                 user?.tipo_usuario === 4 ? 'Almacén/Despacho' :
                 user?.tipo_usuario === 5 ? 'Realiza Ingresos' : 'Usuario'}
              </div>
            </div>
          </div>
        </div>

        {/* Version info */}
        <div className="border-t border-gray-200 px-4 py-2">
          <div className="text-xs text-gray-400 text-center">
            v1.0.0 - Sistema Control de Almacén
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;