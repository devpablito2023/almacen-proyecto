'use client';

import { 
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { ProductosHeaderProps } from '@/types/productos';

export default function ProductosHeader({
  onExport,
  onImport,
  onToggleFilters,
  showFilters,
  canCreate
}: ProductosHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <p className="text-gray-600">Gestión del catálogo de productos del almacén</p>
      </div>
      
      <div className="flex gap-3">
        {/* Botón de filtros */}
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters 
              ? 'bg-blue-50 text-blue-700 border-blue-200' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FunnelIcon className="w-5 h-5" />
          Filtros
        </button>

        {/* Botones para usuarios autorizados */}
        {canCreate && (
          <>
            <button
              onClick={onImport}
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

        {/* Botón exportar (siempre visible) */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Exportar
        </button>
      </div>
    </div>
  );
}
