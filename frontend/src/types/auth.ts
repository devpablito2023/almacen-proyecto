// src/types/auth.ts

/**
 * TIPOS RELACIONADOS CON AUTENTICACIÓN
 * Basados en el módulo USUARIO de la documentación
 */

import { UserType } from './global';

// Usuario completo del sistema
export interface User {
  id_usuario: number;
  codigo_usuario: string;
  nombre_usuario: string;
  email_usuario: string;
  tipo_usuario: UserType;
  area_usuario: string;
  estado_usuario: number; // 1=activo, 0=inactivo
  ultimo_login?: string;
  intentos_login: number;
  created_at: string;
  updated_at?: string;
  created_by: number;
  updated_by?: number;
}

// Credenciales para login
export interface LoginCredentials {
  email_usuario: string;
  password: string;
  remember_me?: boolean;
}

// Respuesta del login exitoso
export interface LoginResponse {
  user: User;
  token: string;
  refresh_token: string;
  expires_in: number;
}

// Estado global de autenticación (para Zustand)
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number;
}

// Datos para cambio de contraseña
export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Datos para reset de contraseña
export interface ResetPasswordData {
  email_usuario: string;
}

// Perfil editable del usuario
export interface UserProfile {
  nombre_usuario: string;
  email_usuario: string;
  area_usuario: string;
}

// Permisos por tipo de usuario
export interface UserPermissions {
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canViewStock: boolean;
  canAdjustStock: boolean;
  canCreateOT: boolean;
  canValidateSolicitudes: boolean;
  canDispatch: boolean;
  canCreateIngresos: boolean;
  canManageUsers: boolean;
}