
// src/hooks/useProductos.ts
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { 
  Producto, 
  ProductoCreate, 
  ProductoUpdate, 
  ProductoStats,
  ProductosFilter,
  ProductosPaginacion,
  ProductosResponse,
  ProductoResponse,
  ImportResult,
  UseProductosReturn,
  ProductoSearchParams,
  UseProductoReturn
} from '@/types/productos';

export function useProductos(filters?: ProductosFilter): UseProductosReturn {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [stats, setStats] = useState<ProductoStats>({
    total_productos: 0,
    productos_activos: 0,
    productos_stock_bajo: 0,
    productos_stock_critico: 0,
    productos_proximos_vencer: 0,
    productos_sin_stock: 0,
    valor_total_inventario: 0,
    por_tipo: {
      insumo: 0,
      repuesto: 0,
      herramienta: 0,
      otro: 0
    },
    por_categoria: {}
  });
  const [pagination, setPagination] = useState<ProductosPaginacion>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Función para obtener productos
  //const fetchProductos = async (customFilters?: ProductosFilter) => {
  const fetchProductos = async (customFilters?: ProductoSearchParams) => {

    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const allFilters = { ...filters, ...customFilters };

      if (allFilters.search) params.append('search', allFilters.search);
      if (allFilters.tipo_producto) params.append('tipo', allFilters.tipo_producto);
      if (allFilters.categoria_producto) params.append('categoria', allFilters.categoria_producto);
      if (allFilters.page) params.append('page', allFilters.page.toString());
      if (allFilters.limit) params.append('limit', allFilters.limit.toString());

      const response = await fetch(`/api/productos?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      console.log("response:", response);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      //console.log("response ok");
      //console.log(response);

      const result: ProductosResponse = await response.json();

      if (result.success) {
        setProductos(result.data.productos || []);
        setStats(result.data.stats);
        setPagination(result.data.pagination);
      } else {
        throw new Error(result.message || 'Error al obtener productos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching productos:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener un producto por ID
  const fetchProducto = async (id: number): Promise<Producto | null> => {
    if (!isAuthenticated) return null;

    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: ProductoResponse = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Error al obtener producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error fetching producto:', errorMessage);
      throw err;
    }
  };

  // Función para crear producto
  const createProducto = async (productoData: ProductoCreate): Promise<Producto> => {
    if (!isAuthenticated) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result: ProductoResponse = await response.json();

      if (result.success) {
        // Actualizar la lista local
        await fetchProductos();
        return result.data;
      } else {
        throw new Error(result.message || 'Error al crear producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error creating producto:', errorMessage);
      throw err;
    }
  };

  // Función para actualizar producto
  const updateProducto = async (id: number, productoData: ProductoUpdate): Promise<Producto> => {
    if (!isAuthenticated) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result: ProductoResponse = await response.json();

      if (result.success) {
        // Actualizar la lista local
        setProductos(prevProductos =>
          prevProductos.map(p =>
            p.id_producto === id ? result.data : p
          )
        );
        return result.data;
      } else {
        throw new Error(result.message || 'Error al actualizar producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error updating producto:', errorMessage);
      throw err;
    }
  };

  // Función para eliminar producto
  const deleteProducto = async (id: number): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result: { success: boolean; message: string } = await response.json();

      if (result.success) {
        // Remover de la lista local
        setProductos(prevProductos =>
          prevProductos.filter(p => p.id_producto !== id)
        );
        // Actualizar estadísticas
        setStats(prevStats => ({
          ...prevStats,
          total_productos: prevStats.total_productos - 1,
          productos_activos: prevStats.productos_activos - 1
        }));
      } else {
        throw new Error(result.message || 'Error al eliminar producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error deleting producto:', errorMessage);
      throw err;
    }
  };

  // Función para restablecer producto
  const restoreProducto = async (id: number): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await fetch(`/api/productos/${id}/restore`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result: { success: boolean; message: string } = await response.json();

      if (result.success) {
        // Actualizar el producto en la lista local
        setProductos(prevProductos =>
          prevProductos.map(p => 
            p.id_producto === id 
              ? { ...p, estado_producto: 1 } 
              : p
          )
        );
        // Actualizar estadísticas
        setStats(prevStats => ({
          ...prevStats,
          productos_activos: prevStats.productos_activos + 1
        }));
      } else {
        throw new Error(result.message || 'Error al restablecer producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error restoring producto:', errorMessage);
      throw err;
    }
  };

  // Función para exportar productos
  const exportProductos = async (customFilters?: ProductosFilter): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const params = new URLSearchParams();
      const allFilters = { ...filters, ...customFilters };

      // Agregar filtros para exportación (usando los parámetros que acepta el backend)
      // El backend acepta: estado y tipo
      if (allFilters.tipo_producto) params.append('tipo', allFilters.tipo_producto);
      if (allFilters.estado_producto !== undefined) params.append('estado', String(allFilters.estado_producto));

      console.log('DEBUG PRODUCTOS EXPORT - URL params:', params.toString());
      console.log('DEBUG PRODUCTOS EXPORT - allFilters:', allFilters);

      const response = await fetch(`/api/productos/export?${params}`, {
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
      a.download = `productos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error exporting productos:', errorMessage);
      throw err;
    }
  };

  // Función para importar productos
  const importProductos = async (file: File): Promise<any> => {
    if (!isAuthenticated) {
      throw new Error('Usuario no autenticado');
    }

    // Validaciones de archivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls)');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Tamaño máximo: 10MB');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/productos/import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result: { success: boolean; message: string; data: ImportResult } = await response.json();

      if (result.success) {
        // Actualizar la lista de productos después de la importación
        await fetchProductos();
        return result.data;
      } else {
        throw new Error(result.message || 'Error al importar productos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error importing productos:', errorMessage);
      throw err;
    }
  };

  // Efecto para cargar productos inicialmente
  useEffect(() => {
        console.log("useProductos: casi isAuthenticated es true, llamando a fetchProductos");
        console.log("autenticacion:", isAuthenticated);
    if (isAuthenticated) {
      fetchProductos();
    }
  }, [isAuthenticated, filters?.search, filters?.tipo_producto, filters?.categoria_producto]);

  // Función para refrescar datos
  const refreshProductos = () => {
    fetchProductos();
  };

  return {
    // Estados
    productos,
    stats,
    pagination,
    loading,
    error,

    // Funciones
    fetchProductos,
    fetchProducto,
    createProducto,
    updateProducto,
    deleteProducto,
    restoreProducto,
    exportProductos,
    importProductos,
    refreshProductos,

    // Utilidades
    clearError: () => setError(null),
  };
}

// Hook específico para un producto individual
export function useProducto(id: number): UseProductoReturn {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchProducto = async () => {
    if (!isAuthenticated || !id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result: ProductoResponse = await response.json();

      if (result.success) {
        setProducto(result.data);
      } else {
        throw new Error(result.message || 'Error al obtener producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching producto:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchProducto();
    }
  }, [isAuthenticated, id]);

  return {
    producto,
    loading,
    error,
    refetch: fetchProducto,
    clearError: () => setError(null),
  };
}

export default useProductos;