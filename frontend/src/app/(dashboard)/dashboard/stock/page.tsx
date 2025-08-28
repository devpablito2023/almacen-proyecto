'use client';
import { useState } from 'react';
import { CubeIcon, ExclamationTriangleIcon, BellIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useStock } from '@/hooks/api/useStock';
import { authService } from '@/lib/auth/authService';
import { StatsCard } from '@/components/common/StatsCard/StatsCard';
import { SearchBar } from '@/components/common/SearchBar/SearchBar';
import { StockTable } from '@/components/stock/StockTable/StockTable';

export default function StockPage() {
  const cookieUser = authService.getUserInfoFromCookie();
  //VSi no hay usuario o el campo es undefined, se usa -1 que nunca estará en [0,4,5].
  const canAdjustStock = [0, 4, 5].includes(cookieUser?.tipo_usuario ?? -1);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Hook stock
  const { stock, stats, alerts, loading, error, refetch } = useStock({ search: searchTerm });
  console.log("StockPage render", { stock, stats, alerts, loading, error });

  const formatCurrency = (v: number | null) => v ? new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v) : 'No definido';
  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-PE');
  const getAlertLevel = (i: any) => i.cantidad_total === 0 ? 'sin_stock' : i.cantidad_total <= i.stock_critico ? 'critico' : i.cantidad_total <= i.stock_minimo ? 'bajo' : 'normal';
  const getAlertText = (level: string) => ({ sin_stock: "Sin Stock", critico: "Stock Crítico", bajo: "Stock Bajo", normal: "Stock Normal" }[level]?? "Desconocido");

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Control de Stock</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Productos" value={stats.total_productos} icon={<CubeIcon className="w-6 h-6 text-blue-600" />} bgColor="bg-blue-100" />
        <StatsCard title="Stock Crítico" value={stats.productos_stock_critico} icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />} bgColor="bg-red-100" textColor="text-red-900" />
        <StatsCard title="Stock Bajo" value={stats.productos_stock_bajo} icon={<BellIcon className="w-6 h-6 text-yellow-600" />} bgColor="bg-yellow-100" textColor="text-yellow-900" />
        <StatsCard title="Valor Inventario" value={formatCurrency(stats.valor_total_inventario)} icon={<CurrencyDollarIcon className="w-6 h-6 text-green-600" />} bgColor="bg-green-100" textColor="text-green-900" />
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <SearchBar value={searchTerm} onChange={setSearchTerm} onToggleFilters={() => setShowFilters(!showFilters)} />
        {showFilters && <div> {/* aquí luego montamos SearchFilters */} </div>}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow p-6">
        <StockTable
          stock={stock}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getAlertLevel={getAlertLevel}
          getAlertText={getAlertText}
          canAdjust={canAdjustStock}
          onAdjust={(id) => console.log("ajustar", id)}
        />
      </div>
    </div>
  );
}
