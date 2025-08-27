import { MapPinIcon, ClockIcon, ChartBarIcon, CubeIcon } from '@heroicons/react/24/outline';
import { TIPO_COLORS } from '@/types/productos';
import { STOCK_ALERT_COLORS } from '@/types/stock';

interface StockItem {
  id_stock: number;
  producto_id: number;
  producto_nombre: string;
  producto_codigo: string;
  tipo_producto: string;
  cantidad_total: number;
  cantidad_disponible: number;
  cantidad_reservada: number;
  magnitud_producto: string;
  stock_minimo: number;
  stock_maximo: number;
  stock_critico: number;
  ubicacion_fisica: string;
  valor_inventario: number;
  costo_promedio: number | null;
  fecha_ultimo_movimiento: string | null;
}

interface StockTableProps {
  stock: StockItem[];
  canAdjustStock: boolean;
  formatCurrency: (value: number | null) => string;
  formatDate: (dateString: string | null | undefined) => string;
  onAdjustStock: (productId: number) => void;
}

export default function StockTable({
  stock,
  canAdjustStock,
  formatCurrency,
  formatDate,
  onAdjustStock
}: StockTableProps) {
  const getAlertLevel = (item: StockItem) => {
    if (item.cantidad_total === 0) return 'sin_stock';
    if (item.cantidad_total <= item.stock_critico) return 'critico';
    if (item.cantidad_total <= item.stock_minimo) return 'bajo';
    return 'normal';
  };

  const getAlertText = (level: string) => {
    switch (level) {
      case 'sin_stock': return 'Sin Stock';
      case 'critico': return 'Stock Crítico';
      case 'bajo': return 'Stock Bajo';
      default: return 'Stock Normal';
    }
  };

  if (stock.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="text-center py-12">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No se encontraron productos</h3>
            <p className="mt-2 text-sm text-gray-500">
              Intenta ajustar los filtros de búsqueda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Inventario Actual ({stock.length} productos)
        </h2>

        {/* Tabla Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valorización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Mov.
                </th>
                {canAdjustStock && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stock.map((item) => {
                const alertLevel = getAlertLevel(item);
                return (
                  <tr key={item.id_stock} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.producto_nombre}</div>
                          <div className="text-sm text-gray-500">{item.producto_codigo}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${TIPO_COLORS[item.tipo_producto as keyof typeof TIPO_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                            {item.tipo_producto}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-semibold">Total: {item.cantidad_total} {item.magnitud_producto}</div>
                        <div className="text-green-600">Disponible: {item.cantidad_disponible}</div>
                        <div className="text-orange-600">Reservado: {item.cantidad_reservada}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Min: {item.stock_minimo} | Max: {item.stock_maximo} | Crítico: {item.stock_critico}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPinIcon className="w-4 h-4 text-gray-400 mr-1" />
                        {item.ubicacion_fisica}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-semibold">{formatCurrency(item.valor_inventario)}</div>
                        <div className="text-gray-500">
                          {item.costo_promedio ? `@ ${formatCurrency(item.costo_promedio)}` : 'Sin costo'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${STOCK_ALERT_COLORS[alertLevel]}`}>
                        {getAlertText(alertLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatDate(item.fecha_ultimo_movimiento)}
                      </div>
                    </td>
                    {canAdjustStock && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onAdjustStock(item.producto_id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <ChartBarIcon className="w-4 h-4" />
                            Ajustar
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vista Mobile */}
        <div className="md:hidden space-y-4">
          {stock.map((item) => {
            const alertLevel = getAlertLevel(item);
            return (
              <div key={item.id_stock} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{item.producto_nombre}</h3>
                    <p className="text-sm text-gray-500">{item.producto_codigo}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${TIPO_COLORS[item.tipo_producto as keyof typeof TIPO_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                    {item.tipo_producto}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Stock Total</p>
                    <p className="text-sm font-medium">{item.cantidad_total} {item.magnitud_producto}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valorización</p>
                    <p className="text-sm font-medium">{formatCurrency(item.valor_inventario)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STOCK_ALERT_COLORS[alertLevel]}`}>
                    {getAlertText(alertLevel)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{formatDate(item.fecha_ultimo_movimiento)}</span>
                    {canAdjustStock && (
                      <button
                        onClick={() => onAdjustStock(item.producto_id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}