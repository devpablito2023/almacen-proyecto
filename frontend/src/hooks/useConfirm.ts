// src/hooks/useConfirm.ts
import { useState, useCallback } from 'react';
import { ConfirmModalType } from '@/components/ui/ConfirmModal';

interface ConfirmOptions {
  title: string;
  message: string;
  type?: ConfirmModalType;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  type: ConfirmModalType;
  confirmText?: string;
  cancelText: string;
  loading: boolean;
  resolve?: (value: boolean) => void;
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    cancelText: 'Cancelar',
    loading: false,
  });

  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title,
        message: options.message,
        type: options.type || 'info',
        confirmText: options.confirmText,
        cancelText: options.cancelText || 'Cancelar',
        loading: false,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    setConfirmState(prev => ({ ...prev, loading: true }));
    
    // Simular un pequeño delay para mostrar el loading
    await new Promise(resolve => setTimeout(resolve, 300));
    
    confirmState.resolve?.(true);
    setConfirmState(prev => ({ 
      ...prev, 
      isOpen: false, 
      loading: false, 
      resolve: undefined 
    }));
  }, [confirmState.resolve]);

  const handleClose = useCallback(() => {
    confirmState.resolve?.(false);
    setConfirmState(prev => ({ 
      ...prev, 
      isOpen: false, 
      loading: false, 
      resolve: undefined 
    }));
  }, [confirmState.resolve]);

  const setLoading = useCallback((loading: boolean) => {
    setConfirmState(prev => ({ ...prev, loading }));
  }, []);

  return {
    confirmState,
    showConfirm,
    handleConfirm,
    handleClose,
    setLoading,
  };
}
