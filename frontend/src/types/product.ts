import { BaseEntity, EntityStatus, BaseFilters } from './global';

/**
 * Tipos relacionados con el módulo de PRODUCTOS
 * Basado en las especificaciones del sistema
 */

// Producto completo
export interface Product extends BaseEntity {
  id_producto: number;
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto: ProductType;
  categoria_producto?: string;
  proveedor_producto?: string;
  costo_unitario?: number;
  precio_referencial?: number;
  ubicacion_fisica?: string;
  fecha_vencimiento?: string;
  lote_serie?: string;
  stock_minimo?: number;
  stock_maximo?: number;
  stock_critico?: number;
  estado_producto: EntityStatus;
  descripcion_producto?: string;
  url_foto_producto?: string;
  magnitud_producto: string; // UND por defecto
  requiere_lote?: boolean;
  dias_vida_util?: number;
}

// Tipos de producto según especificación
export type ProductType = 'insumo' | 'repuesto' | 'herramienta' | 'otro';

// Información de tipo de producto
export interface ProductTypeInfo {
  value: ProductType;
  label: string;
  description: string;
  icon: string;
}

// Datos para crear producto
export interface CreateProductData {
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto: ProductType;
  categoria_producto?: string;
  proveedor_producto?: string;
  costo_unitario?: number;
  precio_referencial?: number;
  ubicacion_fisica?: string;
  fecha_vencimiento?: string;
  lote_serie?: string;
  stock_minimo?: number;
  stock_maximo?: number;
  stock_critico?: number;
  descripcion_producto?: string;
  url_foto_producto?: string;
  magnitud_producto?: string;
  requiere_lote?: boolean;
  dias_vida_util?: number;
}

// Datos para actualizar producto
export interface UpdateProductData extends Partial<CreateProductData> {
  id_producto: number;
  estado_producto?: EntityStatus;
}

// Filtros para listado de productos
export interface ProductFilters extends BaseFilters {
  tipo_producto?: ProductType;
  categoria_producto?: string;
  proveedor_producto?: string;
  stock_bajo?: boolean; // Productos con stock menor al mínimo
  stock_critico?: boolean; // Productos con stock crítico
  proximos_vencer?: boolean; // Productos próximos a vencer
  vencidos?: boolean; // Productos vencidos
  ubicacion_fisica?: string;
  requiere_lote?: boolean;
}

// Resumen de producto para listados
export interface ProductSummary {
  id_producto: number;
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto: ProductType;
  stock_actual?: number;
  stock_disponible?: number;
  stock_reservado?: number;
  magnitud_producto: string;
  estado_producto: EntityStatus;
  alerta_stock?: 'normal' | 'bajo' | 'critico' | 'agotado';
  dias_vencimiento?: number;
}

// Datos para importación masiva desde Excel
export interface ProductImportData {
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto: string;
  categoria_producto?: string;
  proveedor_producto?: string;
  costo_unitario?: string | number;
  precio_referencial?: string | number;
  stock_minimo?: string | number;
  stock_maximo?: string | number;
  stock_critico?: string | number;
  descripcion_producto?: string;
  magnitud_producto?: string;
  ubicacion_fisica?: string;
}

// Resultado de importación
export interface ProductImportResult {
  total_rows: number;
  successful_imports: number;
  failed_imports: number;
  errors: ProductImportError[];
  imported_products: Product[];
}

// Error de importación
export interface ProductImportError {
  row: number;
  codigo_producto?: string;
  nombre_producto?: string;
  errors: string[];
}

// Validación de producto
export interface ProductValidation {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

// Historial de cambios de producto
export interface ProductHistory extends BaseEntity {
  id_producto: number;
  campo_modificado: string;
  valor_anterior: string;
  valor_nuevo: string;
  motivo?: string;
}

// Estadísticas de productos
export interface ProductStats {
  total_productos: number;
  productos_activos: number;
  productos_inactivos: number;
  por_tipo: Record<ProductType, number>;
  stock_bajo: number;
  stock_critico: number;
  productos_vencidos: number;
  productos_proximos_vencer: number;
  valor_total_inventario: number;
}

// Configuración de alertas de producto
export interface ProductAlert {
  id_producto: number;
  codigo_producto: string;
  nombre_producto: string;
  tipo_alerta: 'stock_bajo' | 'stock_critico' | 'vencimiento_proximo' | 'vencido' | 'sin_movimiento';
  mensaje: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  fecha_generada: string;
  fecha_leida?: string;
  estado: 'pendiente' | 'leida' | 'resuelta';
}

// Ubicaciones físicas
export interface PhysicalLocation {
  id: string;
  codigo: string;
  descripcion: string;
  pasillo?: string;
  estante?: string;
  nivel?: string;
  activo: boolean;
}

// Categorías de productos
export interface ProductCategory {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  activo: boolean;
}

// Proveedores
export interface Supplier {
  id: string;
  codigo: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}