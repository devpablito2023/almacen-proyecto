import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils/cn';

/**
 * Componente Badge primitivo con TailwindCSS y animaciones
 * Usado para etiquetas, estados y notificaciones
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

const badgeVariants = {
  variant: {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-purple-100 text-purple-800 border-purple-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  size: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  },
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    animated = false,
    dot = false,
    removable = false,
    onRemove,
    children,
    ...props
  }, ref) => {
    const content = (
      <>
        {dot && (
          <span className={cn(
            'inline-block w-2 h-2 rounded-full mr-1.5',
            variant === 'default' && 'bg-gray-500',
            variant === 'primary' && 'bg-blue-500',
            variant === 'secondary' && 'bg-purple-500',
            variant === 'success' && 'bg-green-500',
            variant === 'warning' && 'bg-yellow-500',
            variant === 'error' && 'bg-red-500',
            variant === 'info' && 'bg-cyan-500',
          )} />
        )}
        {children}
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            title="Remover"
            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 focus:outline-none focus:bg-black/10 transition-colors duration-150"
          >
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </>
    );

    if (animated) {
      return (
        <motion.span
          ref={ref}
          className={cn(
            'inline-flex items-center rounded-md border font-medium transition-colors duration-200',
            badgeVariants.variant[variant],
            badgeVariants.size[size],
            className
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.05 }}
          {...props}
        >
          {content}
        </motion.span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-md border font-medium transition-colors duration-200',
          badgeVariants.variant[variant],
          badgeVariants.size[size],
          className
        )}
        {...props}
      >
        {content}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
