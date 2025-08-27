import { Breadcrumb, RouteNames } from '@/types/layout';

/**
 * Mapeo de rutas a nombres amigables para breadcrumbs
 */
const ROUTE_NAMES: RouteNames = {
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

/**
 * Mapeo de rutas a títulos de página completos
 */
const PAGE_TITLES: RouteNames = {
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

/**
 * Genera breadcrumbs automáticamente basado en la ruta actual
 */
export function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [];

  if (segments.length > 1) {
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      if (segment !== 'dashboard' || segments.length > 1) {
        breadcrumbs.push({
          label: ROUTE_NAMES[segment] || segment,
          href: isLast ? undefined : currentPath
        });
      }
    });
  }

  return breadcrumbs;
}

/**
 * Genera el título de la página basado en la ruta actual
 */
export function generatePageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return 'Dashboard';
  
  const lastSegment = segments[segments.length - 1];
  return PAGE_TITLES[lastSegment] || ROUTE_NAMES[lastSegment] || lastSegment;
}
