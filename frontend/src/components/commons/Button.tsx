import React from 'react';
import { cn, createVariants } from '../../lib/utils/cn';

/**
 * Componente Button primitivo con variantes y estados
 * Componente atómico base para todo el sistema
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// Definir variantes con el helper
const buttonVariants = createVariants({
  variant: {
    primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white border-transparent',
    secondary: 'bg-white hover:bg-gray-50 focus:ring-primary-500 text-gray-700 border-gray-300',
    danger: 'bg-danger-600 hover:bg-danger-700 focus:ring-danger-500 text-white border-transparent',
    ghost: 'bg-transparent hover:bg-gray-100 focus:ring-primary-500 text-gray-700 border-transparent',
    outline: 'bg-transparent hover:bg-primary-50 focus:ring-primary-500 text-primary-600 border-primary-300',
  },
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  },
});

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props
  }, ref) => {
    return (
      <button
        className={cn(
          // Estilos base
          'inline-flex items-center justify-center font-medium rounded-lg border transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Aplicar variantes
          buttonVariants({ variant, size }),
          // Ancho completo
          fullWidth && 'w-full',
          // Loading state
          isLoading && 'relative',
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {/* Contenido del botón */}
        <div className={cn('flex items-center gap-2', isLoading && 'opacity-0')}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{isLoading && loadingText ? loadingText : children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

// Componentes especializados
export const PrimaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button variant="primary" ref={ref} {...props} />
);

export const SecondaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button variant="secondary" ref={ref} {...props} />
);

export const DangerButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button variant="danger" ref={ref} {...props} />
);

export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps & { icon: React.ReactNode }>(
  ({ icon, children, ...props }, ref) => (
    <Button leftIcon={icon} ref={ref} {...props}>
      {children}
    </Button>
  )
);

PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
DangerButton.displayName = 'DangerButton';
IconButton.displayName = 'IconButton';
