// src/types/auth.ts

/**
 * Tipos de usuario según los requerimientos del sistema
 * 0: Superusuario - Acceso total
 * 1: Jefatura - Gestión y reportes
 * 2: Genera OT - Crea órdenes de trabajo
 * 3: Valida solicitudes - Aprueba/rechaza solicitudes
 * 4: Almacén/Despacho - Maneja inventario
 * 5: Realiza ingresos - Ingresa productos al stock
 */
export type UserRole = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Interface del usuario completa
 * Basada en los campos definidos en las especificaciones
 */
export interface User {
  id_usuario: number;
  codigo_usuario: string;
  nombre_usuario: string;
  email_usuario: string;
  tipo_usuario: UserRole;
  area_usuario?: string;
  estado_usuario: number; // 1=activo, 0=inactivo
  ultimo_login?: string;
  intentos_login: number;
  created_at: string;
  updated_at?: string;
  created_by: number;
  updated_by?: number;
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  email_usuario: string;
  password_usuario: string;
}

/**
 * Respuesta del backend para auth
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  code: number;
  timestamp: string;
  data?: {
    user: User;
    token: string;
  };
}

/**
 * Contexto de autenticación para React Context
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * Permisos por módulo del sistema
 */
export interface ModulePermissions {
  canAccess: string[];
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
}

/**
 * Configuración de permisos por rol
 */
export interface RolePermissions {
  [key: string]: ModulePermissions;
}

/**
 * Estado de sesión para el middleware
 */
export interface SessionState {
  isValid: boolean;
  user?: User;
  permissions?: RolePermissions;
  expiresAt?: number;
}