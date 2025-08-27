'use client';

import { ProductoStats, ProductosStatsProps } from '@/types/productos';

export default function ProductosStats({ stats }: ProductosStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total Productos */}
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

      {/* Productos Activos */}
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

      {/* Stock Bajo */}
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

      {/* Valor Inventario */}
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
  );
}
