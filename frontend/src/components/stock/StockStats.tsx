import { 
  CubeIcon, 
  ExclamationTriangleIcon, 
  BellIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

interface StockStatsProps {
  stats: {
    total_productos: number;
    productos_stock_critico: number;
    productos_stock_bajo: number;
    valor_total_inventario: number;
  };
  formatCurrency: (value: number | null) => string;
}

export default function StockStats({ stats, formatCurrency }: StockStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100">
            <CubeIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Productos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_productos}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-red-100">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Stock Crítico</p>
            <p className="text-2xl font-bold text-red-900">{stats.productos_stock_critico}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100">
            <BellIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.productos_stock_bajo}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100">
            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(stats.valor_total_inventario)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}