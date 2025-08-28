"use client";
import { Card } from "@/components/common/atoms/Card";
import { SearchBar } from "@/components/common/molecules/SearchBar";

export const IngresosLayout: React.FC<{
  title: string;
  subtitle?: string;
  actions: React.ReactNode;
  stats: React.ReactNode;
  searchValue: string;
  onSearchChange: (v: string) => void;
  filters: React.ReactNode;         // panel de filtros (molecular)
  table: React.ReactNode;           // organismo
  pagination: React.ReactNode;      // molecule Pagination
  modals?: React.ReactNode;         // confirm dialogs, etc.
}> = ({ title, subtitle, actions, stats, searchValue, onSearchChange, filters, table, pagination, modals }) => (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      {actions}
    </div>

    {/* Stats */}
    {stats}

    {/* Search + Filters */}
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <SearchBar value={searchValue} onChange={onSearchChange} placeholder="Buscar ingresos por proveedor o código..." />
        </div>
        {/* botón de filtros podría estar en el mismo SearchBar si quieres */}
      </div>
      {filters}
    </Card>

    {/* Table */}
    <Card className="p-6">
      {table}
      {pagination}
    </Card>

    {/* Modals */}
    {modals}
  </div>
);
