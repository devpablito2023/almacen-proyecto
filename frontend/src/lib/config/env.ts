// src/lib/config/env.ts

/**
 * VALIDACIÓN DE VARIABLES DE ENTORNO
 * Valida que todas las variables necesarias estén definidas
 */

import { z } from 'zod';

// Schema de validación para variables de entorno
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url('URL de API inválida'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1, 'Nombre de app requerido'),
  NEXT_PUBLIC_APP_VERSION: z.string().min(1, 'Versión requerida'),
  NEXT_PUBLIC_ENV: z.enum(['development', 'staging', 'production']),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

// Función para validar variables de entorno
function validateEnv() {
  const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    return envSchema.parse(env);
  } catch (error) {
    console.error('❌ Variables de entorno inválidas:', error);
    throw new Error('Configuración de entorno inválida');
  }
}

// Exportar variables validadas
export const env = validateEnv();

// Helpers para verificar entorno
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Configuración específica por entorno
export const getEnvConfig = () => {
  const base = {
    apiUrl: env.NEXT_PUBLIC_API_URL,
    appName: env.NEXT_PUBLIC_APP_NAME,
    version: env.NEXT_PUBLIC_APP_VERSION,
  };

  switch (env.NEXT_PUBLIC_ENV) {
    case 'development':
      return {
        ...base,
        debug: true,
        logLevel: 'debug',
        enableDevtools: true,
      };
    
    case 'staging':
      return {
        ...base,
        debug: true,
        logLevel: 'info',
        enableDevtools: false,
      };
    
    case 'production':
      return {
        ...base,
        debug: false,
        logLevel: 'error',
        enableDevtools: false,
      };
  }
};