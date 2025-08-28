"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils/cn';
import { BreadcrumbItem } from '../../types/global';

/**
 * Componente Breadcrumbs para navegación jerárquica
 * Genera breadcrumbs automáticamente basado en la ruta actual
 */

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  maxItems?: number;
  className?: string;
  separator?: React.ReactNode;
}

// Mapeo de rutas para generar breadcrumbs automáticamente
const routeMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/productos': 'Productos',
  '/stock': 'Stock',
  '/usuarios': 'Usuarios',
  '/ingresos': 'Ingresos',
  '/ot': 'Órdenes de Trabajo',
  '/solicitudes': 'Solicitudes',
  '/reportes': 'Reportes',
  '/configuracion': 'Configuración',
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  maxItems = 4,
  className,
  separator
}) => {
  const pathname = usePathname();

  // Generar breadcrumbs automáticamente si no se proporcionan items
  const breadcrumbItems = React.useMemo(() => {
    if (items) return items;

    const pathSegments = pathname.split('/').filter(Boolean);
    const generatedItems: BreadcrumbItem[] = [];

    // Siempre agregar Home/Dashboard como primer item (excepto si ya estamos ahí)
    if (pathname !== '/dashboard') {
      generatedItems.push({
        label: 'Dashboard',
        href: '/dashboard',
      });
    }

    // Construir breadcrumbs basado en los segmentos de la URL
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Obtener el nombre legible del segmento
      let label = routeMap[currentPath];
      
      if (!label) {
        // Si no hay mapeo específico, formatear el segmento
        if (segment.match(/^\d+$/)) {
          // Si es un ID numérico, usar el nombre del segmento anterior + ID
          const parentPath = pathSegments.slice(0, index).join('/');
          const parentLabel = routeMap[`/${parentPath}`] || 'Detalle';
          label = `${parentLabel} #${segment}`;
        } else {
          // Formatear el segmento (capitalizar y reemplazar guiones)
          label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }

      const isLast = index === pathSegments.length - 1;
      
      generatedItems.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast,
      });
    });

    return generatedItems;
  }, [items, pathname]);

  // Truncar items si excede maxItems
  const displayItems = React.useMemo(() => {
    if (breadcrumbItems.length <= maxItems) {
      return breadcrumbItems;
    }

    const firstItem = breadcrumbItems[0];
    const lastItems = breadcrumbItems.slice(-2); // Últimos 2 items
    const truncatedItems = [
      firstItem,
      { label: '...', href: undefined },
      ...lastItems,
    ];

    return truncatedItems;
  }, [breadcrumbItems, maxItems]);

  const defaultSeparator = (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  if (displayItems.length <= 1) {
    return null; // No mostrar breadcrumbs si solo hay un item
  }

  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {displayItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 flex-shrink-0">
                {separator || defaultSeparator}
              </span>
            )}
            
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  'text-gray-500 hover:text-gray-700 focus:text-primary-600',
                  'focus:outline-none focus:underline'
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'text-sm font-medium',
                  item.current 
                    ? 'text-gray-900' 
                    : 'text-gray-400'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Breadcrumbs personalizados para casos específicos
export const ProductBreadcrumbs: React.FC<{ productName?: string; productId?: string }> = ({
  productName,
  productId
}) => {
  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Productos', href: '/productos' },
  ];

  if (productId && productName) {
    items.push({ label: productName, current: true });
  } else if (productId) {
    items.push({ label: `Producto #${productId}`, current: true });
  }

  return <Breadcrumbs items={items} />;
};

export const OTBreadcrumbs: React.FC<{ otNumber?: string }> = ({ otNumber }) => {
  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Órdenes de Trabajo', href: '/ot' },
  ];

  if (otNumber) {
    items.push({ label: `OT ${otNumber}`, current: true });
  }

  return <Breadcrumbs items={items} />;
};

export const RequestBreadcrumbs: React.FC<{ 
  requestId?: string; 
  otNumber?: string;
  action?: string;
}> = ({ 
  requestId, 
  otNumber, 
  action 
}) => {
  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Solicitudes', href: '/solicitudes' },
  ];

  if (requestId) {
    if (otNumber) {
      items.push({ 
        label: `Solicitud ${requestId} (OT ${otNumber})`, 
        href: `/solicitudes/${requestId}` 
      });
    } else {
      items.push({ 
        label: `Solicitud ${requestId}`, 
        href: `/solicitudes/${requestId}` 
      });
    }

    if (action) {
      const actionLabels: Record<string, string> = {
        'edit': 'Editar',
        'validate': 'Validar',
        'dispatch': 'Despachar',
        'return': 'Devolver',
      };
      
      items.push({ 
        label: actionLabels[action] || action, 
        current: true 
      });
    }
  }

  return <Breadcrumbs items={items} />;
};

// Breadcrumbs con acciones adicionales
export interface BreadcrumbsWithActionsProps extends BreadcrumbsProps {
  actions?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const BreadcrumbsWithActions: React.FC<BreadcrumbsWithActionsProps> = ({
  actions,
  title,
  subtitle,
  ...breadcrumbProps
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumbs */}
        <Breadcrumbs {...breadcrumbProps} className="mb-4" />
        
        {/* Title and Actions */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex-shrink-0 ml-4">
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Breadcrumbs;