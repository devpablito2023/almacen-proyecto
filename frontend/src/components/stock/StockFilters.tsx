import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { TIPOS_PRODUCTO, CATEGORIAS_PRODUCTO } from '@/types/productos';
import { NIVELES_STOCK } from '@/types/stock';

interface StockFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTipo: string;
  setSelectedTipo: (tipo: string) => void;
  selectedCategoria: string;
  setSelectedCategoria: (categoria: string) => void;
  selectedNivel: 'critico' | 'bajo' | 'normal' | 'sin_stock' | '';
  setSelectedNivel: (nivel: 'critico' | 'bajo' | 'normal' | 'sin_stock' | '') => void;
  conStock: boolean | undefined;
  setConStock: (conStock: boolean | undefined) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export default function StockFilters({
  searchTerm,
  setSearchTerm,
  selectedTipo,
  setSelectedTipo,
  selectedCategoria,
  setSelectedCategoria,
  selectedNivel,
  setSelectedNivel,
  conStock,
  setConStock,
  showFilters,
  setShowFilters
}: StockFiltersProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por producto, código o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <FunnelIcon className="w-5 h-5" />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Producto</label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {TIPOS_PRODUCTO.map(tipo => (
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
              {CATEGORIAS_PRODUCTO.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Stock</label>
            <select
              value={selectedNivel}
              onChange={(e) => setSelectedNivel(e.target.value as 'critico' | 'bajo' | 'normal' | 'sin_stock' | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los niveles</option>
              {NIVELES_STOCK.map(nivel => (
                <option key={nivel.value} value={nivel.value}>{nivel.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Con Stock</label>
            <select
              value={conStock === undefined ? '' : conStock.toString()}
              onChange={(e) => setConStock(e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Solo con stock</option>
              <option value="false">Solo sin stock</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}