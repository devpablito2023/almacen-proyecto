/* =========================================================
   Tipos locales (puedes moverlos a src/types/ingresos.ts)
   ========================================================= */

export type IngresoEstado = 0 | 1 | 2 | 3; // 0=Cancelado, 1=Creado, 2=Validado, 3=Modificado

export interface IngresoItem {
  id_item?: number;
  producto_id: number;
  producto_codigo?: string;
  producto_nombre?: string;
  cantidad_solicitada?: number;
  cantidad_recibida?: number;
  cantidad_validada?: number;
  costo_unitario?: number;
  subtotal?: number;
  lote_serie?: string;
  fecha_vencimiento?: string; // ISO
  ubicacion?: string;         // asignada/final
  observaciones?: string;
}

export interface Ingreso {
  id_ingreso: number;
  codigo?: string;
  fecha?: string; // ISO
  proveedor?: string;
  condicion_ingreso: IngresoEstado;
  costo_total?: number;
  observaciones?: string;
  items?: IngresoItem[];
  created_at?: string;
  updated_at?: string;
  creado_por?: number | string;
  validado_por?: number | string;
}

/** Filtros del GET "/" */
export interface IngresoQueryParams {
  producto_id?: number;
  proveedor?: string;
  fecha_inicio?: string; // YYYY-MM-DD
  fecha_fin?: string;    // YYYY-MM-DD
  condicion_ingreso?: IngresoEstado;
  pendiente_validacion?: boolean;
  page?: number;   // default 1
  limit?: number;  // default 20, max 100
}

/** Respuesta paginada genérica */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Respuestas API (alineadas a success_response / paginated_response) */
export interface IngresosListResponse {
  success: boolean;
  message: string;
  data: {
    ingresos: Ingreso[];     // lista
    pagination: Pagination;  // paginación
    stats?: IngresosStats;   // opcional (si lo agregas en tu intermedia)
  };
  code: number;
  timestamp: string;
}

export interface IngresoResponse {
  success: boolean;
  message: string;
  data: Ingreso;
  code: number;
  timestamp: string;
}

export interface IngresosStats {
  total_ingresos: number;
  total_validado: number;
  total_cancelado: number;
  costo_total_periodo: number;
  // agrega aquí otros campos que devuelva tu backend
}

export interface IngresoCreate {
  producto_id: number;
  proveedor_ingreso: string;
  cantidad_solicitada: number;
  cantidad_recibida: number;
  costo_unitario: number;
  factura_ingreso?: string;
  lote_serie?: string;
  fecha_vencimiento?: string; // YYYY-MM-DD
  ubicacion_asignada?: string;
  observaciones?: string;
}

export interface IngresoUpdate {
  // Solo campos editables en tu backend (parcial)
  proveedor_ingreso?: string;
  cantidad_solicitada?: number;
  cantidad_recibida?: number;
  costo_unitario?: number;
  factura_ingreso?: string;
  lote_serie?: string;
  fecha_vencimiento?: string;
  ubicacion_asignada?: string;
  observaciones?: string;
}

export interface IngresoValidate {
  cantidad_validada: number;
  ubicacion_final: string;
  observaciones_validacion?: string;
}

export interface IngresoBulk {
  ingresos: IngresoCreate[]; // máx. 1000
}

export interface BulkProcessResult {
  exitosos: number;
  errores: number;
  detalles?: Array<{
    index: number; // índice del ingreso en la lista
    error?: string;
    id_ingreso?: number;
    codigo?: string;
  }>;
}

export interface GenericSuccessResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  code: number;
  timestamp: string;
}

export interface ProveedorReporteItem {
  proveedor: string;
  total_ingresos: number;
  cantidad_total: number;
  valor_total: number;
  ingresos_validados: number;
  ingresos_pendientes: number;
  productos_distintos: number;
  ultimo_ingreso: string; // ISO datetime
  valor_promedio: number;
}

export interface ProveedorReporteTotales {
  total_proveedores: number;
  suma_ingresos: number;
  suma_cantidad: number;
  suma_valor: number;
  periodo_inicio: string; // YYYY-MM-DD
  periodo_fin: string;    // YYYY-MM-DD
}

export interface ProveedorReporteResponse {
  success: boolean;
  message: string;
  data: {
    reporte_por_proveedor: ProveedorReporteItem[];
    totales: ProveedorReporteTotales;
    parametros: {
      fecha_inicio: string;
      fecha_fin: string;
      top_proveedores: number;
    };
  };
  code: number;
  timestamp: string;
}
