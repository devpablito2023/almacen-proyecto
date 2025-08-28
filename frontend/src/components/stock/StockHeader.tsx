import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Button } from '../commons';

interface StockHeaderProps {
  onExport: () => void;
  onRefresh: () => void;
}

export default function StockHeader({ onExport, onRefresh }: StockHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Control de Stock</h1>
        <p className="text-gray-600">Monitoreo y gestión del inventario en tiempo real</p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          leftIcon={<ArrowDownTrayIcon className="w-5 h-5" />}
        >
          Exportar
        </Button>
        <Button
          variant="primary"
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          leftIcon={<ArrowDownTrayIcon className="w-5 h-5 transform rotate-180" />}
        >
          Actualizar
        </Button>
      </div>
    </div>
  );
}