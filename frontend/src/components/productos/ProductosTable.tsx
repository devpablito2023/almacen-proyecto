'use client';

import { 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Producto, TIPOS_PRODUCTO, ProductosTableProps } from '@/types/productos';
import { Button } from '../commons';

export default function ProductosTable({
  productos,
  pagination,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onDelete,
  canEdit,
  canDelete
}: ProductosTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'insumo': return 'bg-blue-100 text-blue-800';
      case 'repuesto': return 'bg-green-100 text-green-800';
      case 'herramienta': return 'bg-purple-100 text-purple-800';
      case 'otro': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalItems = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header de la tabla */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Lista de Productos ({totalItems})
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Mostrando {startIndex}-{endIndex} de {totalItems} productos
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vista Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo/Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Costo/Magnitud
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
            {productos.map((producto) => (
              <tr key={producto.id_producto} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {producto.url_foto_producto ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={producto.url_foto_producto} 
                          alt={producto.nombre_producto}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <PhotoIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {producto.nombre_producto}
                      </div>
                      <div className="text-sm text-gray-500">
                        {producto.codigo_producto}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoBadgeColor(producto.tipo_producto)}`}>
                    {TIPOS_PRODUCTO.find(t => t.value === producto.tipo_producto)?.label || producto.tipo_producto}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{producto.categoria_producto}</div>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/productos/${producto.id_producto}`}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Ver detalles"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/dashboard/productos/${producto.id_producto}/edit`}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Editar producto"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(producto.id_producto)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Eliminar producto"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile */}
      <div className="md:hidden space-y-4 p-4">
        {productos.map((producto) => (
          <div key={producto.id_producto} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 mr-3">
                  {producto.url_foto_producto ? (
                    <img 
                      className="h-12 w-12 rounded-full object-cover" 
                      src={producto.url_foto_producto} 
                      alt={producto.nombre_producto}
                    />
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = `/dashboard/productos/${producto.id_producto}`}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                  title="Ver detalles"
                >
                  <EyeIcon className="w-4 h-4" />
                </Button>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = `/dashboard/productos/${producto.id_producto}/edit`}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                    title="Editar producto"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(producto.id_producto)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                    title="Eliminar producto"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Página anterior"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </Button>
              
              {/* Números de página */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, currentPage - 2) + i;
                if (page > totalPages) return null;
                
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Página siguiente"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
