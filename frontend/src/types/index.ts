// src/types/index.ts

/**
 * EXPORTACIONES CENTRALIZADAS DE TIPOS
 * Este archivo centraliza todos los exports para facilitar imports
 * En lugar de: import { User } from '@/types/auth'
 * Podemos usar: import { User } from '@/types'
 */

// Tipos globales
export * from './global';

// Tipos de autenticación
export * from './auth';

// Tipos de productos
export * from './product';

// Tipos de stock y kardex
export * from './stock';

// Tipos de operaciones
export * from './operations';

// Re-exports específicos para facilitar uso
export type {
  // Más comunes de auth
  User,
  LoginCredentials,
  AuthState,
} from './auth';

export type {
  // Más comunes de products
  Product,
  ProductFormData,
  ProductFilters,
} from './product';

export type {
  // Más comunes de stock
  Stock,
  StockAlert,
  KardexMovement,
} from './stock';

export type {
  // Más comunes de operations
  OrdenTrabajo,
  Solicitud,
  Asignacion,
} from './operations';