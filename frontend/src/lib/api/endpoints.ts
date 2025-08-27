/**
 * Definición centralizada de endpoints de la API
 * Organizada por módulos del sistema
 */

// Endpoints de Autenticación
export const authEndpoints = {
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  changePassword: '/auth/change-password',
  resetPassword: '/auth/reset-password',
  confirmResetPassword: '/auth/confirm-reset-password',
  profile: '/auth/profile',
} as const;

// Endpoints de Usuarios
export const userEndpoints = {
  list: '/usuarios',
  create: '/usuarios',
  getById: (id: number) => `/usuarios/${id}`,
  update: (id: number) => `/usuarios/${id}`,
  delete: (id: number) => `/usuarios/${id}`,
  toggleStatus: (id: number) => `/usuarios/${id}/toggle-status`,
  stats: '/usuarios/stats',
} as const;

// Endpoints de Productos
export const productEndpoints = {
  list: '/productos',
  create: '/productos',
  getById: (id: number) => `/productos/${id}`,
  update: (id: number) => `/productos/${id}`,
  delete: (id: number) => `/productos/${id}`,
  search: '/productos/search',
  import: '/productos/import',
  export: '/productos/export',
  template: '/productos/template',
  stats: '/productos/stats',
  categories: '/productos/categories',
  suppliers: '/productos/suppliers',
  locations: '/productos/locations',
} as const;

// Endpoints de Stock
export const stockEndpoints = {
  list: '/stock',
  getById: (id: number) => `/stock/${id}`,
  getByProduct: (productId: number) => `/stock/product/${productId}`,
  alerts: '/stock/alerts',
  movements: '/stock/movements',
  adjust: '/stock/adjust',
  valuation: '/stock/valuation',
  stats: '/stock/stats',
  lowStock: '/stock/low',
  criticalStock: '/stock/critical',
  expired: '/stock/expired',
  nearExpiry: '/stock/near-expiry',
} as const;

// Endpoints de Ingresos
export const ingresoEndpoints = {
  list: '/ingresos',
  create: '/ingresos',
  getById: (id: number) => `/ingresos/${id}`,
  update: (id: number) => `/ingresos/${id}`,
  validate: (id: number) => `/ingresos/${id}/validate`,
  cancel: (id: number) => `/ingresos/${id}/cancel`,
  pending: '/ingresos/pending',
  stats: '/ingresos/stats',
  byProduct: (productId: number) => `/ingresos/product/${productId}`,
} as const;

// Endpoints de Órdenes de Trabajo (OT)
export const otEndpoints = {
  list: '/ot',
  create: '/ot',
  getById: (id: number) => `/ot/${id}`,
  update: (id: number) => `/ot/${id}`,
  delete: (id: number) => `/ot/${id}`,
  close: (id: number) => `/ot/${id}/close`,
  reopen: (id: number) => `/ot/${id}/reopen`,
  stats: '/ot/stats',
  active: '/ot/active',
  overdue: '/ot/overdue',
} as const;

// Endpoints de Solicitudes
export const solicitudEndpoints = {
  list: '/solicitudes',
  create: '/solicitudes',
  getById: (id: number) => `/solicitudes/${id}`,
  update: (id: number) => `/solicitudes/${id}`,
  validate: (id: number) => `/solicitudes/${id}/validate`,
  dispatch: (id: number) => `/solicitudes/${id}/dispatch`,
  cancel: (id: number) => `/solicitudes/${id}/cancel`,
  return: (id: number) => `/solicitudes/${id}/return`,
  byOT: (otId: number) => `/solicitudes/ot/${otId}`,
  pending: '/solicitudes/pending',
  stats: '/solicitudes/stats',
  overdue: '/api/solicitudes/overdue',
} as const;

