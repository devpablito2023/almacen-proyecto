import { 
  PhotoIcon,
  MapPinIcon,
  CubeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  Producto,
  TIPOS_PRODUCTO,
  TIPO_COLORS,
  MAGNITUDES_PRODUCTO,
  ProductoInfoProps
} from '@/types/productos';

// Funciones utilitarias
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStockStatusColor = (stockCritico: number, stockMinimo: number) => {
  if (stockCritico <= 0) return 'text-red-600 bg-red-50';
  if (stockCritico <= stockMinimo) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
};

const getStockStatusIcon = (stockCritico: number, stockMinimo: number) => {
  if (stockCritico <= 0) return ExclamationTriangleIcon;
  if (stockCritico <= stockMinimo) return ClockIcon;
  return CheckCircleIcon;
};

const getStockStatusText = (stockCritico: number, stockMinimo: number) => {
  if (stockCritico <= 0) return 'Sin stock';
  if (stockCritico <= stockMinimo) return 'Stock bajo';
  return 'Stock disponible';
};

export default function ProductoInfo({ producto }: ProductoInfoProps) {
  const StockIcon = getStockStatusIcon(producto.stock_critico, producto.stock_minimo);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Información principal */}
      <div className="lg:col-span-2 space-y-6">
        {/* Datos básicos */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CubeIcon className="w-5 h-5" />
            Información del Producto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                {producto.codigo_producto}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Producto
              </label>
              <div className="flex items-center gap-2">
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    TIPO_COLORS[producto.tipo_producto]
                  }`}
                >
                  {TIPOS_PRODUCTO.find(t => t.value === producto.tipo_producto)?.label || 'Desconocido'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magnitud
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                {MAGNITUDES_PRODUCTO.find(m => m.value === producto.magnitud_producto)?.label || producto.magnitud_producto}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-gray-500" />
                {producto.ubicacion_fisica || 'No especificada'}
              </p>
            </div>
          </div>
          
          {producto.descripcion_producto && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                {producto.descripcion_producto}
              </p>
            </div>
          )}
        </div>

        {/* Precios */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5" />
            Información de Precios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo Unitario
              </label>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(producto.costo_unitario)}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Referencial
              </label>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(producto.precio_referencial)}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Margen de ganancia:</span>
              <span className="text-sm font-semibold text-purple-600">
                {((producto.precio_referencial - producto.costo_unitario) / producto.costo_unitario * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel lateral */}
      <div className="space-y-6">
        {/* Estado del stock */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado del Stock</h2>
          
          <div className={`flex items-center gap-3 p-4 rounded-lg ${getStockStatusColor(producto.stock_critico, producto.stock_minimo)}`}>
            <StockIcon className="w-6 h-6" />
            <div>
              <p className="font-semibold text-lg">
                Stock Crítico: {producto.stock_critico}
              </p>
              <p className="text-sm">
                {getStockStatusText(producto.stock_critico, producto.stock_minimo)}
              </p>
              <p className="text-xs mt-1">
                Mín: {producto.stock_minimo} | Máx: {producto.stock_maximo}
              </p>
            </div>
          </div>
        </div>

        {/* Imagen del producto */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Imagen</h2>
          
          {producto.url_foto_producto ? (
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={producto.url_foto_producto}
                alt={producto.nombre_producto}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-full flex items-center justify-center">
                <PhotoIcon className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <PhotoIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Información de auditoría */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Información de Registro
          </h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Creado por
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-500" />
                {producto.created_by_name || `Usuario #${producto.created_by}`}
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Fecha de creación
              </label>
              <p className="text-sm text-gray-900">
                {formatDate(producto.created_at)}
              </p>
            </div>
            
            {producto.updated_at && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Última actualización
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(producto.updated_at)}
                </p>
                {producto.updated_by_name && (
                  <p className="text-xs text-gray-500 mt-1">
                    por {producto.updated_by_name}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
