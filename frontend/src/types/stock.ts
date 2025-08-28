// src/types/stock.ts
/**
 * TIPOS PARA EL MÓDULO DE STOCK
 * 
 * Basado en las especificaciones del sistema:
 * - Control de stock disponible vs reservado
 * - Alertas automáticas por niveles críticos
 * - Valorización de inventario
 * - Ubicaciones físicas y lotes
 */

// Interface principal del stock
export interface Stock {
  id_stock: number;
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  tipo_producto: string;
  categoria_producto: string;
  cantidad_disponible: number;
  cantidad_reservada: number;
  cantidad_total: number;
  ubicacion_fisica: string;
  lote_serie?: string;
  fecha_vencimiento?: string;
  costo_promedio: number | null;
  valor_inventario: number | null;
  stock_minimo: number;
  stock_maximo: number;
  stock_critico: number;
  magnitud_producto: string;
  fecha_ultimo_movimiento: string;
  estado_stock: number;
  alerta_generada: boolean;
  created_at: string;
  updated_at?: string;
  created_by: number;
  updated_by?: number;
}

// Filtros para consulta de stock
export interface StockFilter {
  search?: string;
  tipo_producto?: string;
  categoria_producto?: string;
  ubicacion_fisica?: string;
  nivel_alerta?: 'critico' | 'bajo' | 'normal' | 'sin_stock';
  con_stock?: boolean;
  sin_movimiento_dias?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Parámetros de búsqueda con paginación
export interface StockSearchParams extends StockFilter {
  page?: number;
  limit?: number;
  sort_by?: 'producto_nombre' | 'cantidad_total' | 'valor_inventario' | 'fecha_ultimo_movimiento';
  sort_order?: 'asc' | 'desc';
}

// Paginación para stock
export interface StockPaginacion {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Estadísticas del stock
export interface StockStats {
  total_productos: number;
  productos_con_stock: number;
  productos_stock_bajo: number;
  productos_stock_critico: number;
  productos_sin_stock: number;
  valor_total_inventario: number;
  productos_con_movimiento_hoy: number;
  productos_vencimiento_proximo: number;
  rotacion_promedio: number;
}

// Alertas de stock
export interface StockAlert {
  id: number;
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  tipo_alerta: 'critico' | 'bajo' | 'sin_stock' | 'vencimiento' | 'sin_movimiento';
  nivel_gravedad: 'alta' | 'media' | 'baja';
  cantidad_actual: number;
  cantidad_limite: number;
  dias_sin_movimiento?: number;
  fecha_vencimiento?: string;
  mensaje: string;
  fecha_generacion: string;
  estado_alerta: 'activa' | 'resuelta' | 'ignorada';
}

// Respuesta de la API para listado de stock
export interface StockResponse {
  success: boolean;
  message: string;
  data: {
    stock: Stock[];
    pagination: StockPaginacion;
    stats: StockStats;
    alerts: StockAlert[];
  };
  code: number;
  timestamp: string;
}

// Respuesta para exportación
export interface StockExportResponse {
  success: boolean;
  message: string;
  data?: {
    file_url: string;
    file_name: string;
    records_count: number;
  };
  code: number;
  timestamp: string;
}

// Para ajustes de stock
export interface StockAjuste {
  producto_id: number;
  tipo_ajuste: 'positivo' | 'negativo';
  cantidad_ajuste: number;
  motivo: string;
  observaciones?: string;
  ubicacion_fisica?: string;
  lote_serie?: string;
}

export interface StockAjusteResponse {
  success: boolean;
  message: string;
  data?: {
    ajuste_id: number;
    stock_anterior: number;
    stock_actual: number;
    movimiento_kardex_id: number;
  };
  code: number;
  timestamp: string;
}

// Tipo de retorno para el hook useStock
export interface UseStockReturn {
  stock: Stock[];
  loading: boolean;
  error: string | null;
  pagination: StockPaginacion;
  stats: StockStats;
  alerts: StockAlert[];
  // Funciones
  fetchStock: (filters?: StockFilter) => Promise<void>;
  exportStock: (filters?: StockFilter) => Promise<void>;
  adjustStock: (ajuste: StockAjuste) => Promise<{
    ajuste_id: number;
    stock_anterior: number;
    stock_actual: number;
    movimiento_kardex_id: number;
  } | undefined>;
  refreshStock: () => void;
  clearError: () => void;
}

// ==========================================
// CONSTANTES Y CONFIGURACIONES
// ==========================================

// Tipos de alerta
export const TIPOS_ALERTA = [
  { value: 'critico', label: 'Stock Crítico', color: 'red' },
  { value: 'bajo', label: 'Stock Bajo', color: 'yellow' },
  { value: 'sin_stock', label: 'Sin Stock', color: 'gray' },
  { value: 'vencimiento', label: 'Próximo a Vencer', color: 'orange' },
  { value: 'sin_movimiento', label: 'Sin Movimiento', color: 'blue' }
];

// Niveles de stock para filtros
export const NIVELES_STOCK = [
  { value: 'critico', label: 'Stock Crítico' },
  { value: 'bajo', label: 'Stock Bajo' },
  { value: 'normal', label: 'Stock Normal' },
  { value: 'sin_stock', label: 'Sin Stock' }
];

// Opciones de ordenamiento
export const STOCK_SORT_OPTIONS = [
  { value: 'producto_nombre', label: 'Nombre del Producto' },
  { value: 'cantidad_total', label: 'Cantidad Total' },
  { value: 'valor_inventario', label: 'Valor de Inventario' },
  { value: 'fecha_ultimo_movimiento', label: 'Último Movimiento' }
];

// Colores para alertas de stock
export const STOCK_ALERT_COLORS: Record<string, string> = {
  'critico': 'bg-red-100 text-red-800 border-red-200',
  'bajo': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'sin_stock': 'bg-gray-100 text-gray-800 border-gray-200',
  'vencimiento': 'bg-orange-100 text-orange-800 border-orange-200',
  'sin_movimiento': 'bg-blue-100 text-blue-800 border-blue-200',
  'normal': 'bg-green-100 text-green-800 border-green-200'
};

// Configuración de alertas automáticas
export const ALERT_CONFIG = {
  DIAS_VENCIMIENTO_ALERTA: 30,
  DIAS_SIN_MOVIMIENTO_ALERTA: 90,
  PORCENTAJE_STOCK_BAJO: 80,
  REFRESH_INTERVAL_MS: 300000 // 5 minutos
};

// Headers para exportación Excel
export const STOCK_EXPORT_HEADERS = [
  'codigo_producto',
  'nombre_producto',
  'tipo_producto',
  'categoria_producto',
  'cantidad_disponible',
  'cantidad_reservada',
  'cantidad_total',
  'stock_minimo',
  'stock_maximo',
  'stock_critico',
  'ubicacion_fisica',
  'costo_promedio',
  'valor_inventario',
  'ultimo_movimiento'
];

export const STOCK_EXPORT_LABELS: Record<string, string> = {
  'codigo_producto': 'Código',
  'nombre_producto': 'Producto',
  'tipo_producto': 'Tipo',
  'categoria_producto': 'Categoría',
  'cantidad_disponible': 'Stock Disponible',
  'cantidad_reservada': 'Stock Reservado',
  'cantidad_total': 'Stock Total',
  'stock_minimo': 'Stock Mínimo',
  'stock_maximo': 'Stock Máximo',
  'stock_critico': 'Stock Crítico',
  'ubicacion_fisica': 'Ubicación',
  'costo_promedio': 'Costo Promedio',
  'valor_inventario': 'Valor Inventario',
  'ultimo_movimiento': 'Último Movimiento'
};

export const TIPO_COLORS: Record<string, string> = {
  'insumo': 'bg-blue-100 text-blue-800',
  'repuesto': 'bg-green-100 text-green-800',
  'herramienta': 'bg-purple-100 text-purple-800',
  'otro': 'bg-gray-100 text-gray-800'
};