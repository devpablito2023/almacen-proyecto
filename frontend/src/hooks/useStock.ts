// src/hooks/useStock.ts
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { 
  Stock,
  StockFilter,
  StockPaginacion,
  StockStats,
  StockAlert,
  StockResponse,
  StockAjuste,
  StockAjusteResponse,
  UseStockReturn
} from '@/types/stock';

export function useStock(filters?: StockFilter): UseStockReturn {
  const [stock, setStock] = useState<Stock[]>([]);
  const [stats, setStats] = useState<StockStats>({
    total_productos: 0,
    productos_con_stock: 0,
    productos_stock_bajo: 0,
    productos_stock_critico: 0,
    productos_sin_stock: 0,
    valor_total_inventario: 0,
    productos_con_movimiento_hoy: 0,
    productos_vencimiento_proximo: 0,
    rotacion_promedio: 0
  });
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [pagination, setPagination] = useState<StockPaginacion>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Función para obtener stock
  const fetchStock = async (customFilters?: StockFilter) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const allFilters = { ...filters, ...customFilters };

      // Agregar filtros a los parámetros
      if (allFilters.search) params.append('search', allFilters.search);
      if (allFilters.tipo_producto) params.append('tipo_producto', allFilters.tipo_producto);
      if (allFilters.categoria_producto) params.append('categoria_producto', allFilters.categoria_producto);
      if (allFilters.ubicacion_fisica) params.append('ubicacion_fisica', allFilters.ubicacion_fisica);
      if (allFilters.nivel_alerta) params.append('nivel_alerta', allFilters.nivel_alerta);
      if (allFilters.con_stock !== undefined) params.append('con_stock', String(allFilters.con_stock));
      if (allFilters.sin_movimiento_dias) params.append('sin_movimiento_dias', String(allFilters.sin_movimiento_dias));
      if (allFilters.fecha_desde) params.append('fecha_desde', allFilters.fecha_desde);
      if (allFilters.fecha_hasta) params.append('fecha_hasta', allFilters.fecha_hasta);

      const response = await fetch(`/api/stock?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      console.log("Response from /api/stock:", response);
      //console.log(response)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: StockResponse = await response.json();

      if (result.success) {
        // Actualizar estados con los datos recibidos
        console.log("data received:", result.data);

        console.log("Stock data received:", result.data.stock);
        setStock(result.data.stock || []);
        setStats(result.data.stats);
        setPagination(result.data.pagination);
        setAlerts(result.data.alerts || []);
      } else {
        throw new Error(result.message || 'Error al obtener stock');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching stock:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar stock
  const exportStock = async (customFilters?: StockFilter) => {
    if (!isAuthenticated) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const params = new URLSearchParams();
      const allFilters = { ...filters, ...customFilters };

      // Agregar filtros para exportación
      if (allFilters.search) params.append('search', allFilters.search);
      if (allFilters.tipo_producto) params.append('tipo_producto', allFilters.tipo_producto);
      if (allFilters.categoria_producto) params.append('categoria_producto', allFilters.categoria_producto);
      if (allFilters.ubicacion_fisica) params.append('ubicacion_fisica', allFilters.ubicacion_fisica);
      if (allFilters.nivel_alerta) params.append('nivel_alerta', allFilters.nivel_alerta);
      if (allFilters.con_stock !== undefined) params.append('con_stock', String(allFilters.con_stock));
      if (allFilters.fecha_desde) params.append('fecha_desde', allFilters.fecha_desde);
      if (allFilters.fecha_hasta) params.append('fecha_hasta', allFilters.fecha_hasta);

      const response = await fetch(`/api/stock/export?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `stock_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error exporting stock:', errorMessage);
      throw err;
    }
  };

  // Función para ajustar stock
  const adjustStock = async (ajuste: StockAjuste) => {
    if (!isAuthenticated) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(ajuste),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result: StockAjusteResponse = await response.json();

      if (result.success) {
        // Actualizar el stock local después del ajuste
        await fetchStock();
        return result.data;
      } else {
        throw new Error(result.message || 'Error al ajustar stock');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error adjusting stock:', errorMessage);
      throw err;
    }
  };

  // Efecto para cargar stock inicialmente
  useEffect(() => {
    console.log("useStock: casi isAuthenticated es true, llamando a fetchStock");
    console.log("autenticacion:", isAuthenticated);
    if (isAuthenticated) {
     console.log("useStock: isAuthenticated es true, llamando a fetchStock");
      fetchStock();
    }
  }, [
    isAuthenticated, 
    filters?.search, 
    filters?.tipo_producto, 
    filters?.categoria_producto,
    filters?.nivel_alerta,
    filters?.con_stock
  ]);

  // Función para refrescar datos
  const refreshStock = () => {
    fetchStock();
  };

  return {
    // Estados
    stock,
    loading,
    error,
    pagination,
    stats,
    alerts,

    // Funciones
    fetchStock,
    exportStock,
    adjustStock,
    refreshStock,

    // Utilidades
    clearError: () => setError(null),
  };
}

export default useStock;