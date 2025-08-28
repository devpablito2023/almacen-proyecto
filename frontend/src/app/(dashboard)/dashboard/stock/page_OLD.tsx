// src/app/(dashboard)/stock/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellIcon,
  EyeIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { 
  TIPOS_PRODUCTO,
  CATEGORIAS_PRODUCTO,
  TIPO_COLORS 
} from '@/types/productos';
import { 
  NIVELES_STOCK,
  STOCK_ALERT_COLORS,
  StockFilter
} from '@/types/stock';
import { useAuthStore } from '@/stores/authStore';
import useStock from '@/hooks/useStock';

import {authService} from '@/lib/auth/authService';   
const cookieUser = authService.getUserInfoFromCookie();
console.log("cookieUser en stock/page.tsx:", cookieUser);
        if (cookieUser ) {
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
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  // Estados para ajuste de stock
  const [adjustData, setAdjustData] = useState({
    tipo_ajuste: 'positivo' as 'positivo' | 'negativo',
    cantidad_ajuste: 0,
    motivo: '',
    observaciones: ''
  });
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

  // Formatear moneda
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'No definido';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
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

  // Obtener nivel de alerta
  const getAlertLevel = (item: any) => {
    if (item.cantidad_total === 0) return 'sin_stock';
    if (item.cantidad_total <= item.stock_critico) return 'critico';
    if (item.cantidad_total <= item.stock_minimo) return 'bajo';
    return 'normal';
  };

  // Obtener texto de alerta
  const getAlertText = (level: string) => {
    switch (level) {
      case 'sin_stock': return 'Sin Stock';
      case 'critico': return 'Stock Crítico';
      case 'bajo': return 'Stock Bajo';
      default: return 'Stock Normal';
    }
  };

  // Exportar stock con filtros actuales
  const handleExportStock = async () => {
    try {
      await exportStock(filters);
    } catch (error) {
      console.error('Error exportando stock:', error);
    }
  };

  // Abrir modal de ajuste
  const handleOpenAdjust = (productId: number) => {
    setSelectedProduct(productId);
    setShowAdjustModal(true);
    setAdjustData({
      tipo_ajuste: 'positivo',
      cantidad_ajuste: 0,
      motivo: '',
      observaciones: ''
    });
    setAdjustError(null);
    setAdjustSuccess(false);
  };

  // Realizar ajuste de stock
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    if (adjustData.cantidad_ajuste <= 0) {
      setAdjustError('La cantidad debe ser mayor a 0');
      return;
    }

    if (!adjustData.motivo.trim()) {
      setAdjustError('El motivo es requerido');
      return;
    }

    setAdjustLoading(true);
    setAdjustError(null);

    try {
      await adjustStock({
        producto_id: selectedProduct,
        tipo_ajuste: adjustData.tipo_ajuste,
        cantidad_ajuste: adjustData.cantidad_ajuste,
        motivo: adjustData.motivo,
        observaciones: adjustData.observaciones || undefined
      });

      setAdjustSuccess(true);
      setTimeout(() => {
        setShowAdjustModal(false);
        setAdjustSuccess(false);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setAdjustError(errorMessage);
    } finally {
      setAdjustLoading(false);
    }
  };

  // Verificar permisos para ajustar stock
  //const canAdjustStock = user?.tipo_usuario === 0 || user?.tipo_usuario === 4 || user?.tipo_usuario === 5;
  const canAdjustStock = cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 4 || cookieUser?.tipo_usuario === 5;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Stock</h1>
          <p className="text-gray-600">Monitoreo y gestión del inventario en tiempo real</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportStock}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportar
          </button>
          <button
            onClick={refreshStock}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5 transform rotate-180" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <CubeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_productos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Crítico</p>
              <p className="text-2xl font-bold text-red-900">{stats.productos_stock_critico}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <BellIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.productos_stock_bajo}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(stats.valor_total_inventario)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas activas */}
      {alerts.length > 0 && (
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
      )}

      {/* Filtros y búsqueda */}
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

          {/* Botón filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="w-5 h-5" />
            Filtros
          </button>
        </div>

        {/* Panel de filtros */}
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

      {/* Error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 underline text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de stock */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Inventario Actual ({stock.length} productos)
          </h2>

          {/* Tabla Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valorización
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Mov.
                  </th>
                  {canAdjustStock && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stock.map((item) => {
                  const alertLevel = getAlertLevel(item);
                  return (
                    <tr key={item.id_stock} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.producto_nombre}</div>
                            <div className="text-sm text-gray-500">{item.producto_codigo}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${TIPO_COLORS[item.tipo_producto as keyof typeof TIPO_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                              {item.tipo_producto}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-semibold">Total: {item.cantidad_total} {item.magnitud_producto}</div>
                          <div className="text-green-600">Disponible: {item.cantidad_disponible}</div>
                          <div className="text-orange-600">Reservado: {item.cantidad_reservada}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Min: {item.stock_minimo} | Max: {item.stock_maximo} | Crítico: {item.stock_critico}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPinIcon className="w-4 h-4 text-gray-400 mr-1" />
                          {item.ubicacion_fisica}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-semibold">{formatCurrency(item.valor_inventario)}</div>
                          <div className="text-gray-500">
                            {item.costo_promedio ? `@ ${formatCurrency(item.costo_promedio)}` : 'Sin costo'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${STOCK_ALERT_COLORS[alertLevel]}`}>
                          {getAlertText(alertLevel)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {formatDate(item.fecha_ultimo_movimiento)}
                        </div>
                      </td>
                      {canAdjustStock && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenAdjust(item.producto_id)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <ChartBarIcon className="w-4 h-4" />
                              Ajustar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vista Mobile */}
          <div className="md:hidden space-y-4">
            {stock.map((item) => {
              const alertLevel = getAlertLevel(item);
              return (
                <div key={item.id_stock} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.producto_nombre}</h3>
                      <p className="text-sm text-gray-500">{item.producto_codigo}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${TIPO_COLORS[item.tipo_producto as keyof typeof TIPO_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                      {item.tipo_producto}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Stock Total</p>
                      <p className="text-sm font-medium">{item.cantidad_total} {item.magnitud_producto}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valorización</p>
                      <p className="text-sm font-medium">{formatCurrency(item.valor_inventario)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STOCK_ALERT_COLORS[alertLevel]}`}>
                      {getAlertText(alertLevel)}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{formatDate(item.fecha_ultimo_movimiento)}</span>
                      {canAdjustStock && (
                        <button
                          onClick={() => handleOpenAdjust(item.producto_id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                        >
                          <ChartBarIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estado vacío */}
          {stock.length === 0 && (
            <div className="text-center py-12">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">No se encontraron productos</h3>
              <p className="mt-2 text-sm text-gray-500">
                Intenta ajustar los filtros de búsqueda.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de ajuste de stock */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ajustar Stock</h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {adjustSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-800 text-sm">Ajuste realizado exitosamente</p>
                </div>
              </div>
            )}

            {adjustError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800 text-sm">{adjustError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Ajuste
                </label>
                <select
                  value={adjustData.tipo_ajuste}
                  onChange={(e) => setAdjustData(prev => ({ ...prev, tipo_ajuste: e.target.value as 'positivo' | 'negativo' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={adjustLoading}
                >
                  <option value="positivo">Ajuste Positivo (+)</option>
                  <option value="negativo">Ajuste Negativo (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustData.cantidad_ajuste}
                  onChange={(e) => setAdjustData(prev => ({ ...prev, cantidad_ajuste: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={adjustLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo *
                </label>
                <input
                  type="text"
                  value={adjustData.motivo}
                  onChange={(e) => setAdjustData(prev => ({ ...prev, motivo: e.target.value }))}
                  placeholder="Ej: Inventario físico, producto dañado, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={adjustLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={adjustData.observaciones}
                  onChange={(e) => setAdjustData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Observaciones adicionales (opcional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={adjustLoading}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  disabled={adjustLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading || adjustData.cantidad_ajuste <= 0 || !adjustData.motivo.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {adjustLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      {adjustData.tipo_ajuste === 'positivo' ? (
                        <PlusIcon className="w-4 h-4" />
                      ) : (
                        <MinusIcon className="w-4 h-4" />
                      )}
                      Realizar Ajuste
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}