// Endpoints de Asignaciones
export const asignacionEndpoints = {
  list: '/api/asignaciones',
  getById: (id: number) => `/api/asignaciones/${id}`,
  bySolicitud: (solicitudId: number) => `/api/asignaciones/solicitud/${solicitudId}`,
  validate: (id: number) => `/api/asignaciones/${id}/validate`,
  dispatch: (id: number) => `/api/asignaciones/${id}/dispatch`,
  return: (id: number) => `/api/asignaciones/${id}/return`,
  stats: '/api/asignaciones/stats',
} as const;

// Endpoints de Kardex
export const kardexEndpoints = {
  list: '/api/kardex',
  getById: (id: number) => `/api/kardex/${id}`,
  byProduct: (productId: number) => `/api/kardex/product/${productId}`,
  byDateRange: '/api/kardex/date-range',
  byOperation: (operation: string) => `/api/kardex/operation/${operation}`,
  summary: '/api/kardex/summary',
  export: '/api/kardex/export',
} as const;

// Endpoints de Dashboard
export const dashboardEndpoints = {
  stats: '/dashboard/stats',
  activity: '/dashboard/activity',
  health: '/dashboard/health',
} as const;

// Endpoints de Reportes
export const reportEndpoints = {
  list: '/api/reportes',
  generate: '/api/reportes/generate',
  rotation: '/api/reportes/rotation',
  movements: '/api/reportes/movements',
  costs: '/api/reportes/costs',
  inventory: '/api/reportes/inventory',
  efficiency: '/api/reportes/efficiency',
  custom: '/api/reportes/custom',
  templates: '/api/reportes/templates',
  scheduled: '/api/reportes/scheduled',
} as const;

// Endpoints de Colaboradores
export const colaboradorEndpoints = {
  list: '/api/colaboradores',
  create: '/api/colaboradores',
  getById: (id: number) => `/api/colaboradores/${id}`,
  update: (id: number) => `/api/colaboradores/${id}`,
  delete: (id: number) => `/api/colaboradores/${id}`,
  search: '/api/colaboradores/search',
  stats: '/api/colaboradores/stats',
  active: '/api/colaboradores/active',
} as const;

// Endpoints de Configuración
export const configEndpoints = {
  general: '/api/config/general',
  alerts: '/api/config/alerts',
  notifications: '/api/config/notifications',
  system: '/api/config/system',
  backup: '/api/config/backup',
  restore: '/api/config/restore',
} as const;

// Endpoints de Archivos
export const fileEndpoints = {
  upload: '/api/files/upload',
  download: (filename: string) => `/api/files/download/${filename}`,
  delete: (filename: string) => `/api/files/${filename}`,
  list: '/api/files',
} as const;

// Unión de todos los endpoints
export const endpoints = {
  auth: authEndpoints,
  users: userEndpoints,
  products: productEndpoints,
  stock: stockEndpoints,
  ingresos: ingresoEndpoints,
  ot: otEndpoints,
  solicitudes: solicitudEndpoints,
  asignaciones: asignacionEndpoints,
  kardex: kardexEndpoints,
  dashboard: dashboardEndpoints,
  reports: reportEndpoints,
  colaboradores: colaboradorEndpoints,
  config: configEndpoints,
  files: fileEndpoints,
} as const;

// Tipos para endpoints
export type AuthEndpoints = typeof authEndpoints;
export type UserEndpoints = typeof userEndpoints;
export type ProductEndpoints = typeof productEndpoints;
export type StockEndpoints = typeof stockEndpoints;
export type IngresoEndpoints = typeof ingresoEndpoints;
export type OTEndpoints = typeof otEndpoints;
export type SolicitudEndpoints = typeof solicitudEndpoints;
export type AsignacionEndpoints = typeof asignacionEndpoints;
export type KardexEndpoints = typeof kardexEndpoints;
export type DashboardEndpoints = typeof dashboardEndpoints;
export type ReportEndpoints = typeof reportEndpoints;
export type ColaboradorEndpoints = typeof colaboradorEndpoints;
export type ConfigEndpoints = typeof configEndpoints;
export type FileEndpoints = typeof fileEndpoints;

export type AllEndpoints = typeof endpoints;