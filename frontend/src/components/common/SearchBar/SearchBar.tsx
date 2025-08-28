import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onToggleFilters: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onToggleFilters }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      {/* Búsqueda */}
      <div className="flex-1 relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por producto, código o ubicación..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Botón filtros */}
      <button
        onClick={onToggleFilters}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <FunnelIcon className="w-5 h-5" />
        Filtros
      </button>
    </div>
  );
};
