'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import useStock from '@/hooks/useStock';
import { StockFilter } from '@/types/stock';
import { authService } from '@/lib/auth/authService';

// Importar todos los componentes
import StockHeader from '@/components/stock/StockHeader';
import StockStats from '@/components/stock/StockStats';
import StockAlerts from '@/components/stock/StockAlerts';
import StockFilters from '@/components/stock/StockFilters';
import StockTable from '@/components/stock/StockTable';
import StockAdjustModal from '@/components/stock/StockAdjustModal';
import LoadingSpinner from '@/components/stock/LoadingSpinner';
import ErrorAlert from '@/components/stock/ErrorAlert';

const cookieUser = authService.getUserInfoFromCookie();
console.log("cookieUser en stock/page.tsx:", cookieUser);
if (cookieUser) {
  console.log(`👤 useAuth: Usuario encontrado en cookies: ${cookieUser.nombre_usuario}`);
}

export default function StockPage() {
  const { user } = useAuthStore();
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedNivel, setSelectedNivel] = useState<'critico' | 'bajo' | 'normal' | 'sin_stock' | ''>('');
  const [conStock, setConStock] = useState<boolean | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para el modal de ajuste
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  // Preparar filtros para el hook
  const filters: StockFilter = {
    search: searchTerm || undefined,
    tipo_producto: selectedTipo || undefined,
    categoria_producto: selectedCategoria || undefined,
    nivel_alerta: selectedNivel || undefined,
    con_stock: conStock
  };

  // Usar el hook de stock
  const {
    stock,
    loading,
    error,
    stats,
    alerts,
    exportStock,
    adjustStock,
    refreshStock,
    clearError
  } = useStock(filters);

  // Funciones auxiliares
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'No definido';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'No se ha modificado';
    }
    
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Hace menos de 1h';
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 30) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-PE');
  };

  // Handlers
  const handleExportStock = async () => {
    try {
      await exportStock(filters);
    } catch (error) {
      console.error('Error exportando stock:', error);
    }
  };

  const handleOpenAdjust = (productId: number) => {
    setSelectedProduct(productId);
    setShowAdjustModal(true);
    setAdjustError(null);
    setAdjustSuccess(false);
  };

  const handleCloseAdjust = () => {
    setShowAdjustModal(false);
    setSelectedProduct(null);
    setAdjustError(null);
    setAdjustSuccess(false);
  };

  const handleAdjustStock = async (data: {
    producto_id: number;
    tipo_ajuste: 'positivo' | 'negativo';
    cantidad_ajuste: number;
    motivo: string;
  }) => {
    if (data.cantidad_ajuste <= 0) {
      setAdjustError('La cantidad debe ser mayor a 0');
      return;
    }

    if (!data.motivo.trim()) {
      setAdjustError('El motivo es requerido');
      return;
    }

    setAdjustLoading(true);
    setAdjustError(null);

    try {
      console.log('🔧 COMPONENTE - Datos a enviar:', data);
      
      await adjustStock(data);
      
      setAdjustSuccess(true);
      setTimeout(() => {
        handleCloseAdjust();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setAdjustError(errorMessage);
    } finally {
      setAdjustLoading(false);
    }
  };

  // Verificar permisos para ajustar stock
  const canAdjustStock = cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 4 || cookieUser?.tipo_usuario === 5;

  // Mostrar loading
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <StockHeader 
        onExport={handleExportStock}
        onRefresh={refreshStock}
      />

      {/* Estadísticas principales */}
      <StockStats 
        stats={stats}
        formatCurrency={formatCurrency}
      />

      {/* Alertas activas */}
      <StockAlerts alerts={alerts} />

      {/* Filtros y búsqueda */}
      <StockFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTipo={selectedTipo}
        setSelectedTipo={setSelectedTipo}
        selectedCategoria={selectedCategoria}
        setSelectedCategoria={setSelectedCategoria}
        selectedNivel={selectedNivel}
        setSelectedNivel={setSelectedNivel}
        conStock={conStock}
        setConStock={setConStock}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* Error general */}
      <ErrorAlert 
        error={error}
        onClose={clearError}
      />

      {/* Tabla de stock */}
      <StockTable
        stock={stock}
        canAdjustStock={canAdjustStock}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onAdjustStock={handleOpenAdjust}
      />

      {/* Modal de ajuste de stock */}
      <StockAdjustModal
        isOpen={showAdjustModal}
        onClose={handleCloseAdjust}
        onSubmit={handleAdjustStock}
        productId={selectedProduct}
        loading={adjustLoading}
        error={adjustError}
        success={adjustSuccess}
      />
    </div>
  );
}