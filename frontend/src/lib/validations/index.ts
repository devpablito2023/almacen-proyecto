// src/lib/validations/index.ts

/**
 * EXPORTACIONES CENTRALIZADAS DE VALIDACIONES
 */

// Esquemas de autenticación
export * from './auth';

// Esquemas de productos
export * from './product';

// Re-exports más comunes
export {
  loginSchema,
  changePasswordSchema,
  userProfileSchema,
} from './auth';

export {
  productSchema,
  productFiltersSchema,
  productImportSchema,
} from './product';