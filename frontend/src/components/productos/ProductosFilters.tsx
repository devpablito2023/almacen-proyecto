'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { TIPOS_PRODUCTO, CATEGORIAS_PRODUCTO, ProductosFiltersProps } from '@/types/productos';
import { Button, Input, Label } from '../commons';

export default function ProductosFilters({
  show,
  searchTerm,
  selectedTipo,
  selectedCategoria,
  onFiltersChange
}: ProductosFiltersProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Búsqueda principal */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar productos por nombre o código..."
            value={searchTerm}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {show && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Filtro por tipo */}
          <div>
            <Label>
              Tipo de Producto
            </Label>
            <select
              value={selectedTipo}
              onChange={(e) => onFiltersChange({ tipo_producto: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {TIPOS_PRODUCTO.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por categoría */}
          <div>
            <Label>
              Categoría
            </Label>
            <select
              value={selectedCategoria}
              onChange={(e) => onFiltersChange({ categoria_producto: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS_PRODUCTO.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex items-end">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => onFiltersChange({
                search: '',
                tipo_producto: '',
                categoria_producto: ''
              })}
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
