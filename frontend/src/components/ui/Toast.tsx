"use client";
import React from 'react';
import { cn } from '../../lib/utils/cn';
import { Button } from '../commons';

/**
 * Sistema de notificaciones Toast
 * Proporciona feedback visual para acciones del usuario
 */

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  //duration: number;

  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  action,
  onClose,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  React.useEffect(() => {
    // Mostrar toast con animación
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose(id);
    }, 200); // Duración de la animación de salida
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-success-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-danger-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-warning-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-success-50 border-success-200';
      case 'error': return 'bg-danger-50 border-danger-200';
      case 'warning': return 'bg-warning-50 border-warning-200';
      case 'info': return 'bg-primary-50 border-primary-200';
    }
  };

  return (
    <div
      className={cn(
        'max-w-sm w-full shadow-lg rounded-lg border pointer-events-auto ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out transform',
        getBackgroundColor(),
        isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isRemoving && 'scale-95'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className={cn(
                'text-sm font-medium',
                type === 'success' && 'text-success-800',
                type === 'error' && 'text-danger-800',
                type === 'warning' && 'text-warning-800',
                type === 'info' && 'text-primary-800'
              )}>
                {title}
              </p>
            )}
            
            <p className={cn(
              'text-sm',
              title ? 'mt-1' : '',
              type === 'success' && 'text-success-700',
              type === 'error' && 'text-danger-700',
              type === 'warning' && 'text-warning-700',
              type === 'info' && 'text-primary-700'
            )}>
              {message}
            </p>
            
            {action && (
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={action.onClick}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-auto p-0',
                    type === 'success' && 'text-success-800 hover:text-success-900',
                    type === 'error' && 'text-danger-800 hover:text-danger-900',
                    type === 'warning' && 'text-warning-800 hover:text-warning-900',
                    type === 'info' && 'text-primary-800 hover:text-primary-900'
                  )}
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className={cn(
                'h-auto p-1',
                type === 'success' && 'text-success-400 hover:text-success-500',
                type === 'error' && 'text-danger-400 hover:text-danger-500',
                type === 'warning' && 'text-warning-400 hover:text-warning-500',
                type === 'info' && 'text-primary-400 hover:text-primary-500'
              )}
              title="Cerrar"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Container
export interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
}) => {
  return (
    <div
      aria-live="assertive"
      className={cn(
        'fixed inset-0 z-50 flex flex-col pointer-events-none',
        position === 'top-right' && 'items-end justify-start p-6 space-y-4',
        position === 'top-left' && 'items-start justify-start p-6 space-y-4',
        position === 'bottom-right' && 'items-end justify-end p-6 space-y-reverse space-y-4',
        position === 'bottom-left' && 'items-start justify-end p-6 space-y-reverse space-y-4',
        position === 'top-center' && 'items-center justify-start p-6 space-y-4',
        position === 'bottom-center' && 'items-center justify-end p-6 space-y-reverse space-y-4'
      )}
    >
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          {...toast}
          onClose={onRemove}
        />
      ))}
    </div>
  );
};

// Hook para manejar toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      //duration: toast.duration || 5000,
      duration: toast.duration ?? 5000,

    };

    setToasts(prev => [...prev, newToast]);

    //const duration = newToast.duration ?? 3000; // 3000ms si no hay duración


    // Auto-remove después del duration
    /*
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
      */
    if ((newToast.duration ?? 0) > 0) {
       setTimeout(() => removeToast(id), newToast.duration as number);
   }

    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  // Funciones de conveniencia
  const success = React.useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, type: 'success', message });
  }, [addToast]);

  const error = React.useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, type: 'error', message });
  }, [addToast]);

  const warning = React.useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, type: 'warning', message });
  }, [addToast]);

  const info = React.useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, type: 'info', message });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info,
  };
}

// Toast Provider Context
const ToastContext = React.createContext<ReturnType<typeof useToast> | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastContainerProps['position'];
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children, position }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} position={position} />
    </ToastContext.Provider>
  );
};

// Hook para usar el contexto de toast
export const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext debe ser usado dentro de un ToastProvider');
  }
  return context;
};

export { ToastContainer, ToastComponent };