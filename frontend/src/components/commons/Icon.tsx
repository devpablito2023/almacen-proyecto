import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils/cn';
import * as LucideIcons from 'lucide-react';

/**
 * Componente Icon primitivo con Lucide React SVG
 * Wrapper optimizado para iconos con TailwindCSS + Framer Motion
 * 
 * Ventajas de Lucide React:
 * - SVG nativo (escalable, ligero)
 * - Tree-shaking (solo importa iconos usados)
 * - 1400+ iconos consistentes
 * - TypeScript completo
 */

export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  /** Nombre del icono de Lucide React */
  name: keyof typeof LucideIcons;
  /** Tamaño del icono con sistema de design tokens */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Variante de color usando sistema de colores Tailwind */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted';
  /** Habilitar animaciones con Framer Motion */
  animated?: boolean;
  /** Animación de rotación continua */
  spin?: boolean;
  /** Stroke width para ajustar grosor del SVG */
  strokeWidth?: number;
}

// Tamaños usando design tokens de Tailwind (en pixels para Lucide)
const iconSizes = {
  xs: 12,   // w-3 h-3
  sm: 16,   // w-4 h-4
  md: 20,   // w-5 h-5
  lg: 24,   // w-6 h-6
  xl: 32,   // w-8 h-8
  '2xl': 40, // w-10 h-10
};

// Variantes de color usando sistema Tailwind
const iconVariants = {
  variant: {
    default: 'text-gray-600',
    primary: 'text-blue-600 hover:text-blue-700',
    secondary: 'text-purple-600 hover:text-purple-700',
    success: 'text-green-600 hover:text-green-700',
    warning: 'text-yellow-600 hover:text-yellow-700',
    error: 'text-red-600 hover:text-red-700',
    muted: 'text-gray-400 hover:text-gray-500',
  },
};

const Icon = React.forwardRef<HTMLElement, IconProps>(
  ({ 
    className, 
    name,
    size = 'md',
    variant = 'default',
    animated = false,
    spin = false,
    strokeWidth = 2,
    ...props 
  }, ref) => {
    const IconComponent = LucideIcons[name] as React.ComponentType<any>;
    
    if (!IconComponent) {
      console.warn(`Icon "${name}" not found in lucide-react`);
      return null;
    }

    const iconProps = {
      size: iconSizes[size],
      strokeWidth,
      className: cn(
        'inline-block transition-colors duration-200',
        iconVariants.variant[variant],
        spin && 'animate-spin',
        className
      ),
      ...props,
    };

    if (animated) {
      return (
        <motion.div
          ref={ref as any}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.1 }}
          className="inline-flex"
        >
          <IconComponent {...iconProps} />
        </motion.div>
      );
    }

    return <IconComponent ref={ref} {...iconProps} />;
  }
);

Icon.displayName = 'Icon';

export { Icon };
