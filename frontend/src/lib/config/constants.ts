// Tipos de Usuario según especificación
export const USER_TYPES = {
  SUPERUSER: 0,
  JEFATURA: 1,
  GENERA_OT: 2,
  VALIDA_SOLICITUDES: 3,
  ALMACEN_DESPACHO: 4,
  REALIZA_INGRESOS: 5,
} as const;

export const USER_TYPE_LABELS = {
  [USER_TYPES.SUPERUSER]: 'Superusuario',
  [USER_TYPES.JEFATURA]: 'Jefatura',
  [USER_TYPES.GENERA_OT]: 'Genera OT',
  [USER_TYPES.VALIDA_SOLICITUDES]: 'Valida Solicitudes',
  [USER_TYPES.ALMACEN_DESPACHO]: 'Almacén/Despacho',
  [USER_TYPES.REALIZA_INGRESOS]: 'Realiza Ingresos',
} as const;

// Estados de Productos
export const PRODUCT_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
} as const;

// Tipos de Productos
export const PRODUCT_TYPES = {
  INSUMO: 'insumo',
  REPUESTO: 'repuesto',
  HERRAMIENTA: 'herramienta',
  OTRO: 'otro',
} as const;

export const PRODUCT_TYPE_LABELS = {
  [PRODUCT_TYPES.INSUMO]: 'Insumo',
  [PRODUCT_TYPES.REPUESTO]: 'Repuesto',
  [PRODUCT_TYPES.HERRAMIENTA]: 'Herramienta',
  [PRODUCT_TYPES.OTRO]: 'Otro',
} as const;

// Estados de Ingreso
export const INGRESO_CONDITIONS = {
  CANCELADO: 0,
  CREADO: 1,
  VALIDADO: 2,
  CANTIDAD_MODIFICADA: 3,
} as const;

export const INGRESO_CONDITION_LABELS = {
  [INGRESO_CONDITIONS.CANCELADO]: 'Cancelado',
  [INGRESO_CONDITIONS.CREADO]: 'Creado',
  [INGRESO_CONDITIONS.VALIDADO]: 'Validado',
  [INGRESO_CONDITIONS.CANTIDAD_MODIFICADA]: 'Cantidad Modificada',
} as const;

// Estados de Solicitud
export const SOLICITUD_CONDITIONS = {
  CANCELADA: 0,
  SOLICITADA: 1,
  ASIGNADA: 2,
  DESPACHADA: 3,
} as const;

export const SOLICITUD_CONDITION_LABELS = {
  [SOLICITUD_CONDITIONS.CANCELADA]: 'Cancelada',
  [SOLICITUD_CONDITIONS.SOLICITADA]: 'Solicitada',
  [SOLICITUD_CONDITIONS.ASIGNADA]: 'Asignada',
  [SOLICITUD_CONDITIONS.DESPACHADA]: 'Despachada',
} as const;

// Estados de Asignación
export const ASIGNACION_CONDITIONS = {
  SOLICITADO: 1,
  VALIDADO: 2,
  DESPACHO_PARCIAL: 3,
  DESPACHO_TOTAL: 4,
  REAPERTURA: 5,
} as const;

export const ASIGNACION_CONDITION_LABELS = {
  [ASIGNACION_CONDITIONS.SOLICITADO]: 'Solicitado',
  [ASIGNACION_CONDITIONS.VALIDADO]: 'Validado',
  [ASIGNACION_CONDITIONS.DESPACHO_PARCIAL]: 'Despacho Parcial',
  [ASIGNACION_CONDITIONS.DESPACHO_TOTAL]: 'Despacho Total',
  [ASIGNACION_CONDITIONS.REAPERTURA]: 'Reapertura',
} as const;

// Operaciones del Kardex
export const KARDEX_OPERATIONS = {
  INGRESO: 'INGRESO',
  SALIDA: 'SALIDA',
  DEVOLUCION: 'DEVOLUCION',
  AJUSTE_POSITIVO: 'AJUSTE_POSITIVO',
  AJUSTE_NEGATIVO: 'AJUSTE_NEGATIVO',
} as const;

// Estados de Devolución
export const DEVOLUCION_STATUS = {
  INACTIVO: 0,
  ACTIVO: 1,
  PARCIAL: 2,
  TOTAL: 3,
} as const;

export const DEVOLUCION_STATUS_LABELS = {
  [DEVOLUCION_STATUS.INACTIVO]: 'Inactivo',
  [DEVOLUCION_STATUS.ACTIVO]: 'Activo',
  [DEVOLUCION_STATUS.PARCIAL]: 'Devolución Parcial',
  [DEVOLUCION_STATUS.TOTAL]: 'Devolución Total',
} as const;

// Navegación por tipo de usuario
export const USER_MENU_ACCESS = {
  [USER_TYPES.SUPERUSER]: [
    'dashboard',
    'productos',
    'stock',
    'usuarios',
    'ingresos',
    'ot',
    'solicitudes',
    'reportes',
    'configuracion',
  ],
  [USER_TYPES.JEFATURA]: [
    'dashboard',
    'productos',
    'stock',
    'reportes',
  ],
  [USER_TYPES.GENERA_OT]: [
    'dashboard',
    'productos',
    'stock',
    'ot',
    'solicitudes',
  ],
  [USER_TYPES.VALIDA_SOLICITUDES]: [
    'dashboard',
    'productos',
    'stock',
    'solicitudes',
  ],
  [USER_TYPES.ALMACEN_DESPACHO]: [
    'dashboard',
    'productos',
    'stock',
    'solicitudes',
  ],
  [USER_TYPES.REALIZA_INGRESOS]: [
    'dashboard',
    'productos',
    'stock',
    'ingresos',
  ],
} as const;

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXCEL_TYPES: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
} as const;

