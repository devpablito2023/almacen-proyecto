import { MapPinIcon, ClockIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { TIPO_COLORS, STOCK_ALERT_COLORS } from "@/types/stock";

interface StockTableProps {
  stock: any[];
  formatCurrency: (val: number | null) => string;
  formatDate: (date: string) => string;
  getAlertLevel: (item: any) => string;
  getAlertText: (level: string) => string;
  canAdjust: boolean;
  onAdjust: (id: number) => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  stock, formatCurrency, formatDate, getAlertLevel, getAlertText, canAdjust, onAdjust
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
            <th className="px-6 py-3">Stock</th>
            <th className="px-6 py-3">Ubicación</th>
            <th className="px-6 py-3">Valorización</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3">Último Mov.</th>
            {canAdjust && <th className="px-6 py-3">Acciones</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stock.map((item) => {
            const alertLevel = getAlertLevel(item);
            return (
              <tr key={item.id_stock} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{item.producto_nombre}</div>
                  <div className="text-sm text-gray-500">{item.producto_codigo}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${TIPO_COLORS[item.tipo_producto] || "bg-gray-100 text-gray-800"}`}>
                    {item.tipo_producto}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div>Total: {item.cantidad_total}</div>
                  <div className="text-green-600">Disponible: {item.cantidad_disponible}</div>
                  <div className="text-orange-600">Reservado: {item.cantidad_reservada}</div>
                </td>
                <td className="px-6 py-4"><MapPinIcon className="w-4 h-4 mr-1 inline" />{item.ubicacion_fisica}</td>
                <td className="px-6 py-4">{formatCurrency(item.valor_inventario)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STOCK_ALERT_COLORS[alertLevel]}`}>
                    {getAlertText(alertLevel)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm"><ClockIcon className="w-4 h-4 mr-1 inline" />{formatDate(item.fecha_ultimo_movimiento)}</td>
                {canAdjust && (
                  <td className="px-6 py-4">
                    <button onClick={() => onAdjust(item.producto_id)} className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                      <ChartBarIcon className="w-4 h-4" /> Ajustar
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
