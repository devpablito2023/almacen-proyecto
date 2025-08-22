// src/lib/config/constants.ts

/**
 * CONSTANTES CENTRALIZADAS DEL SISTEMA
 * Configuración que se usa en toda la aplicación
 */

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7070',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60000, // 1 minuto
} as const;

// Tipos de usuario según documentación
export const USER_TYPES = {
  0: 'Superusuario',
  1: 'Jefatura', 
  2: 'Genera OT',
  3: 'Valida Solicitudes',
  4: 'Almacén/Despacho',
  5: 'Realiza Ingresos',
} as const;

// Tipos de productos

export const PRODUCT_TYPES = [
  'insumo',
  'repuesto', 
  'herramienta',
  'otro'
] as const;

export const PRODUCT_TYPES_MUTABLE: [string, ...string[]] = [
  'insumo',
  'repuesto', 
  'herramienta',
  'otro'
];

// Estados de productos
export const PRODUCT_STATUS = {
  ACTIVE: 1,
  DELETED: 0,
} as const;

// Rutas de la aplicación
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',
  
  // Dashboard
  HOME: '/',
  DASHBOARD: '/dashboard',
  
  // Módulos principales
  PRODUCTOS: '/productos',
  STOCK: '/stock',
  USUARIOS: '/usuarios',
  INGRESOS: '/ingresos',
  OT: '/ot',
  SOLICITUDES: '/solicitudes',
  REPORTES: '/reportes',
  CONFIGURACION: '/configuracion',
  
  // Rutas específicas
  PRODUCTOS_NUEVO: '/productos/nuevo',
  PRODUCTOS_EDIT: (id: number) => `/productos/${id}/edit`,
  PRODUCTOS_VIEW: (id: number) => `/productos/${id}`,
  
  STOCK_AJUSTES: '/stock/ajustes',
  
  OT_NUEVO: '/ot/nuevo',
  OT_VIEW: (id: number) => `/ot/${id}`,
  
  SOLICITUDES_VALIDAR: '/solicitudes/validar',
  SOLICITUDES_DESPACHAR: '/solicitudes/despachar',
} as const;

// Permisos por tipo de usuario
export const PERMISSIONS = {
  // Productos
  CREAR_PRODUCTOS: [0, 5],
  VER_PRODUCTOS: [0, 1, 2, 3, 4, 5],
  EDITAR_PRODUCTOS: [0, 5],
  ELIMINAR_PRODUCTOS: [0],
  IMPORTAR_PRODUCTOS: [0, 5],
  EXPORTAR_PRODUCTOS: [0, 1, 5],
  
  // Stock
  VER_STOCK: [0, 1, 2, 3, 4, 5],
  AJUSTAR_STOCK: [0, 4, 5],
  VER_KARDEX: [0, 1, 4, 5],
  
  // OT y Solicitudes
  CREAR_OT: [0, 2],
  VER_OT: [0, 1, 2, 3, 4],
  EDITAR_OT: [0, 2],
  
  VALIDAR_SOLICITUDES: [0, 3],
  DESPACHAR_SOLICITUDES: [0, 4],
  CREAR_DEVOLUCIONES: [0, 2, 4],
  
  // Ingresos
  CREAR_INGRESOS: [0, 5],
  VALIDAR_INGRESOS: [0, 4],
  
  // Usuarios
  GESTIONAR_USUARIOS: [0],
  VER_USUARIOS: [0, 1],
  
  // Reportes
  VER_REPORTES: [0, 1, 3, 4, 5],
  GENERAR_REPORTES: [0, 1],
  
  // Configuración
  ACCEDER_CONFIGURACION: [0],
} as const;

// Estados de OT
export const OT_STATUS = {
  CANCELADA: 0,
  CREADA: 1,
  EN_PROCESO: 2,
  PAUSADA: 3,
  FINALIZADA: 4,
} as const;

// Estados de solicitud
export const SOLICITUD_STATUS = {
  CANCELADA: 0,
  SOLICITADA: 1,
  ASIGNADA: 2,
  DESPACHADA: 3,
  FINALIZADA: 4,
} as const;

