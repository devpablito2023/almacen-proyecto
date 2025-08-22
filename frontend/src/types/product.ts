// src/types/product.ts

/**
 * TIPOS PARA EL MÓDULO DE PRODUCTOS
 * Basados en la documentación del MODULO PRODUCTOS
 */

// Tipos de producto según documentación
export type ProductType = 'insumo' | 'repuesto' | 'herramienta' | 'otro';

// Producto completo del sistema
export interface Product {
  id_producto: number;
  codigo_producto: string; // único
  nombre_producto: string;
  tipo_producto: ProductType;
  categoria_producto: string;
  proveedor_producto?: string;
  costo_unitario: number;
  precio_referencial?: number;
  ubicacion_fisica?: string;
  fecha_vencimiento?: string; // ISO date string
  lote_serie?: string;
  stock_minimo: number;
  stock_maximo: number;
  stock_critico: number;
  estado_producto: number; // 1=activo, 0=eliminado
  descripcion_producto?: string;
  url_foto_producto?: string;
  magnitud_producto: string; // UND por defecto
  requiere_lote: boolean;
  dias_vida_util?: number;
  created_at: string;
  updated_at?: string;
  created_by: number;
  created_by_name: string;
  updated_by?: number;
  updated_by_name?: string;
}

// Datos para crear/editar producto
export interface ProductFormData {
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto: ProductType;
  categoria_producto: string;
  descripcion_producto?: string;
  stock_minimo: number;
  stock_maximo: number;
  stock_critico: number;
  magnitud_producto: string;
  costo_unitario: number;
  ubicacion_fisica?: string;
  requiere_lote?: boolean;
}

// Filtros para búsqueda de productos
export interface ProductFilters {
  search?: string;
  tipo_producto?: ProductType | '';
  categoria_producto?: string;
  estado_producto?: number | null;
  stock_bajo?: boolean; // productos con stock < stock_minimo
  stock_critico?: boolean; // productos con stock < stock_critico
  page?: number;
  limit?: number;
  sort_by?: 'nombre_producto' | 'codigo_producto' | 'created_at' | 'stock_minimo';
  sort_order?: 'asc' | 'desc';
}

// Producto para importación Excel
export interface ProductImport {
  codigo_producto: string;
  nombre_producto: string;
  tipo_producto: string;
  categoria_producto: string;
  stock_minimo: string | number;
  stock_maximo: string | number;
  stock_critico: string | number;
  magnitud_producto?: string;
  descripcion_producto?: string;
  costo_unitario?: string | number;
}

// Resultado de importación
export interface ImportResult {
  success: number;
  errors: number;
  warnings: number;
  details: {
    row: number;
    error: string;
    data: ProductImport;
  }[];
}

// Categorías de productos
export interface ProductCategory {
  nombre: string;
  descripcion?: string;
  productos_count: number;
}

// Estadísticas de productos
export interface ProductStats {
  total_productos: number;
  productos_activos: number;
  productos_inactivos: number;
  por_tipo: Record<ProductType, number>;
  por_categoria: Record<string, number>;
  productos_stock_bajo: number;
  productos_stock_critico: number;
}