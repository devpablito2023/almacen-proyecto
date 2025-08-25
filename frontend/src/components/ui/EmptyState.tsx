import React from 'react';
import { cn } from '../../lib/utils/cn';

/**
 * Componente EmptyState para mostrar cuando no hay datos
 * Proporciona feedback visual y acciones opcionales
 */

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'No hay datos disponibles',
  description,
  action,
  size = 'md',
  className,
}) => {
  const getDefaultIcon = () => (
    <svg className="text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      size === 'sm' && 'py-8',
      size === 'md' && 'py-12',
      size === 'lg' && 'py-16',
      className
    )}>
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 mb-4',
        size === 'sm' && 'w-8 h-8',
        size === 'md' && 'w-12 h-12',
        size === 'lg' && 'w-16 h-16'
      )}>
        {icon || getDefaultIcon()}
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-medium text-gray-900 mb-2',
        size === 'sm' && 'text-base',
        size === 'md' && 'text-lg',
        size === 'lg' && 'text-xl'
      )}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn(
          'text-gray-500 mb-6 max-w-sm',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg'
        )}>
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            action.variant === 'primary' && [
              'border-transparent text-white bg-primary-600 hover:bg-primary-700',
              'focus:ring-primary-500'
            ],
            (!action.variant || action.variant === 'secondary') && [
              'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
              'focus:ring-primary-500'
            ]
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Estados vacíos específicos
export const NoProductsFound: React.FC<{ onAddProduct?: () => void }> = ({ onAddProduct }) => (
  <EmptyState
    icon={
      <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    }
    title="No se encontraron productos"
    description="No hay productos que coincidan con los filtros seleccionados"
    action={onAddProduct ? {
      label: 'Agregar producto',
      onClick: onAddProduct,
      variant: 'primary'
    } : undefined}
  />
);

export const NoStockAlerts: React.FC = () => (
  <EmptyState
    icon={
      <svg className="w-full h-full text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    title="Sin alertas de stock"
    description="Todos los productos tienen niveles de stock normales"
  />
);

export const NoRequestsFound: React.FC<{ onCreateRequest?: () => void }> = ({ onCreateRequest }) => (
  <EmptyState
    icon={
      <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    }
    title="No hay solicitudes"
    description="No se encontraron solicitudes con los filtros actuales"
    action={onCreateRequest ? {
      label: 'Nueva solicitud',
      onClick: onCreateRequest,
      variant: 'primary'
    } : undefined}
  />
);

export const NoUsersFound: React.FC<{ onAddUser?: () => void }> = ({ onAddUser }) => (
  <EmptyState
    icon={
      <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    }
    title="No se encontraron usuarios"
    description="No hay usuarios registrados en el sistema"
    action={onAddUser ? {
      label: 'Agregar usuario',
      onClick: onAddUser,
      variant: 'primary'
    } : undefined}
  />
);

export const NoMovementsFound: React.FC = () => (
  <EmptyState
    icon={
      <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    }
    title="Sin movimientos registrados"
    description="No hay movimientos de inventario en el período seleccionado"
  />
);

export const SearchNotFound: React.FC<{ query: string; onClearSearch?: () => void }> = ({ 
  query, 
  onClearSearch 
}) => (
  <EmptyState
    icon={
      <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    title="Sin resultados"
    description={`No se encontraron resultados para "${query}"`}
    action={onClearSearch ? {
      label: 'Limpiar búsqueda',
      onClick: onClearSearch,
      variant: 'secondary'
    } : undefined}
  />
);

export const ErrorState: React.FC<{ 
  title?: string; 
  description?: string; 
  onRetry?: () => void;
}> = ({ 
  title = 'Error al cargar datos',
  description = 'Ocurrió un problema al cargar la información',
  onRetry
}) => (
  <EmptyState
    icon={
      <svg className="w-full h-full text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    title={title}
    description={description}
    action={onRetry ? {
      label: 'Intentar nuevamente',
      onClick: onRetry,
      variant: 'primary'
    } : undefined}
  />
);

export { EmptyState };