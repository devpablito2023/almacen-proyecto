import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ingresosService } from "@/services/api/ingresos.service";
import type {
  Ingreso,
  IngresosListResponse,
  IngresoResponse,
  IngresoCreate,
  IngresoUpdate,
  IngresoValidate,
  IngresoBulk,
  BulkProcessResult,
  GenericSuccessResponse,
  IngresosStats,
  ProveedorReporteResponse,
} from "@/types/ingresos";

/* =========================================================
   Hook principal para el módulo de Ingresos
   ========================================================= */

export function useIngresos(filters?: Record<string, any>) {
  const queryClient = useQueryClient();

  /* ====================
     QUERIES
  ==================== */

  // Listar ingresos (con filtros/paginación)
  const listQuery = useQuery<IngresosListResponse>({
    queryKey: ["ingresos", filters],
    queryFn: () => ingresosService.list(filters as any),
  });

  // Estadísticas de ingresos (resumen)
  const statsQuery = useQuery<GenericSuccessResponse<IngresosStats>>({
    queryKey: ["ingresos", "stats", filters],
    queryFn: () => ingresosService.statsResumen(filters as any),
  });

  // Reporte por proveedor
  const reporteProveedorQuery = useQuery<ProveedorReporteResponse>({
    queryKey: ["ingresos", "reporteProveedor", filters],
    queryFn: () => ingresosService.reportePorProveedor(filters as any),
    enabled: false, // ejecutar manualmente cuando se necesite
  });

  /* ====================
     MUTATIONS
  ==================== */

  // Crear ingreso
  const createMutation = useMutation<IngresoResponse, Error, IngresoCreate>({
    mutationFn: (data) => ingresosService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ingresos"] }),
  });

  // Actualizar ingreso
  const updateMutation = useMutation<IngresoResponse, Error, { id: number; data: IngresoUpdate }>({
    mutationFn: ({ id, data }) => ingresosService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ingresos"] }),
  });

  // Validar ingreso
  const validateMutation = useMutation<IngresoResponse, Error, { id: number; data: IngresoValidate }>({
    mutationFn: ({ id, data }) => ingresosService.validate(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ingresos"] }),
  });

  // Cancelar ingreso
  const cancelMutation = useMutation<IngresoResponse, Error, { id: number; motivo: string }>({
    mutationFn: ({ id, motivo }) => ingresosService.cancel(id, motivo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ingresos"] }),
  });

  // Ingresos masivos
  const bulkMutation = useMutation<GenericSuccessResponse<BulkProcessResult>, Error, IngresoBulk>({
    mutationFn: (data) => ingresosService.bulk(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ingresos"] }),
  });

  // Upload Excel
  const uploadExcelMutation = useMutation<
    GenericSuccessResponse<{ procesados_exitosamente: number; errores: number }>,
    Error,
    File
  >({
    mutationFn: (file) => ingresosService.uploadExcel(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ingresos"] }),
  });

  return {
    /* Queries */
    list: listQuery.data?.data.ingresos ?? [],
    pagination: listQuery.data?.data.pagination,
    stats: statsQuery.data?.data ?? undefined,
    reporteProveedor: reporteProveedorQuery.data?.data,

    loading: listQuery.isLoading || statsQuery.isLoading,
    error: listQuery.error ?? statsQuery.error,

    /* Mutations */
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    validate: validateMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    bulk: bulkMutation.mutateAsync,
    uploadExcel: uploadExcelMutation.mutateAsync,

    /* Estado de mutaciones */
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isValidating: validateMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isBulk: bulkMutation.isPending,
    isUploading: uploadExcelMutation.isPending,

    /* Helpers */
    refetch: listQuery.refetch,
    refetchStats: statsQuery.refetch,
    fetchReporteProveedor: reporteProveedorQuery.refetch,
  };
}
