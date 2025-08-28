import React from 'react';
import { cn } from '../../lib/utils/cn';
import { Button } from '../commons';

/**
 * Componentes de loading y skeletons
 * Proporcionan feedback visual durante cargas
 */

// Spinner básico
export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', color = 'primary', ...props }, ref) => {
    return (
      <div
        className={cn(
          'inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em]',
          
          // Sizes
          size === 'sm' && 'h-4 w-4 border-2',
          size === 'md' && 'h-6 w-6 border-2',
          size === 'lg' && 'h-8 w-8 border-[3px]',
          size === 'xl' && 'h-12 w-12 border-4',
          
          // Colors
          color === 'primary' && 'text-primary-600',
          color === 'white' && 'text-white',
          color === 'gray' && 'text-gray-600',
          
          className
        )}
        role="status"
        aria-label="Cargando"
        ref={ref}
        {...props}
      >
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// Loading overlay
export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isVisible: boolean;
  message?: string;
  backdrop?: boolean;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, isVisible, message = 'Cargando...', backdrop = true, ...props }, ref) => {
    if (!isVisible) return null;

    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          backdrop && 'bg-black bg-opacity-50',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center space-y-4">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

// Loading inline
export interface LoadingInlineProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingInline = React.forwardRef<HTMLDivElement, LoadingInlineProps>(
  ({ className, message = 'Cargando...', size = 'md', ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center justify-center space-x-3',
          size === 'sm' && 'py-2',
          size === 'md' && 'py-4',
          size === 'lg' && 'py-8',
          className
        )}
        ref={ref}
        {...props}
      >
        <Spinner size={size === 'lg' ? 'lg' : 'md'} />
        <span className={cn(
          'text-gray-600 font-medium',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg'
        )}>
          {message}
        </span>
      </div>
    );
  }
);

LoadingInline.displayName = 'LoadingInline';

// Skeleton components
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number; // Para variant text
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', width, height, lines = 1, ...props }, ref) => {
    if (variant === 'text' && lines > 1) {
      return (
        <div className="space-y-2" ref={ref} {...props}>
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className={cn(
                'animate-pulse bg-gray-200 rounded h-4',
                i === lines - 1 && 'w-3/4', // Última línea más corta
                className
              )}
              style={{
                width: i === lines - 1 ? undefined : width,
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        className={cn(
          'animate-pulse bg-gray-200',
          variant === 'text' && 'rounded h-4',
          variant === 'rectangular' && 'rounded',
          variant === 'circular' && 'rounded-full',
          className
        )}
        style={{ width, height }}
        ref={ref}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Skeleton presets comunes
const SkeletonCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn('p-6 space-y-4', className)} ref={ref} {...props}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" lines={3} />
      </div>
      <div className="flex justify-between">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={100} height={32} />
      </div>
    </div>
  )
);

SkeletonCard.displayName = 'SkeletonCard';

const SkeletonTable = React.forwardRef<HTMLDivElement, { rows?: number } & React.HTMLAttributes<HTMLDivElement>>(
  ({ className, rows = 5, ...props }, ref) => (
    <div className={cn('space-y-4', className)} ref={ref} {...props}>
      {/* Header */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={`header-${i}`} variant="text" width="80%" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={`row-${i}`} className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, j) => (
            <Skeleton key={`cell-${i}-${j}`} variant="text" width="90%" />
          ))}
        </div>
      ))}
    </div>
  )
);

SkeletonTable.displayName = 'SkeletonTable';

const SkeletonList = React.forwardRef<HTMLDivElement, { items?: number } & React.HTMLAttributes<HTMLDivElement>>(
  ({ className, items = 6, ...props }, ref) => (
    <div className={cn('space-y-3', className)} ref={ref} {...props}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton variant="circular" width={32} height={32} />
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </div>
          <Skeleton variant="rectangular" width={60} height={24} />
        </div>
      ))}
    </div>
  )
);

SkeletonList.displayName = 'SkeletonList';

// Loading Button
export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, isLoading = false, loadingText, disabled, children, ...props }, ref) => {
    return (
      <Button
        className={className}
        disabled={disabled}
        isLoading={isLoading}
        loadingText={loadingText}
        variant="primary"
        ref={ref}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

// Loading states for specific components
export interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  children,
  fallback,
  errorFallback
}) => {
  if (error) {
    return errorFallback ? (
      <>{errorFallback}</>
    ) : (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
        <p className="text-sm text-gray-500 max-w-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return fallback ? <>{fallback}</> : <LoadingInline />;
  }

  return <>{children}</>;
};

LoadingState.displayName = 'LoadingState';

// Loading screen completo
export interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
  logo?: React.ReactNode;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Cargando aplicación...',
  showLogo = true,
  logo
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {showLogo && (
        <div className="mb-8">
          {logo || (
            <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>
      )}
      
      <div className="text-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

LoadingScreen.displayName = 'LoadingScreen';

// Progress bar
export interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  variant = 'default',
  showPercentage = false,
  animated = false,
  className
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'bg-gray-200 rounded-full overflow-hidden',
        size === 'sm' && 'h-2',
        size === 'md' && 'h-3',
        size === 'lg' && 'h-4'
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variant === 'default' && 'bg-primary-600',
            variant === 'success' && 'bg-success-500',
            variant === 'warning' && 'bg-warning-500',
            variant === 'danger' && 'bg-danger-500',
            animated && 'bg-gradient-to-r from-current via-current to-transparent animate-pulse'
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      
      {showPercentage && (
        <div className="mt-1 text-right">
          <span className="text-sm text-gray-600">{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

export {
  Spinner,
  LoadingOverlay,
  LoadingInline,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  LoadingButton,
  LoadingState,
  LoadingScreen,
  ProgressBar,
};