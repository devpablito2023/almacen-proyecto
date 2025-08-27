// src/types/productos.ts
/**
 * TIPOS PARA EL MÓDULO DE PRODUCTOS
 * 
 * Basado en las especificaciones del sistema:
 * - Productos pueden ser insumos, repuestos, herramientas u otros
 * - Control de stock mínimo, máximo y crítico
 * - Ubicaciones físicas en almacén
 * - Gestión de lotes y fechas de vencimiento
 */

export type TipoProducto = 'insumo' | 'repuesto' | 'herramienta' | 'otro';

// Estados del producto
export enum EstadoProducto {
  ELIMINADO = 0,
  ACTIVO = 1
}

// Interface principal del producto (corregida según respuesta backend)
export interface Producto {
  id_producto: number;
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto: TipoProducto;
  categoria_producto: string; // Requerido según backend
  proveedor_producto: string; // Requerido según backend
  costo_unitario: number; // Nullable según respuesta backend
  //costo_unitario: number | null; // Nullable según respuesta backend
  //precio_referencial: number | null; // Nullable según respuesta backend
  precio_referencial: number; // Nullable según respuesta backend
  ubicacion_fisica: string; // Requerido según backend
  fecha_vencimiento?: string;
  lote_serie?: string;
  stock_minimo: number;
  stock_maximo: number;
  stock_critico: number;
  estado_producto: number; // 1=activo, 0=eliminado
  descripcion_producto: string; // Requerido según backend
  //url_foto_producto: string | null; // Nullable según respuesta backend
  url_foto_producto: string ; // Nullable según respuesta backend

  magnitud_producto: string; // UND, KG, LT, etc.
  requiere_lote: boolean;
  dias_vida_util: number; // No opcional según backend
  created_at: string;
  updated_at: string | null;
  created_by: number;
  created_by_name: string;
  updated_by: number | null;
  updated_by_name: string | null;
}

// Interface para crear productos (sin campos auto-generados)
export interface ProductoCreate {
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto: TipoProducto;
  categoria_producto: string;
  proveedor_producto: string;
  costo_unitario: number;
  precio_referencial: number;
  ubicacion_fisica: string;
  fecha_vencimiento?: string;
  lote_serie?: string;
  stock_minimo: number;
  stock_maximo: number;
  stock_critico: number;
  descripcion_producto: string;
  magnitud_producto: string;
  requiere_lote: boolean;
  dias_vida_util: number;
  url_foto_producto?: string;
}

// Interface para actualizar productos (todos los campos opcionales)
export interface ProductoUpdate extends Partial<ProductoCreate> {
  estado_producto?: number;
}

// Interface para formularios (mantener la existente pero actualizada)
export interface ProductoFormData {
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto: TipoProducto;
  categoria_producto: string;
  proveedor_producto: string;
  costo_unitario: number;
  precio_referencial?: number;
  ubicacion_fisica: string;
  fecha_vencimiento?: string;
  lote_serie?: string;
  stock_minimo: number;
  stock_maximo: number;
  stock_critico: number;
  descripcion_producto?: string;
  magnitud_producto: string;
  requiere_lote: boolean;
  dias_vida_util?: number;
}

// Filtros para búsqueda
export interface ProductosFilter {
  search?: string;
  tipo_producto?: TipoProducto | '';
  categoria_producto?: string;
  proveedor_producto?: string;
  estado_producto?: number | '';
  stock_bajo?: boolean; // Filtrar productos con stock < stock_mínimo
  vencimiento_proximo?: boolean; // Productos próximos a vencer
  ubicacion_fisica?: string;
  fecha_creacion_desde?: string;
  fecha_creacion_hasta?: string;
}

// Parámetros de búsqueda avanzada
export interface ProductoSearchParams extends ProductosFilter {
  sort_by?: 'nombre_producto' | 'codigo_producto' | 'created_at' | 'costo_unitario';
  sort_order?: 'asc' | 'desc';
  include_inactive?: boolean;
  page?: number;        // ← Agregar
  limit?: number;       // ← Agregar
}




