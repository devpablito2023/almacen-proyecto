import { useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface AdjustData {
  tipo_ajuste: 'positivo' | 'negativo';
  cantidad_ajuste: number;
  motivo: string;
}

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { producto_id: number; tipo_ajuste: 'positivo' | 'negativo'; cantidad_ajuste: number; motivo: string; }) => Promise<void>;
  productId: number | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export default function StockAdjustModal({
  isOpen,
  onClose,
  onSubmit,
  productId,
  loading,
  error,
  success
}: StockAdjustModalProps) {
  const [adjustData, setAdjustData] = useState<AdjustData>({
    tipo_ajuste: 'positivo',
    cantidad_ajuste: 0,
    motivo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    await onSubmit({
      producto_id: productId,
      tipo_ajuste: adjustData.tipo_ajuste,
      cantidad_ajuste: adjustData.cantidad_ajuste,
      motivo: adjustData.motivo
    });
  };

  const resetForm = () => {
    setAdjustData({
      tipo_ajuste: 'positivo',
      cantidad_ajuste: 0,
      motivo: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ajustar Stock</h3>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800 text-sm">Ajuste realizado exitosamente</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Ajuste
            </label>
            <select
              value={adjustData.tipo_ajuste}
              onChange={(e) => setAdjustData(prev => ({ ...prev, tipo_ajuste: e.target.value as 'positivo' | 'negativo' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="positivo">Ajuste Positivo (+)</option>
              <option value="negativo">Ajuste Negativo (-)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <input
              type="number"
              min="1"
              value={adjustData.cantidad_ajuste}
              onChange={(e) => setAdjustData(prev => ({ ...prev, cantidad_ajuste: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo *
            </label>
            <input
              type="text"
              value={adjustData.motivo}
              onChange={(e) => setAdjustData(prev => ({ ...prev, motivo: e.target.value }))}
              placeholder="Ej: Inventario físico, producto dañado, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || adjustData.cantidad_ajuste <= 0 || !adjustData.motivo.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  {adjustData.tipo_ajuste === 'positivo' ? (
                    <PlusIcon className="w-4 h-4" />
                  ) : (
                    <MinusIcon className="w-4 h-4" />
                  )}
                  Realizar Ajuste
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}