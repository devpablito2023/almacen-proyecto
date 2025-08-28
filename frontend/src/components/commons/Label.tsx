import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils/cn';

/**
 * Componente Label primitivo con TailwindCSS y animaciones
 * Usado para etiquetas de formularios y texto descriptivo
 */

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: 'default' | 'required' | 'optional' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  children: React.ReactNode;
}

const labelVariants = {
  variant: {
    default: 'text-gray-700',
    required: 'text-gray-700 after:content-["*"] after:text-red-500 after:ml-1',
    optional: 'text-gray-500',
    error: 'text-red-600',
  },
  size: {
    sm: 'text-xs font-medium',
    md: 'text-sm font-medium',
    lg: 'text-base font-semibold',
  },
};

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    animated = false,
    children, 
    ...props 
  }, ref) => {
    if (animated) {
      return (
        <motion.label
          {...(props as any)}
          ref={ref}
          className={cn(
            'block transition-colors duration-200',
            labelVariants.variant[variant],
            labelVariants.size[size],
            className
          )}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          {...props}
        >
          {children}
        </motion.label>
      );
    }

    return (
      <label
        ref={ref}
        className={cn(
          'block transition-colors duration-200',
          labelVariants.variant[variant],
          labelVariants.size[size],
          className
        )}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };
