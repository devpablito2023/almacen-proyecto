import React from 'react';
import { cn } from '../../lib/utils/cn';

/**
 * Componente Input primitivo con validaciones y estados
 * Componente atómico base para inputs en todo el sistema
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'underlined';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    fullWidth = true,
    isLoading = false,
    disabled,
    id,
    ...props
  }, ref) => {
    const inputId = id || React.useId();
    const hasError = Boolean(error);
    
    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-2',
              hasError ? 'text-danger-600' : 'text-gray-700',
              disabled && 'text-gray-400'
            )}
          >
            {label}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className={cn(
                'text-gray-400',
                hasError && 'text-danger-400'
              )}>
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input */}
          <input
            type={type}
            id={inputId}
            className={cn(
              // Base styles
              'block w-full rounded-lg border transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
              
              // Variants
              variant === 'default' && [
                'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
                'focus:border-primary-500 focus:ring-primary-500',
                hasError && 'border-danger-300 focus:border-danger-500 focus:ring-danger-500',
              ],
              variant === 'filled' && [
                'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500',
                'focus:bg-white focus:border-primary-500 focus:ring-primary-500',
                hasError && 'bg-danger-50 border-danger-200 focus:border-danger-500 focus:ring-danger-500',
              ],
              variant === 'underlined' && [
                'bg-transparent border-0 border-b-2 rounded-none border-gray-300',
                'focus:border-primary-500 focus:ring-0',
                hasError && 'border-danger-300 focus:border-danger-500',
              ],
              
              // Padding adjustments for icons
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              !leftIcon && !rightIcon && 'px-3',
              
              // Size
              'py-2 text-sm',
              
              className
            )}
            disabled={disabled || isLoading}
            ref={ref}
            {...props}
          />

          {/* Right icon or loading */}
          {(rightIcon || isLoading) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4 text-gray-400"
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
              ) : (
                <span className={cn(
                  'text-gray-400',
                  hasError && 'text-danger-400'
                )}>
                  {rightIcon}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Helper text or error */}
        {(helperText || error) && (
          <p className={cn(
            'mt-1 text-sm',
            hasError ? 'text-danger-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Componentes especializados
export const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'leftIcon' | 'type'>>(
  (props, ref) => (
    <Input
      type="search"
      placeholder="Buscar..."
      leftIcon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      ref={ref}
      {...props}
    />
  )
);

export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightIcon'>>(
  (props, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <Input
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        }
        ref={ref}
        {...props}
      />
    );
  }
);

export const NumberInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ min, max, step = 1, ...props }, ref) => (
    <Input
      type="number"
      min={min}
      max={max}
      step={step}
      ref={ref}
      {...props}
    />
  )
);

SearchInput.displayName = 'SearchInput';
PasswordInput.displayName = 'PasswordInput';
NumberInput.displayName = 'NumberInput';

export { Input };