// Estados de asignación
export const ASIGNACION_STATUS = {
  SOLICITADO: 1,
  VALIDADO: 2,
  DESPACHO_PARCIAL: 3,
  DESPACHO_TOTAL: 4,
  REAPERTURA: 5,
} as const;

// Operaciones de kardex
export const KARDEX_OPERATIONS = {
  INGRESO: 'INGRESO',
  SALIDA: 'SALIDA',
  DEVOLUCION: 'DEVOLUCION',
  AJUSTE_POSITIVO: 'AJUSTE_POSITIVO',
  AJUSTE_NEGATIVO: 'AJUSTE_NEGATIVO',
  TRANSFERENCIA: 'TRANSFERENCIA',
} as const;

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  LIMITS: [10, 20, 50, 100],
  MAX_LIMIT: 1000,
} as const;

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  EXCEL_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ],
  UPLOAD_DIR: '/uploads',
  TEMP_DIR: '/temp',
} as const;

// Configuración de alertas
export const ALERT_CONFIG = {
  AUTO_DISMISS_TIME: 5000, // 5 segundos
  MAX_ALERTS: 5,
  LEVELS: {
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    INFO: 'info',
  },
} as const;

// Configuración de fechas
export const DATE_CONFIG = {
  DISPLAY_FORMAT: 'dd/MM/yyyy',
  API_FORMAT: 'yyyy-MM-dd',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  TIME_FORMAT: 'HH:mm',
  LOCALE: 'es-PE',
} as const;

// Configuración de validación
export const VALIDATION_CONFIG = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  USERNAME_MIN_LENGTH: 2,
  USERNAME_MAX_LENGTH: 50,
  PRODUCT_CODE_MAX_LENGTH: 20,
  PRODUCT_NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  STOCK_MIN_VALUE: 0,
  STOCK_MAX_VALUE: 999999,
  PRECIO_MAX_VALUE: 999999.99,
} as const;

// Mensajes del sistema
export const SYSTEM_MESSAGES = {
  // Éxito
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  SAVE_SUCCESS: 'Guardado exitosamente',
  UPDATE_SUCCESS: 'Actualizado exitosamente',
  DELETE_SUCCESS: 'Eliminado exitosamente',
  
  // Errores
  LOGIN_ERROR: 'Credenciales incorrectas',
  SESSION_EXPIRED: 'Sesión expirada. Por favor, inicia sesión nuevamente',
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet',
  SERVER_ERROR: 'Error del servidor. Intenta nuevamente',
  VALIDATION_ERROR: 'Por favor, corrige los errores en el formulario',
  PERMISSION_ERROR: 'No tienes permisos para realizar esta acción',
  
  // Información
  LOADING: 'Cargando...',
  NO_DATA: 'No hay datos disponibles',
  EMPTY_SEARCH: 'No se encontraron resultados',
  CONFIRM_DELETE: '¿Estás seguro de que deseas eliminar este elemento?',
  UNSAVED_CHANGES: 'Tienes cambios sin guardar. ¿Deseas salir?',
  
  // Stock
  STOCK_LOW: 'Stock bajo',
  STOCK_CRITICAL: 'Stock crítico',
  STOCK_EMPTY: 'Sin stock',
  
} as const;

// Colores para estados y tipos
export const STATUS_COLORS = {
  // Estados generales
  ACTIVE: 'green',
  INACTIVE: 'red',
  PENDING: 'yellow',
  COMPLETED: 'blue',
  CANCELLED: 'gray',
  
  // Alertas de stock
  STOCK_OK: 'green',
  STOCK_LOW: 'yellow',
  STOCK_CRITICAL: 'red',
  STOCK_EMPTY: 'gray',
  
  // Prioridades
  PRIORITY_LOW: 'gray',
  PRIORITY_MEDIUM: 'yellow',
  PRIORITY_HIGH: 'orange',
  PRIORITY_CRITICAL: 'red',
  
  // Tipos de usuario
  USER_TYPE: {
    0: 'purple', // Superusuario
    1: 'blue',   // Jefatura
    2: 'green',  // Genera OT
    3: 'yellow', // Valida solicitudes
    4: 'orange', // Almacén
    5: 'teal',   // Realiza ingresos
  },
} as const;