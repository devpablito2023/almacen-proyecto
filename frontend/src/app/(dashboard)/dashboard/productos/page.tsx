// src/app/(dashboard)/productos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { 
  Producto, 
  ProductoStats,
  TIPOS_PRODUCTO,
  CATEGORIAS_PRODUCTO 
} from '@/types/productos';

import {authService} from '@/lib/auth/authService';   
const cookieUser = authService.getUserInfoFromCookie();
console.log("cookieUser en productos/page.tsx:", cookieUser);
        if (cookieUser ) {
          console.log(`👤 useAuth: Usuario encontrado en cookies: ${cookieUser.nombre_usuario}`);
}

export default function ProductosPage() {
  const { user } = useAuthStore();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [stats, setStats] = useState<ProductoStats>({
  total_productos: 0,
  productos_activos: 0,
  productos_stock_bajo: 0,
  productos_stock_critico: 0,        // ← Agregado
  productos_proximos_vencer: 0,      // ← Agregado  
  productos_sin_stock: 0,            // ← Agregado
  valor_total_inventario: 0,
  por_tipo: {                        // ← Agregado
    insumo: 0,
    repuesto: 0,
    herramienta: 0,
    otro: 0
  },
  por_categoria: {}                  // ← Agregado
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Usar las constantes importadas desde types
  const tiposProducto = TIPOS_PRODUCTO;
  const categoriasProducto = CATEGORIAS_PRODUCTO;

  // Llamada a la API intermedia
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Llamar a la API intermedia para obtener productos
        const response = await fetch('/api/productos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Para incluir cookies de autenticación
        });

        if (!response.ok) {
          throw new Error('Error al obtener productosssx');
        }

        const result = await response.json();
        console.log('Respuesta de /api/productos:', result);
        
        if (result.success) {
          //setProductos(result.data.productos || []);
          setProductos(result.data.productos || []);

          setStats({
            total_productos: result.data.stats.total_productos || 0,
            productos_activos: result.data.stats.productos_activos || 0,
            productos_stock_bajo: result.data.stats.productos_stock_bajo || 0,
            productos_stock_critico: result.data.stats.productos_stock_critico || 0,        // ← Agregado
            productos_proximos_vencer: result.data.stats.productos_proximos_vencer || 0,      // ← Agregado
            productos_sin_stock: result.data.stats.productos_sin_stock || 0,            // ← Agregado
            valor_total_inventario: result.data.stats.valor_total_inventario || 0,
            por_tipo: result.data.stats.por_tipo || { insumo: 0, repuesto: 0, herramienta: 0, otro: 0 }, // ← Agregado
            por_categoria: result.data.stats.por_categoria || {}                  // ← Agregado

          });
        } else {
          throw new Error(result.message || 'Error al cargar productos');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Mostrar mensaje de error al usuario
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar productos
  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.codigo_producto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !selectedTipo || producto.tipo_producto === selectedTipo;
    const matchesCategoria = !selectedCategoria || producto.categoria_producto === selectedCategoria;
    
    return matchesSearch && matchesTipo && matchesCategoria;
  });

  // Paginación
  const totalItems = filteredProductos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProductos = filteredProductos.slice(startIndex, startIndex + itemsPerPage);

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/productos/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al exportar productos');
      }

      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'productos.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando productos:', error);
    }
  };

  const handleImportExcel = () => {
    // Crear input file para seleccionar archivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/productos/import', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error al importar productos');
        }

        const result = await response.json();
        if (result.success) {
          // Recargar la lista de productos
          window.location.reload();
        } else {
          throw new Error(result.message || 'Error al importar');
        }
      } catch (error) {
        console.error('Error importando productos:', error);
      }
    };
    input.click();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getTipoBadgeColor = (tipo: string) => {
    const tipoConfig = TIPOS_PRODUCTO.find(t => t.value === tipo);
    switch (tipo) {
      case 'insumo': return 'bg-blue-100 text-blue-800';
      case 'repuesto': return 'bg-green-100 text-green-800';
      case 'herramienta': return 'bg-purple-100 text-purple-800';
      case 'otro': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  //console.log('Usuario actual:', user);
   //console.log('Tipo de usuario:', user?.tipo_usuario)    

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos </h1>
          <p className="text-gray-600">Gestión del catálogo de productos del almacén</p>
        </div>
        <div className="flex gap-3">
          {/*(user?.tipo_usuario === 0 || user?.tipo_usuario === 5) && ( */}
        {(cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 5) && (

            <>
              <button
                onClick={handleImportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
                Importar Excel
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/productos/nuevo'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Nuevo Producto
              </button>
            </>
          )}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportar 
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_productos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.productos_activos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <div className="w-6 h-6 bg-red-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-gray-900">{stats.productos_stock_bajo}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.valor_total_inventario)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botón filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="w-5 h-5" />
            Filtros
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Producto</label>
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                {tiposProducto.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categoriasProducto.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedTipo('');
                  setSelectedCategoria('');
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Productos ({totalItems} productos)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Tabla Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Min/Max
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProductos.map((producto) => (
                  <tr key={producto.id_producto} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {producto.url_foto_producto ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={producto.url_foto_producto} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <PhotoIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{producto.nombre_producto}</div>
                          <div className="text-sm text-gray-500">{producto.categoria_producto}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.codigo_producto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoBadgeColor(producto.tipo_producto)}`}>
                        {TIPOS_PRODUCTO.find(t => t.value === producto.tipo_producto)?.label || producto.tipo_producto}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.costo_unitario ? formatCurrency(producto.costo_unitario) : 'No definido'}
                      <div className="text-xs text-gray-500">{producto.magnitud_producto}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {producto.stock_minimo} / {producto.stock_maximo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        producto.estado_producto === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {producto.estado_producto === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.location.href = `/dashboard/productos/${producto.id_producto}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {/*(user?.tipo_usuario === 0 || user?.tipo_usuario === 5) && ( */}
                        {(cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 5) && (
                          <>
                            <button
                              onClick={() => window.location.href = `/dashboard/productos/${producto.id_producto}/edit`}
                              className="text-green-600 hover:text-green-900"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {/* Implementar eliminación */}}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista Mobile */}
          <div className="md:hidden space-y-4">
            {paginatedProductos.map((producto) => (
              <div key={producto.id_producto} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 mr-3">
                      {producto.url_foto_producto ? (
                        <img className="h-12 w-12 rounded-full object-cover" src={producto.url_foto_producto} alt="" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <PhotoIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{producto.nombre_producto}</h3>
                      <p className="text-sm text-gray-500">{producto.codigo_producto}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoBadgeColor(producto.tipo_producto)}`}>
                    {TIPOS_PRODUCTO.find(t => t.value === producto.tipo_producto)?.label || producto.tipo_producto}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Costo</p>
                    <p className="text-sm font-medium">
                      {producto.costo_unitario ? formatCurrency(producto.costo_unitario) : 'No definido'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Stock Min/Max</p>
                    <p className="text-sm font-medium">{producto.stock_minimo} / {producto.stock_maximo}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    producto.estado_producto === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {producto.estado_producto === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.location.href = `/dashboard/productos/${producto.id_producto}`}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    {/*(user?.tipo_usuario === 0 || user?.tipo_usuario === 5) && ( */}
                    {(cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 5) && (
                      <>
                        <button
                          onClick={() => window.location.href = `/dashboard/productos/${producto.id_producto}/edit`}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* Implementar eliminación */}}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} de {totalItems} productos
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm border rounded ${
                      page === currentPage 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {filteredProductos.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <MagnifyingGlassIcon className="w-12 h-12" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">No se encontraron productos</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || selectedTipo || selectedCategoria 
                  ? 'Intenta ajustar los filtros de búsqueda.'
                  : 'Comienza agregando tu primer producto al sistema.'
                }
              </p>
              {/*(user?.tipo_usuario === 0 || user?.tipo_usuario === 5) && !searchTerm && !selectedTipo && !selectedCategoria && (   */}
              {(cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 5) && !searchTerm && !selectedTipo && !selectedCategoria && (

                <button
                  onClick={() => window.location.href = '/dashboard/productos/nuevo'}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Agregar Producto
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}