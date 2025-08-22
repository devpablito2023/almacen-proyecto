// src/lib/config/index.ts

/**
 * EXPORTACIONES CENTRALIZADAS DE CONFIGURACIÓN
 */

export * from './constants';
export * from './env';

// Re-exports más utilizados
export {
  API_CONFIG,
  USER_TYPES,
  ROUTES,
  PERMISSIONS,
  SYSTEM_MESSAGES,
} from './constants';

export {
  env,
  isDevelopment,
  isProduction,
  getEnvConfig,
} from './env';