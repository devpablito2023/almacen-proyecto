// src/types/stock.ts

/**
 * TIPOS PARA EL MÓDULO DE STOCK
 * Basados en la documentación del MODULO STOCK y KARDEX
 */

// Stock de un producto
export interface Stock {
  id_stock: number;
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  cantidad_disponible: number;
  cantidad_reservada: number;
  cantidad_total: number; // disponible + reservada
  ubicacion_fisica: string;
  lote_serie?: string;
  fecha_vencimiento?: string;
  costo_promedio: number;
  valor_inventario: number; // cantidad_total * costo_promedio
  fecha_ultimo_movimiento: string;
  estado_stock: number; // 1=activo, 0=eliminado
  alerta_generada: boolean;
  created_at: string;
  updated_at?: string;
  created_by: number;
  updated_by?: number;
}

// Alerta de stock
export interface StockAlert {
  id_alerta: number;
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  tipo_alerta: 'stock_bajo' | 'stock_critico' | 'vencido' | 'vence_pronto';
  nivel_severidad: 'low' | 'medium' | 'high' | 'critical';
  cantidad_actual: number;
  cantidad_referencia: number; // mínimo o crítico
  mensaje: string;
  fecha_alerta: string;
  estado_alerta: 'activa' | 'resuelta' | 'ignorada';
  resuelto_por?: number;
  fecha_resolucion?: string;
}

// Movimiento de kardex
export interface KardexMovement {
  id_kardex: number;
  numero_movimiento: string; // único autogenerado
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  lote_serie?: string;
  ubicacion: string;
  operacion_kardex: 'INGRESO' | 'SALIDA' | 'DEVOLUCION' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO' | 'TRANSFERENCIA';
  tipo_movimiento: 'COMPRA' | 'DESPACHO' | 'DEVOLUCION' | 'AJUSTE' | 'TRANSFERENCIA';
  documento_referencia: string;
  numero_documento: string;
  cantidad_anterior: number;
  cantidad_movimiento: number;
  cantidad_actual: number;
  costo_unitario: number;
  costo_total: number;
  motivo_movimiento: string;
  solicitud_id?: number;
  ot_numero?: string;
  ingreso_id?: number;
  estado_kardex: number;
  fecha_movimiento: string;
  realizado_por: number;
  realizado_por_name: string;
  autorizado_por?: number;
  autorizado_por_name?: string;
  created_at: string;
  created_by: number;
  created_by_name: string;
}

// Filtros para movimientos de kardex
export interface KardexFilters {
  producto_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  operacion_kardex?: KardexMovement['operacion_kardex'];
  tipo_movimiento?: KardexMovement['tipo_movimiento'];
  realizado_por?: number;
  page?: number;
  limit?: number;
}

// Ajuste de stock manual
export interface StockAdjustment {
  producto_id: number;
  cantidad_ajuste: number; // positivo o negativo
  motivo_ajuste: string;
  tipo_ajuste: 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';
  ubicacion?: string;
  lote_serie?: string;
  documento_referencia?: string;
}

// Estadísticas de stock
export interface StockStats {
  valor_total_inventario: number;
  productos_stock_bajo: number;
  productos_stock_critico: number;
  productos_sin_stock: number;
  productos_vencidos: number;
  productos_vencen_30_dias: number;
  movimientos_hoy: number;
  valor_movimientos_hoy: number;
}

// Valorización de inventario
export interface InventoryValuation {
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  cantidad_stock: number;
  costo_unitario: number;
  valor_total: number;
  categoria: string;
  ubicacion: string;
  fecha_ultimo_movimiento: string;
}