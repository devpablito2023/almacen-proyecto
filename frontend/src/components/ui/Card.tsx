import React from 'react';
import { cn } from '../../lib/utils/cn';

/**
 * Componente Card base con variantes
 * Contenedor principal para mostrar información agrupada
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    padding = 'md',
    hoverable = false,
    children,
    ...props
  }, ref) => {
    return (
      <div
        className={cn(
          // Base styles
          'rounded-lg transition-all duration-200',
          
          // Variants
          variant === 'default' && 'bg-white shadow-soft border border-gray-200',
          variant === 'bordered' && 'bg-white border-2 border-gray-200',
          variant === 'elevated' && 'bg-white shadow-lg border border-gray-100',
          variant === 'flat' && 'bg-gray-50 border border-gray-200',
          
          // Padding
          padding === 'none' && 'p-0',
          padding === 'sm' && 'p-4',
          padding === 'md' && 'p-6',
          padding === 'lg' && 'p-8',
          
          // Hoverable effect
          hoverable && 'hover:shadow-md hover:scale-[1.01] cursor-pointer',
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center justify-between border-b border-gray-200 pb-4 mb-4',
          className
        )}
        ref={ref}
        {...props}
      >
        {children || (
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Body component
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('text-gray-700', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// Card Footer component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between';
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, justify = 'end', ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center border-t border-gray-200 pt-4 mt-4',
          justify === 'start' && 'justify-start',
          justify === 'center' && 'justify-center',
          justify === 'end' && 'justify-end',
          justify === 'between' && 'justify-between',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Stat Card component (para métricas del dashboard)
export interface StatCardProps extends Omit<CardProps, 'children'> {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  description?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, change, icon, description, ...cardProps }, ref) => {
    return (
      <Card ref={ref} {...cardProps}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 truncate">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {value}
            </p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>
          
          {icon && (
            <div className="flex-shrink-0 ml-4">
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <div className="text-primary-600">
                  {icon}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {change && (
          <div className="mt-4 flex items-center">
            <div className={cn(
              'flex items-center text-sm font-medium',
              change.type === 'increase' && 'text-success-600',
              change.type === 'decrease' && 'text-danger-600',
              change.type === 'neutral' && 'text-gray-600'
            )}>
              {change.type === 'increase' && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {change.type === 'decrease' && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {Math.abs(change.value)}%
              {change.period && <span className="ml-1 text-gray-500">vs {change.period}</span>}
            </div>
          </div>
        )}
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export { Card, CardHeader, CardBody, CardFooter, StatCard };