// src/services/api/ingresos.service.ts
import { BaseService } from "../base.service";

import type {
  Ingreso,
  IngresoCreate,
  IngresoUpdate,
  IngresoValidate,
  IngresoBulk,
  IngresoResponse,
  IngresosListResponse,
  IngresosStats,
  IngresoQueryParams,
  ProveedorReporteResponse,
  GenericSuccessResponse,
  BulkProcessResult,
} from "@/types/ingresos";
/* ==============================
   Servicio de Ingresos (API intermedia)
   ============================== */
export class IngresosService extends BaseService {
  constructor() {
    // 👉 apuntas a /api/ingresos (intermedia)
    super("ingresos");
  }

  /** GET "/" → listar con filtros/paginación */
  list(params?: IngresoQueryParams) {
    return this.get<IngresosListResponse>("", params);
  }

  /** GET "/{id}" → obtener por ID */
  getById(ingresoId: number) {
    return this.get<IngresoResponse>(`/${ingresoId}`);
  }

  /** POST "/" → crear ingreso */
  create(data: IngresoCreate) {
    return this.post<IngresoResponse>("", data);
  }

  /** PUT "/{id}" → actualizar (solo no validados) */
  update(ingresoId: number, data: IngresoUpdate) {
    return this.put<IngresoResponse>(`/${ingresoId}`, data);
  }

  /** POST "/{id}/validar" → validar ingreso (actualiza stock y kardex) */
  validate(ingresoId: number, data: IngresoValidate) {
    return this.post<IngresoResponse>(`/${ingresoId}/validar`, data);
  }

  /** POST "/{id}/cancelar" → cancelar ingreso (FormData: motivo) */
  cancel(ingresoId: number, motivo: string) {
    const form = new FormData();
    form.append("motivo", motivo);
    return this.post<IngresoResponse>(`/${ingresoId}/cancelar`, form);
  }

  /** POST "/masivo" → creación masiva */
  bulk(data: IngresoBulk) {
    return this.post<GenericSuccessResponse<BulkProcessResult>>("/masivo", data);
  }

  /** POST "/excel" → subir Excel (UploadFile) */
  uploadExcel(file: File) {
    const form = new FormData();
    form.append("file", file);
    return this.post<GenericSuccessResponse<{ procesados_exitosamente: number; errores: number }>>(
      "/excel",
      form
    );
  }

  /** GET "/pendientes/validacion" → pendientes de validación */
  pendientes(limit = 50) {
    return this.get<GenericSuccessResponse<Ingreso[]>>("/pendientes/validacion", { limit });
  }

  /** GET "/estadisticas/resumen" → stats período */
  statsResumen(params?: { fecha_inicio?: string; fecha_fin?: string }) {
    return this.get<GenericSuccessResponse<IngresosStats>>("/estadisticas/resumen", params);
  }

  /** POST "/estadisticas/actualizar" → recalcular y cachear stats */
  statsActualizar() {
    return this.post<GenericSuccessResponse>("/estadisticas/actualizar");
  }

  /** GET "/template/excel" → descarga template Excel */
  async downloadTemplateExcel(): Promise<{ blob: Blob; filename: string }> {
    const blob = await this.download("/template/excel");
    // Si tu API intermedia expone Content-Disposition con filename,
    // puedes leerlo allí. Aquí dejamos un nombre por defecto:
    return { blob, filename: "template_ingresos.xlsx" };
  }

  /** GET "/reportes/proveedor" → reporte agrupado por proveedor */
  reportePorProveedor(params?: { fecha_inicio?: string; fecha_fin?: string; top?: number }) {
    return this.get<ProveedorReporteResponse>("/reportes/proveedor", params);
  }
}

export const ingresosService = new IngresosService();
