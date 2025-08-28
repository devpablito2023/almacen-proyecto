import React from 'react';
import { cn } from '../../lib/utils/cn';
import { BreadcrumbsWithActions } from './Breadcrumbs';
import { LoadingState, EmptyState } from '../ui';
import { Button } from '../commons';
import type { BreadcrumbItem } from '../../types/global';

/**
 * Layout para páginas específicas con header, acciones y estados
 * Usado en páginas de listado, formularios y detalles
 */

export interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyStateProps?: {
    title?: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  className?: string;
  contentClassName?: string;
  showHeader?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyStateProps,
  className,
  contentClassName,
  showHeader = true,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      
      {/* Page Header */}
      {showHeader && (title || breadcrumbs || actions) && (
        <BreadcrumbsWithActions
          items={breadcrumbs}
          title={title}
          subtitle={subtitle}
          actions={actions}
        />
      )}

      {/* Page Content */}
      <div className={cn('', contentClassName)}>
        <LoadingState
          isLoading={isLoading}
          error={error}
          fallback={
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
            </div>
          }
          errorFallback={
            <div className="bg-white rounded-lg shadow p-8">
              <EmptyState
                icon={
                  <svg className="w-full h-full text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="Error al cargar datos"
                description={error || 'Ha ocurrido un problema inesperado'}
                action={{
                  label: 'Intentar nuevamente',
                  onClick: () => window.location.reload(),
                }}
              />
            </div>
          }
        >
          {isEmpty ? (
            <div className="bg-white rounded-lg shadow p-8">
              <EmptyState
                title={emptyStateProps?.title}
                description={emptyStateProps?.description}
                action={emptyStateProps?.action}
              />
            </div>
          ) : (
            children
          )}
        </LoadingState>
      </div>
    </div>
  );
};

// Layout específico para páginas de listado
export interface ListPageLayoutProps extends Omit<PageLayoutProps, 'isEmpty' | 'emptyStateProps'> {
  itemCount?: number;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const ListPageLayout: React.FC<ListPageLayoutProps> = ({
  itemCount = 0,
  searchQuery,
  onClearSearch,
  ...props
}) => {
  const isEmpty = itemCount === 0;
  
  let emptyStateProps;
  if (isEmpty) {
    if (searchQuery) {
      emptyStateProps = {
        title: 'Sin resultados',
        description: `No se encontraron resultados para "${searchQuery}"`,
        action: onClearSearch ? {
          label: 'Limpiar búsqueda',
          onClick: onClearSearch,
        } : undefined,
      };
    } else {
      emptyStateProps = {
        title: 'No hay datos disponibles',
        description: 'No se han encontrado elementos para mostrar',
      };
    }
  }

  return (
    <PageLayout
      {...props}
      isEmpty={isEmpty}
      emptyStateProps={emptyStateProps}
    />
  );
};

// Layout para páginas de formulario
export interface FormPageLayoutProps extends Omit<PageLayoutProps, 'children'> {
  children: React.ReactNode;
  isSubmitting?: boolean;
  hasUnsavedChanges?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
}

export const FormPageLayout: React.FC<FormPageLayoutProps> = ({
  children,
  isSubmitting = false,
  hasUnsavedChanges = false,
  onCancel,
  onSave,
  saveLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  actions,
  ...props
}) => {
  // Combinar acciones del formulario con acciones personalizadas
  const formActions = (
    <div className="flex items-center space-x-3">
      {actions}
      {onCancel && (
        <Button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          variant="secondary"
        >
          {cancelLabel}
        </Button>
      )}
      {onSave && (
        <Button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          variant="primary"
          isLoading={isSubmitting}
          loadingText="Guardando..."
        >
          <>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 bg-warning-400 rounded-full mr-2" />
            )}
            {saveLabel}
          </>
        </Button>
      )}
    </div>
  );

  return (
    <PageLayout {...props} actions={formActions}>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </PageLayout>
  );
};

// Layout para páginas de detalle/vista
export interface DetailPageLayoutProps extends PageLayoutProps {
  tabs?: Array<{
    id: string;
    name: string;
    count?: number;
  }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  ...props
}) => {
  return (
    <PageLayout {...props}>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        
        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  variant="ghost"
                  className={cn(
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors h-auto',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.name}
                  {tab.count !== undefined && (
                    <span className={cn(
                      'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-900'
                    )}>
                      {tab.count}
                    </span>
                  )}
                </Button>
              ))}
            </nav>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </PageLayout>
  );
};

export default PageLayout;