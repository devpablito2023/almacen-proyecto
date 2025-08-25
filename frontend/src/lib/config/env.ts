/**
 * Configuración y validación de variables de entorno
 * Centraliza todas las configuraciones de la aplicación
 */

// Validación de variables de entorno requeridas
function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  
  if (!value) {
    throw new Error(`Variable de entorno requerida no encontrada: ${name}`);
  }
  
  return value;
}

function getEnvNumber(name: string, defaultValue: number): number {
  const value = process.env[name];
  
  if (!value) {
    return defaultValue;
  }
  
  const numValue = parseInt(value, 10);
  
  if (isNaN(numValue)) {
    throw new Error(`Variable de entorno ${name} debe ser un número válido`);
  }
  
  return numValue;
}

function getEnvBoolean(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  
  if (!value) {
    return defaultValue;
  }
  
  return value.toLowerCase() === 'true';
}

// Configuración de la aplicación
export const env = {
  // API Configuration
  //aqui ocurre la configuracion de la rura , no el archivo .env supongo pa desarrollo
  //API_URL: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:7070'),
  API_URL: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:7070/api'),

  API_TIMEOUT: getEnvNumber('NEXT_PUBLIC_API_TIMEOUT', 10000),
  
  // App Configuration
  APP_NAME: getEnvVar('NEXT_PUBLIC_APP_NAME', 'Control de Almacén'),
  APP_VERSION: getEnvVar('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
  COMPANY_NAME: getEnvVar('NEXT_PUBLIC_COMPANY_NAME', 'Mi Empresa'),
  
  // Features
  ENABLE_ANALYTICS: getEnvBoolean('NEXT_PUBLIC_ENABLE_ANALYTICS', false),
  ENABLE_NOTIFICATIONS: getEnvBoolean('NEXT_PUBLIC_ENABLE_NOTIFICATIONS', true),
  
  // Development
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  DEBUG: getEnvBoolean('NEXT_PUBLIC_DEBUG', false),
  
  // Storage
  STORAGE_PREFIX: 'almacen_app_',
  
  // Session
  TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  
  // Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  
  // Alerts
  TOAST_DURATION: 5000, // 5 segundos
  ALERT_AUTO_DISMISS: 10000, // 10 segundos
} as const;

// Validar configuración al inicializar
export function validateConfig(): void {
  try {
    // Validar URL de API
    new URL(env.API_URL);
    
    // Validar timeout
    if (env.API_TIMEOUT < 1000 || env.API_TIMEOUT > 60000) {
      throw new Error('API_TIMEOUT debe estar entre 1000 y 60000 ms');
    }
    
    // Validar nombres
    if (!env.APP_NAME.trim()) {
      throw new Error('APP_NAME no puede estar vacío');
    }
    
    if (env.IS_DEVELOPMENT && env.DEBUG) {
      console.log('🔧 Configuración validada exitosamente', {
        API_URL: env.API_URL,
        APP_NAME: env.APP_NAME,
        NODE_ENV: env.NODE_ENV,
      });
    }
  } catch (error) {
    console.error('❌ Error validando configuración:', error);
    throw error;
  }
}

// Exportar configuración por módulos
export const apiConfig = {
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

export const appConfig = {
  name: env.APP_NAME,
  version: env.APP_VERSION,
  company: env.COMPANY_NAME,
  features: {
    analytics: env.ENABLE_ANALYTICS,
    notifications: env.ENABLE_NOTIFICATIONS,
  },
} as const;

export const storageConfig = {
  prefix: env.STORAGE_PREFIX,
  keys: {
    token: env.TOKEN_KEY,
    refreshToken: env.REFRESH_TOKEN_KEY,
    user: env.USER_KEY,
  },
} as const;

export const uploadConfig = {
  maxFileSize: env.MAX_FILE_SIZE,
  allowedTypes: env.ALLOWED_FILE_TYPES,
} as const;