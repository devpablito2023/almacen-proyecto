'use client';

import { 
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { ProductosHeaderProps } from '@/types/productos';
import { Button } from '../commons';

export default function ProductosHeader({
  onExport,
  onImport,
  onToggleFilters,
  showFilters,
  canCreate
}: ProductosHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <p className="text-gray-600">Gestión del catálogo de productos del almacén</p>
      </div>
      
      <div className="flex gap-3">
        {/* Botón de filtros */}
        <Button
          variant={showFilters ? "primary" : "secondary"}
          onClick={onToggleFilters}
          leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>}
        >
          Filtros
        </Button>

        {/* Botones para usuarios autorizados */}
        {canCreate && (
          <>
            <Button
              variant="primary"
              onClick={onImport}
              leftIcon={<ArrowUpTrayIcon className="w-5 h-5" />}
              className="bg-green-600 hover:bg-green-700"
            >
              Importar Excel
            </Button>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/dashboard/productos/nuevo'}
              leftIcon={<PlusIcon className="w-5 h-5" />}
            >
              Nuevo Producto
            </Button>
          </>
        )}

        {/* Botón exportar (siempre visible) */}
        <Button
          variant="secondary"
          onClick={onExport}
          leftIcon={<ArrowDownTrayIcon className="w-5 h-5" />}
          className="bg-gray-600 hover:bg-gray-700 text-white"
        >
          Exportar
        </Button>
      </div>
    </div>
  );
}
