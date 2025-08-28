// src/lib/auth/permissions.ts
import { UserRole, SystemModule, ModulePermissions,RolePermissions } from '@/types/auth';

/**
 * MATRIZ DE PERMISOS POR ROL
 * 
 * Basada en los requerimientos funcionales:
 * - Cada rol tiene acceso específico a módulos
 * - Los permisos son validados server-side (middleware)
 * - Granularidad por operación (CRUD + Export)
 */

export const ROLE_PERMISSIONS: Record<UserRole,  RolePermissions> = {
  // SUPERUSUARIO (tipo 0) - Acceso completo
  0: {
    dashboard: { canAccess: ['*'], canCreate: true, canEdit: true, canDelete: true, canExport: true },
    productos: { canAccess: ['*'], canCreate: true, canEdit: true, canDelete: true, canExport: true },
    stock: { canAccess: ['*'], canCreate: true, canEdit: true, canDelete: true, canExport: true },
    usuarios: { canAccess: ['*'], canCreate: true, canEdit: true, canDelete: true, canExport: true },
    colaboradores: { canAccess: ['*'], canCreate: true, canEdit: true, canDelete: true, canExport: true },
    ingresos: { canAccess: ['*'], canCreate: true, canEdit: true, canDelete: true, canExport: true },
    ot: { canAccess: ['*'], canCreate: true, canEdit: true, canDelete: true, canExport: true },
    solicitudes: { canAccess: ['*'], canCreate: true, canEdit: true, canDelete: true, canExport: true },
    asignaciones: { canAccess: ['*'], canCreate: true, canEdit: true, canDelete: true, canExport: true },
    kardex: { canAccess: ['*'], canCreate: false, canEdit: false, canDelete: false, canExport: true },
    reportes: { canAccess: ['*'], canCreate: true, canEdit: false, canDelete: false, canExport: true },
    configuracion: { canAccess: ['*'], canCreate: true, canEdit: true, canDelete: true, canExport: false }
  },

  // JEFATURA (tipo 1) - Gestión y supervisión
  1: {
    dashboard: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: true },
    ot: { canAccess: ['read', 'create', 'edit'], canCreate: true, canEdit: true, canDelete: false, canExport: true },
    solicitudes: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: true },
    reportes: { canAccess: ['read'], canCreate: true, canEdit: false, canDelete: false, canExport: true },
    colaboradores: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: true }
  },

  // GENERA OT (tipo 2) - Crea órdenes de trabajo
  2: {
    dashboard: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: false },
    ot: { canAccess: ['read', 'create', 'edit'], canCreate: true, canEdit: true, canDelete: false, canExport: true },
    solicitudes: { canAccess: ['read', 'create', 'edit'], canCreate: true, canEdit: true, canDelete: false, canExport: true },
    productos: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: false },
    colaboradores: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: false }
  },

  // VALIDA SOLICITUDES (tipo 3) - Aprueba/rechaza solicitudes
  3: {
    dashboard: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: false },
    solicitudes: { canAccess: ['read', 'edit'], canCreate: false, canEdit: true, canDelete: false, canExport: true },
    asignaciones: { canAccess: ['read', 'edit'], canCreate: false, canEdit: true, canDelete: false, canExport: false },
    productos: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: false },
    stock: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: false }
  },

  // ALMACÉN/DESPACHO (tipo 4) - Maneja inventario y despachos
  4: {
    dashboard: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: false },
    stock: { canAccess: ['read', 'edit'], canCreate: false, canEdit: true, canDelete: false, canExport: true },
    productos: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: false },
    solicitudes: { canAccess: ['read', 'edit'], canCreate: false, canEdit: true, canDelete: false, canExport: true },
    asignaciones: { canAccess: ['read', 'edit'], canCreate: false, canEdit: true, canDelete: false, canExport: false },
    kardex: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: true }
  },

  // REALIZA INGRESOS (tipo 5) - Ingresa productos al stock
  5: {
    dashboard: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: false },
    productos: { canAccess: ['read', 'create', 'edit'], canCreate: true, canEdit: true, canDelete: false, canExport: true },
    stock: { canAccess: ['read', 'edit'], canCreate: false, canEdit: true, canDelete: false, canExport: true },
    ingresos: { canAccess: ['read', 'create', 'edit'], canCreate: true, canEdit: true, canDelete: false, canExport: true },
    kardex: { canAccess: ['read'], canCreate: false, canEdit: false, canDelete: false, canExport: true }
  }
};

/**
 * Nombres descriptivos de los roles para UI
 */
export const ROLE_NAMES: Record<UserRole, string> = {
  0: 'Superusuario',
  1: 'Jefatura',
  2: 'Genera OT',
  3: 'Valida Solicitudes',
  4: 'Almacén/Despacho',
  5: 'Realiza Ingresos'
};

/**
 * Módulos disponibles en el sistema
 */
export const SYSTEM_MODULES: SystemModule[] = [
  'dashboard',
  'productos',
  'stock',
  'usuarios',
  'colaboradores',
  'ingresos',
  'ot',
  'solicitudes', 
  'asignaciones',
  'kardex',
  'reportes',
  'configuracion'
];

/**
 * Verifica si un usuario tiene permiso para acceder a un módulo
 */
export function hasModuleAccess(userRole: UserRole, module: SystemModule): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  const modulePermissions = rolePermissions?.[module];
  
  if (!modulePermissions) return false;
  
  // Si tiene acceso completo (*)
  if (modulePermissions.canAccess.includes('*')) return true;
  
  // Si tiene al menos permiso de lectura
  return modulePermissions.canAccess.includes('read');
}

/**
 * Verifica si un usuario puede realizar una operación específica
 */
export function hasOperationPermission(
  userRole: UserRole, 
  module: SystemModule, 
  operation: 'create' | 'edit' | 'delete' | 'export'
): boolean {
  if (!hasModuleAccess(userRole, module)) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  const modulePermissions = rolePermissions[module];
  
  const permissionKey = `can${operation.charAt(0).toUpperCase() + operation.slice(1)}` as keyof ModulePermissions;
  return modulePermissions?.[permissionKey] === true;
}

/**
 * Obtiene todos los módulos accesibles por un rol
 */
export function getAccessibleModules(userRole: UserRole): SystemModule[] {
  return SYSTEM_MODULES.filter(module => hasModuleAccess(userRole, module));
}

/**
 * Verifica permisos para rutas del middleware
 */
export function hasRoutePermission(pathname: string, userRole: UserRole): boolean {
  // Extraer módulo de la ruta: /dashboard/productos -> productos
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Ruta raíz del dashboard
  if (pathSegments.length === 1 && pathSegments[0] === 'dashboard') {
    return hasModuleAccess(userRole, 'dashboard');
  }
  
  // Rutas de módulos específicos
  if (pathSegments.length >= 2 && pathSegments[0] === 'dashboard') {
    const module = pathSegments[1] as SystemModule;
    return hasModuleAccess(userRole, module);
  }
  
  return false;
}

/**
 * Configuración de redirección por rol (página por defecto después del login)
 */
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  0: '/dashboard', // Superusuario -> Dashboard principal
  1: '/dashboard/reportes', // Jefatura -> Reportes
  2: '/dashboard/ot', // Genera OT -> Órdenes de trabajo
  3: '/dashboard/solicitudes', // Valida solicitudes -> Solicitudes
  4: '/dashboard/stock', // Almacén -> Stock
  5: '/dashboard/ingresos' // Realiza ingresos -> Ingresos
};