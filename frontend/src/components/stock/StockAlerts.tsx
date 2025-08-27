import { BellIcon } from '@heroicons/react/24/outline';
import { STOCK_ALERT_COLORS } from '@/types/stock';

interface Alert {
  tipo_alerta: string;
  producto_nombre: string;
  producto_codigo: string;
  mensaje: string;
  cantidad_actual: number;
  cantidad_limite: number;
}

interface StockAlertsProps {
  alerts: Alert[];
}

export default function StockAlerts({ alerts }: StockAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-red-600" />
          Alertas Activas ({alerts.length})
        </h2>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border ${STOCK_ALERT_COLORS[alert.tipo_alerta]}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{alert.producto_nombre} ({alert.producto_codigo})</p>
                  <p className="text-sm opacity-90">{alert.mensaje}</p>
                </div>
                <span className="text-sm font-medium">
                  {alert.cantidad_actual} / {alert.cantidad_limite}
                </span>
              </div>
            </div>
          ))}
          {alerts.length > 5 && (
            <p className="text-sm text-gray-500 text-center">
              y {alerts.length - 5} alertas más...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}