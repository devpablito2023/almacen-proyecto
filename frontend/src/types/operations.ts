// src/types/operations.ts

/**
 * TIPOS PARA OPERACIONES (OT, SOLICITUDES, ASIGNACIONES)
 * Basados en los módulos OT, SOLICITUD, ASIGNACIONES de la documentación
 */

// Orden de Trabajo
export interface OrdenTrabajo {
  id_ot: number;
  numero_ot: string; // único obligatorio
  trabajo_ot: string;
  descripcion_ot?: string;
  prioridad_ot: 'baja' | 'media' | 'alta' | 'critica';
  tipo_trabajo: 'mantenimiento' | 'proyecto' | 'emergencia';
  supervisado_ot: string;
  lugar_trabajo_ot: string;
  solicitado_ot: string;
  ejecutado_ot: string;
  cliente_ot: string;
  codigo_equipo_ot?: string;
  equipo_ot?: string;
  serie_equipo_ot?: string;
  fecha_inicio_programada: string;
  fecha_fin_programada: string;
  fecha_inicio_real?: string;
  fecha_fin_real?: string;
  estado_ot: 0 | 1 | 2 | 3 | 4; // 0=cancelada, 1=creada, 2=en_proceso, 3=pausada, 4=finalizada
  porcentaje_avance: number; // 0-100
  costo_estimado: number;
  costo_real?: number;
  created_at: string;
  updated_at?: string;
  created_by: number;
  created_by_name: string;
  updated_by?: number;
  updated_by_name?: string;
}

// Solicitud vinculada a OT
export interface Solicitud {
  id_solicitud: number;
  numero_solicitud: string; // único autogenerado
  ot_numero: string;
  ot_id: number;
  descripcion_solicitud?: string;
  justificacion_solicitud?: string;
  urgencia_solicitud: 'normal' | 'urgente' | 'critica';
  condicion_solicitud: 0 | 1 | 2 | 3 | 4; // 0=cancelada, 1=solicitada, 2=asignada, 3=despachada, 4=finalizada
  devolucion_solicitud: 0 | 1 | 2; // 0=inactiva, 1=activa, 2=realizada
  cantidad_solicitud: number;
  validado_solicitud: number;
  despachado_solicitud: number;
  devolucion_solicitud_cantidad?: number;
  nombre_solicitud: string; // "solicitud n dia/mes/año"
  fecha_requerida: string;
  solicitado_por: number;
  solicitado_por_name: string;
  validado_por?: number;
  validado_por_name?: string;
  despachado_por?: number;
  despachado_por_name?: string;
  fecha_validacion?: string;
  fecha_despacho?: string;
  observaciones_validacion?: string;
  observaciones_despacho?: string;
  created_at: string;
  updated_at?: string;
  created_by: number;
  created_by_name: string;
  updated_by?: number;
  updated_by_name?: string;
}

// Asignación (relación muchos a muchos Solicitud-Producto)
export interface Asignacion {
  id_asignacion: number;
  solicitud_id: number;
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  lote_serie?: string;
  ubicacion_origen: string;
  condicion_asignacion: 1 | 2 | 3 | 4 | 5; // 1=solicitado, 2=validado, 3=despacho_parcial, 4=despacho_total, 5=reapertura
  cantidad_solicitada: number;
  cantidad_validada: number;
  cantidad_despachada: number;
  cantidad_devuelta?: number;
  costo_unitario: number;
  costo_total: number;
  estado_devolucion: 0 | 1 | 2 | 3; // 0=inactivo, 1=activo, 2=devolucion_parcial, 3=devolucion_total
  motivo_devolucion?: string;
  url_despacho_asignacion?: string;
  url_devolucion_asignacion?: string;
  fecha_validacion?: string;
  fecha_despacho?: string;
  fecha_devolucion?: string;
  validado_por?: number;
  validado_por_name?: string;
  despachado_por?: number;
  despachado_por_name?: string;
  observaciones?: string;
  created_at: string;
  updated_at?: string;
  created_by: number;
  created_by_name: string;
  updated_by?: number;
  updated_by_name?: string;
}

// Datos para crear OT
export interface OTFormData {
  numero_ot: string;
  trabajo_ot: string;
  descripcion_ot?: string;
  prioridad_ot: OrdenTrabajo['prioridad_ot'];
  tipo_trabajo: OrdenTrabajo['tipo_trabajo'];
  fecha_inicio_programada: string;
  fecha_fin_programada: string;
  costo_estimado: number;
  supervisado_ot?: string;
  lugar_trabajo_ot?: string;
  solicitado_ot?: string;
  ejecutado_ot?: string;
  cliente_ot?: string;
  codigo_equipo_ot?: string;
  equipo_ot?: string;
  serie_equipo_ot?: string;
}

// Datos para crear solicitud
export interface SolicitudFormData {
  ot_id: number;
  descripcion_solicitud?: string;
  justificacion_solicitud?: string;
  urgencia_solicitud: Solicitud['urgencia_solicitud'];
  fecha_requerida: string;
  productos: {
    producto_id: number;
    cantidad_solicitada: number;
  }[];
}