// Paginación
export interface ProductosPaginacion {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductosListResponse {
  productos: Producto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: ProductoStats;
}

// Estadísticas de productos (corregida y ampliada)
export interface ProductoStats {
  total_productos: number;
  productos_activos: number;
  productos_stock_bajo: number;
  productos_stock_critico: number;
  productos_proximos_vencer: number;
  productos_sin_stock: number;
  valor_total_inventario: number;
  por_tipo: Record<TipoProducto, number>;
  por_categoria: Record<string, number>;
}

// Respuestas de la API
export interface ProductosResponse {
  success: boolean;
  message: string;
  data: {
    productos: Producto[];
    pagination: ProductosPaginacion;
    stats: ProductoStats;
  };
  code: number;
  timestamp: string;
}

export interface ProductoResponse {
  success: boolean;
  message: string;
  data: Producto;
  code: number;
  timestamp: string;
}

// Para importación masiva desde Excel
export interface ProductoImportRow {
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto: string;
  categoria_producto?: string;
  proveedor_producto?: string;
  costo_unitario?: number;
  precio_referencial?: number;
  ubicacion_fisica?: string;
  stock_minimo?: number;
  stock_maximo?: number;
  stock_critico?: number;
  descripcion_producto?: string;
  magnitud_producto?: string;
  requiere_lote?: string; // 'SI' | 'NO' en Excel
  dias_vida_util?: number;
}

export interface ImportResult {
  total_procesados: number;
  exitosos: number;
  errores: number;
  productos_creados: Producto[];
  errores_detalle: Array<{
    fila: number;
    errores: string[];
    datos: ProductoImportRow;
  }>;
}

export interface ImportResponse {
  success: boolean;
  message: string;
  data: ImportResult;
  code: number;
  timestamp: string;
}

// Para validaciones
export interface ProductoValidation {
  field: string;
  message: string;
  value?: any;
}

export interface ProductoValidationResult {
  isValid: boolean;
  errors: ProductoValidation[];
}

// Tipo de retorno para el hook useProductos
export interface UseProductosReturn {
  productos: Producto[];
  loading: boolean;
  error: string | null;
  pagination: ProductosPaginacion;
  stats: ProductoStats;
  // Funciones CRUD
  fetchProductos: (filters?: ProductosFilter) => Promise<void>;
  fetchProducto: (id: number) => Promise<Producto | null>;
  createProducto: (data: ProductoCreate) => Promise<Producto>;
  updateProducto: (id: number, data: ProductoUpdate) => Promise<Producto>;
  deleteProducto: (id: number) => Promise<void>;
  restoreProducto: (id: number) => Promise<void>;
  // Funciones especiales
  exportProductos: () => Promise<void>;
  importProductos: (file: File) => Promise<ImportResult>;
  refreshProductos: () => void;
  clearError: () => void;
}

// Tipo de retorno para el hook useProducto (individual)
export interface UseProductoReturn {
  producto: Producto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

// ==========================================
// CONFIGURACIONES Y CONSTANTES
// ==========================================

// Tipos de producto
export const TIPOS_PRODUCTO: { value: TipoProducto; label: string }[] = [
  { value: 'insumo', label: 'Insumo' },
  { value: 'repuesto', label: 'Repuesto' },
  { value: 'herramienta', label: 'Herramienta' },
  { value: 'otro', label: 'Otro' }
];

// Magnitudes de producto
export const MAGNITUDES_PRODUCTO = [
  { value: 'UND', label: 'Unidad' },
  { value: 'KG', label: 'Kilogramos' },
  { value: 'LT', label: 'Litros' },
  { value: 'MT', label: 'Metros' },
  { value: 'M2', label: 'Metros cuadrados' },
  { value: 'M3', label: 'Metros cúbicos' },
  { value: 'GAL', label: 'Galones' },
  { value: 'LB', label: 'Libras' },
  { value: 'TON', label: 'Toneladas' },
  { value: 'CAJA', label: 'Cajas' },
  { value: 'PAQUETE', label: 'Paquetes' },
  { value: 'PAR', label: 'Pares' },
  { value: 'JUEGO', label: 'Juegos' },
  { value: 'ROLLO', label: 'Rollos' }
];

// Categorías de producto
export const CATEGORIAS_PRODUCTO = [
  'Materiales de Construcción',
  'Herramientas Manuales',
  'Herramientas Eléctricas',
  'Equipos de Seguridad',
  'Productos Químicos',
  'Lubricantes',
  'Filtros',
  'Repuestos Mecánicos',
  'Repuestos Eléctricos',
  'Suministros de Oficina',
  'Equipos de Cómputo',
  'Otros'
];

// Estados para selectores
export const ESTADOS_PRODUCTO = [
  { value: 1, label: 'Activo', color: 'green' },
  { value: 0, label: 'Inactivo', color: 'red' }
];

// Opciones para ordenamiento
export const ORDEN_OPCIONES = [
  { value: 'nombre_producto', label: 'Nombre' },
  { value: 'codigo_producto', label: 'Código' },
  { value: 'created_at', label: 'Fecha de creación' },
  { value: 'costo_unitario', label: 'Costo unitario' },
  { value: 'stock_minimo', label: 'Stock mínimo' }
];

// Configuración para alertas de stock
export const STOCK_ALERTS = {
  CRITICO: 'crítico',
  BAJO: 'bajo',
  NORMAL: 'normal',
  ALTO: 'alto'
} as const;

export type StockAlertLevel = typeof STOCK_ALERTS[keyof typeof STOCK_ALERTS];

// Colores para badges de tipo
export const TIPO_COLORS: Record<TipoProducto, string> = {
  'insumo': 'bg-blue-100 text-blue-800',
  'repuesto': 'bg-green-100 text-green-800',
  'herramienta': 'bg-purple-100 text-purple-800',
  'otro': 'bg-orange-100 text-orange-800'
};

// Colores para alertas de stock
export const STOCK_ALERT_COLORS: Record<StockAlertLevel, string> = {
  'crítico': 'bg-red-100 text-red-800 border-red-200',
  'bajo': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'normal': 'bg-green-100 text-green-800 border-green-200',
  'alto': 'bg-blue-100 text-blue-800 border-blue-200'
};

// Configuración para validaciones
export const PRODUCTO_VALIDATIONS = {
  CODIGO_PATTERN: /^[A-Z0-9-_]{3,20}$/,
  NOMBRE_MIN_LENGTH: 3,
  NOMBRE_MAX_LENGTH: 100,
  STOCK_MIN_VALUE: 0,
  COSTO_MIN_VALUE: 0,
  DESCRIPCION_MAX_LENGTH: 500
};

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  CODIGO_REQUIRED: 'El código del producto es requerido',
  CODIGO_INVALID: 'El código debe contener solo letras mayúsculas, números, guiones y guiones bajos',
  NOMBRE_REQUIRED: 'El nombre del producto es requerido',
  NOMBRE_TOO_SHORT: 'El nombre debe tener al menos 3 caracteres',
  NOMBRE_TOO_LONG: 'El nombre no puede exceder 100 caracteres',
  TIPO_REQUIRED: 'El tipo de producto es requerido',
  CATEGORIA_REQUIRED: 'La categoría es requerida',
  PROVEEDOR_REQUIRED: 'El proveedor es requerido',
  UBICACION_REQUIRED: 'La ubicación física es requerida',
  STOCK_MINIMO_INVALID: 'El stock mínimo debe ser mayor o igual a 0',
  STOCK_MAXIMO_INVALID: 'El stock máximo debe ser mayor al stock mínimo',
  COSTO_INVALID: 'El costo unitario debe ser mayor a 0'
};

// Templates para Excel
export const EXCEL_HEADERS = [
  'codigo_producto',
  'nombre_producto', 
  'tipo_producto',
  'categoria_producto',
  'proveedor_producto',
  'costo_unitario',
  'precio_referencial',
  'ubicacion_fisica',
  'stock_minimo',
  'stock_maximo', 
  'stock_critico',
  'descripcion_producto',
  'magnitud_producto',
  'requiere_lote',
  'dias_vida_util'
];

export const EXCEL_HEADER_LABELS: Record<string, string> = {
  'codigo_producto': 'Código',
  'nombre_producto': 'Nombre',
  'tipo_producto': 'Tipo',
  'categoria_producto': 'Categoría',
  'proveedor_producto': 'Proveedor',
  'costo_unitario': 'Costo Unitario',
  'precio_referencial': 'Precio Referencial',
  'ubicacion_fisica': 'Ubicación',
  'stock_minimo': 'Stock Mínimo',
  'stock_maximo': 'Stock Máximo',
  'stock_critico': 'Stock Crítico',
  'descripcion_producto': 'Descripción',
  'magnitud_producto': 'Unidad',
  'requiere_lote': 'Requiere Lote (SI/NO)',
  'dias_vida_util': 'Días Vida Útil'
};

// ==========================================
// INTERFACES DE COMPONENTES
// ==========================================

// Props para componentes principales
export interface ProductosHeaderProps {
  onExport: () => void;
  onImport: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  canCreate: boolean;
}

export interface ProductosStatsProps {
  stats: ProductoStats;
}

export interface ProductosFiltersProps {
  show: boolean;
  searchTerm: string;
  selectedTipo: string;
  selectedCategoria: string;
  onFiltersChange: (filters: {
    search?: string;
    tipo_producto?: string;
    categoria_producto?: string;
  }) => void;
}

export interface ProductosTableProps {
  productos: Producto[];
  pagination: any;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onDelete: (id: number) => void;
  canEdit: boolean;
  canDelete: boolean;
}

// Props para componentes de detalle
export interface ProductoDetailProps {
  productId: number;
}

export interface ProductoInfoProps {
  producto: Producto;
}

export interface ProductoActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ProductoDeleteModalProps {
  show: boolean;
  producto: Producto;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Props para componentes de creación/edición
export interface ProductoCreateProps {
  onSuccess?: (producto: Producto) => void;
  onCancel?: () => void;
}

export interface ProductoEditProps {
  productId: number;
  onSuccess?: (producto: Producto) => void;
  onCancel?: () => void;
}

export interface ProductoFormProps {
  initialData?: Partial<ProductoFormData>;
  onSubmit: (data: ProductoFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
}