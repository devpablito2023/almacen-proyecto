'use client';

import React, { useEffect } from 'react';
import { Button } from '../commons';

export type ConfirmModalType = 'delete' | 'restore' | 'create' | 'edit' | 'save' | 'cancel' | 'warning' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: ConfirmModalType;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText,
  cancelText = 'Cancelar',
  loading = false
}) => {
  // Manejar ESC para cerrar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Configuración según el tipo
  const getModalConfig = (modalType: ConfirmModalType) => {
    switch (modalType) {
      case 'delete':
        return {
          icon: '🗑️',
          iconBgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmButtonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          defaultConfirmText: 'Eliminar'
        };
      case 'restore':
        return {
          icon: '↺',
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmButtonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          defaultConfirmText: 'Restablecer'
        };
      case 'create':
        return {
          icon: '➕',
          iconBgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          confirmButtonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          defaultConfirmText: 'Crear'
        };
      case 'edit':
        return {
          icon: '✏️',
          iconBgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmButtonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          defaultConfirmText: 'Editar'
        };
      case 'save':
        return {
          icon: '✅',
          iconBgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          confirmButtonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          defaultConfirmText: 'Guardar'
        };
      case 'cancel':
        return {
          icon: '❌',
          iconBgColor: 'bg-gray-100',
          iconColor: 'text-gray-600',
          confirmButtonColor: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
          defaultConfirmText: 'Cancelar'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmButtonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          defaultConfirmText: 'Continuar'
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmButtonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          defaultConfirmText: 'Aceptar'
        };
    }
  };

  const config = getModalConfig(type);
  const finalConfirmText = confirmText || config.defaultConfirmText;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Modal content */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* Icon */}
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${config.iconBgColor} sm:mx-0 sm:h-10 sm:w-10`}>
                <span className={`text-lg ${config.iconColor}`}>
                  {config.icon}
                </span>
              </div>

              {/* Content */}
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3
                  className="text-base font-semibold leading-6 text-gray-900"
                  id="modal-title"
                >
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <Button
              variant={type === 'delete' ? 'danger' : 'primary'}
              onClick={handleConfirm}
              disabled={loading}
              isLoading={loading}
              loadingText="Procesando..."
              className="w-full sm:ml-3 sm:w-auto"
            >
              {finalConfirmText}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
