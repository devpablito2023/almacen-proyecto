// components/common/DataTable/DataTable.tsx
import React from 'react';
import { DataTableHeader } from './DataTableHeader';
import { DataTableRow } from './DataTableRow';
import { DataTablePagination } from './DataTablePagination';

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onChange: (page: number) => void;
  };
}

export function DataTable<T>({ 
  data, 
  columns, 
  loading, 
  onSort,
  onRowClick,
  pagination 
}: DataTableProps<T>) {
  // LÓGICA: Estado local para ordenamiento
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // LÓGICA: Manejo de ordenamiento
  const handleSort = (column: string) => {
    const direction = 
      sortConfig?.column === column && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    setSortConfig({ column, direction });
    onSort?.(column, direction);
  };

  if (loading) {
    return <TableSkeleton columns={columns.length} />;
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <DataTableHeader 
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item, index) => (
            <DataTableRow
              key={index}
              item={item}
              columns={columns}
              onClick={() => onRowClick?.(item)}
            />
          ))}
        </tbody>
      </table>
      
      {pagination && (
        <DataTablePagination {...pagination} />
      )}
    </div>
  );
}