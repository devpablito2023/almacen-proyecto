import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockService } from '@/services/api/stock.service';
import type { 
  StockResponse, 
  StockAjuste, 
  StockAjusteResponse, 
  StockExportResponse 
} from "@/types/stock";
  
export function useStock(filters?: Record<string, any>) {
  const queryClient = useQueryClient();

  // ✅ useQuery tipado con StockResponse
  const stockQuery = useQuery<StockResponse>({
    queryKey: ["stock", filters],
    queryFn: () => stockService.getAll(filters),
    staleTime: 5 * 60 * 1000, // cache 5 min
  });

  // ✅ Mutación tipada para ajustes
  const adjustMutation = useMutation<StockAjusteResponse, Error, StockAjuste>({
    mutationFn: (ajuste) => stockService.adjust(ajuste),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });

  return {
    // Datos de la API (con fallback por si todavía no cargan)
    stock: stockQuery.data?.data.stock ?? [],
    pagination: stockQuery.data?.data.pagination,
    stats: stockQuery.data?.data.stats ??{total_productos:0,productos_con_stock:0,productos_stock_bajo:0,productos_stock_critico:0,productos_sin_stock:0,valor_total_inventario:0,productos_con_movimiento_hoy:0,productos_vencimiento_proximo:0,rotacion_promedio:0},
    alerts: stockQuery.data?.data.alerts ?? [],

    // Estado
    loading: stockQuery.isLoading,
    error: stockQuery.error as Error | null,

    // Acciones
    adjust: adjustMutation.mutateAsync,
    exportStock: (f?: Record<string, any>) => stockService.export(f),

    // Helpers
    refetch: stockQuery.refetch,
  };
}