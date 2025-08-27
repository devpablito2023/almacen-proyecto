'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProductos } from '@/hooks/useProductos';
import { ProductosFilter, ProductoSearchParams } from '@/types/productos';
import { authService } from '@/lib/auth/authService';

// Importar todos los componentes modulares
import ProductosHeader from './ProductosHeader';
import ProductosStats from './ProductosStats';
import ProductosFilters from './ProductosFilters';
import ProductosTable from './ProductosTable';
import LoadingSpinner from '../stock/LoadingSpinner';
import ErrorAlert from '../stock/ErrorAlert';

const cookieUser = authService.getUserInfoFromCookie();

export default function ProductosMain() {
  const { user } = useAuthStore();
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Preparar filtros para el hook
  const filters: ProductoSearchParams = {
    search: searchTerm || undefined,
    tipo_producto: (selectedTipo as any) || undefined,
    categoria_producto: selectedCategoria || undefined,
    page: currentPage,
    limit: itemsPerPage
  };

  // Hook de productos
  const {
    productos,
    stats,
    pagination,
    loading,
    error,
    fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    exportProductos,
    importProductos,
    clearError
  } = useProductos(filters);

  // Refrescar datos cuando cambien los filtros
  useEffect(() => {
    fetchProductos(filters);
  }, [searchTerm, selectedTipo, selectedCategoria, currentPage, itemsPerPage]);

  // Handlers para los componentes hijos
  const handleExportExcel = async () => {
    try {
      await exportProductos();
    } catch (error) {
      console.error('Error exportando productos:', error);
    }
  };

  const handleImportExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importProductos(file);
          fetchProductos(filters);
        } catch (error) {
          console.error('Error importando productos:', error);
        }
      }
    };
    input.click();
  };

  const handleFiltersChange = (newFilters: Partial<ProductoSearchParams>) => {
    if (newFilters.search !== undefined) setSearchTerm(newFilters.search || '');
    if (newFilters.tipo_producto !== undefined) setSelectedTipo(newFilters.tipo_producto || '');
    if (newFilters.categoria_producto !== undefined) setSelectedCategoria(newFilters.categoria_producto || '');
    if (newFilters.page !== undefined) setCurrentPage(newFilters.page);
    if (newFilters.limit !== undefined) setItemsPerPage(newFilters.limit);
  };

  const handleToggleFilters = () => setShowFilters(!showFilters);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert error={error} onClose={clearError} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con acciones principales */}
      <ProductosHeader
        onExport={handleExportExcel}
        onImport={handleImportExcel}
        onToggleFilters={handleToggleFilters}
        showFilters={showFilters}
        canCreate={cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 5}
      />

      {/* Estadísticas */}
      <ProductosStats stats={stats} />

      {/* Filtros (colapsables) */}
      <ProductosFilters
        show={showFilters}
        searchTerm={searchTerm}
        selectedTipo={selectedTipo}
        selectedCategoria={selectedCategoria}
        onFiltersChange={handleFiltersChange}
      />

      {/* Tabla de productos */}
      <ProductosTable
        productos={productos}
        pagination={pagination}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page: number) => handleFiltersChange({ page })}
        onItemsPerPageChange={(limit: number) => handleFiltersChange({ limit })}
        onDelete={deleteProducto}
        canEdit={cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 5}
        canDelete={cookieUser?.tipo_usuario === 0}
      />
    </div>
  );
}
