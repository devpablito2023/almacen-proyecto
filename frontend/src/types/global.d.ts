// src/types/global.d.ts

/**
 * TIPOS GLOBALES DEL SISTEMA
 * Estos tipos se usan en toda la aplicación y definen:
 * - Interfaces globales de Window
 * - Tipos de usuario del sistema
 * - Respuestas estándar de API
 */

declare global {
  interface Window {
    fs: {
      readFile: (path: string, options?: any) => Promise<Uint8Array | string>;
    };
  }
}

// Tipos de usuario según la documentación del sistema
export type UserType = 0 | 1 | 2 | 3 | 4 | 5;

// Mapeo de tipos de usuario para referencia
export const USER_TYPE_MAP = {
  0: 'Superusuario',
  1: 'Jefatura', 
  2: 'Genera OT',
  3: 'Valida Solicitudes',
  4: 'Almacén/Despacho',
  5: 'Realiza Ingresos',
} as const;

// Respuesta estándar exitosa de la API
export interface ApiResponse<T> {
  data: T;
  message: string;
  code: number;
}

// Respuesta estándar de error de la API
export interface ErrorResponse {
  error: string;
  code: number;
  message: string;
}

// Tipo para paginación estándar
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Respuesta paginada estándar
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  message: string;
  code: number;
}

// Estados comunes del sistema
export type Status = 'active' | 'inactive' | 'pending' | 'deleted';

// Niveles de alerta
export type AlertLevel = 'info' | 'warning' | 'error' | 'success';

export {};