// Rutas de navegación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PRODUCTOS: '/productos',
  STOCK: '/stock',
  USUARIOS: '/usuarios',
  INGRESOS: '/ingresos',
  OT: '/ot',
  SOLICITUDES: '/solicitudes',
  REPORTES: '/reportes',
  CONFIGURACION: '/configuracion',
} as const;

// Íconos para menú de navegación
export const MENU_ICONS = {
  dashboard: 'ChartBarIcon',
  productos: 'CubeIcon',
  stock: 'BuildingStorefrontIcon',
  usuarios: 'UsersIcon',
  ingresos: 'ArrowDownTrayIcon',
  ot: 'ClipboardDocumentListIcon',
  solicitudes: 'DocumentTextIcon',
  reportes: 'ChartPieIcon',
  configuracion: 'CogIcon',
} as const;

// Configuración de colores para estados
export const STATUS_COLORS = {
  // Estados generales
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  
  // Estados de solicitud
  CANCELADA: 'danger',
  SOLICITADA: 'warning',
  ASIGNADA: 'info',
  DESPACHADA: 'success',
  
  // Estados de ingreso
  CREADO: 'info',
  VALIDADO: 'success',
  CANTIDAD_MODIFICADA: 'warning',
  CANCELADO: 'danger',
  
  // Alertas de stock
  NORMAL: 'success',
  BAJO: 'warning',
  CRITICO: 'danger',
  AGOTADO: 'danger',
} as const;

// Configuración de toasts/notificaciones
export const TOAST_CONFIG = {
  DURATION: 5000,
  POSITION: 'top-right',
  MAX_TOASTS: 3,
} as const;

// Configuración de tabla
export const TABLE_CONFIG = {
  DEFAULT_SORT: 'created_at',
  DEFAULT_ORDER: 'desc',
  EMPTY_MESSAGE: 'No hay datos disponibles',
  LOADING_MESSAGE: 'Cargando...',
} as const;

// Configuración de validaciones
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 500,
  MAX_NAME_LENGTH: 100,
  MAX_CODE_LENGTH: 20,
  MIN_CODE_LENGTH: 3,
} as const;

// Formatos de fecha
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  INPUT: 'YYYY-MM-DD',
  INPUT_WITH_TIME: 'YYYY-MM-DDTHH:mm',
  API: 'YYYY-MM-DD HH:mm:ss',
} as const;

// Configuración de cache
export const CACHE_CONFIG = {
  USER_DATA: 'user_data',
  PRODUCTS: 'products_cache',
  STOCK: 'stock_cache',
  DURATION: 5 * 60 * 1000, // 5 minutos
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // Users
  USERS: '/usuarios',
  USER_BY_ID: (id: number) => `/usuarios/${id}`,
  
  // Products
  PRODUCTS: '/productos',
  PRODUCT_BY_ID: (id: number) => `/productos/${id}`,
  PRODUCTS_IMPORT: '/productos/import',
  PRODUCTS_EXPORT: '/productos/export',
  
  // Stock
  STOCK: '/stock',
  STOCK_ALERTS: '/stock/alerts',
  STOCK_MOVEMENTS: '/stock/movements',
  
  // Ingresos
  INGRESOS: '/ingresos',
  INGRESO_BY_ID: (id: number) => `/ingresos/${id}`,
  
  // OT
  OT: '/ot',
  OT_BY_ID: (id: number) => `/ot/${id}`,
  
  // Solicitudes
  SOLICITUDES: '/solicitudes',
  SOLICITUD_BY_ID: (id: number) => `/solicitudes/${id}`,
  
  // Dashboard
  DASHBOARD_METRICS: '/dashboard/metrics',
  DASHBOARD_CHARTS: '/dashboard/charts',
  
  // Reports
  REPORTS: '/reportes',
} as const;

// Métodos HTTP
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Mensajes del sistema
export const SYSTEM_MESSAGES = {
  SUCCESS: {
    CREATE: 'Registro creado exitosamente',
    UPDATE: 'Registro actualizado exitosamente',
    DELETE: 'Registro eliminado exitosamente',
    LOGIN: 'Inicio de sesión exitoso',
    LOGOUT: 'Sesión cerrada exitosamente',
    IMPORT: 'Importación completada exitosamente',
    EXPORT: 'Exportación completada exitosamente',
  },
  ERROR: {
    GENERIC: 'Ha ocurrido un error inesperado',
    NETWORK: 'Error de conexión. Verifique su conexión a internet',
    UNAUTHORIZED: 'No tiene permisos para realizar esta acción',
    NOT_FOUND: 'El registro solicitado no existe',
    VALIDATION: 'Por favor, corrija los errores en el formulario',
    SERVER: 'Error interno del servidor. Intente nuevamente más tarde',
  },
  CONFIRM: {
    DELETE: '¿Está seguro de que desea eliminar este registro?',
    LOGOUT: '¿Está seguro de que desea cerrar sesión?',
    CANCEL: '¿Está seguro de que desea cancelar? Los cambios no guardados se perderán',
  },
} as const;

// Configuración de gráficos
export const CHART_CONFIG = {
  COLORS: [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#F97316', // orange-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
  ],
  HEIGHT: {
    SMALL: 200,
    MEDIUM: 300,
    LARGE: 400,
  },
} as const;