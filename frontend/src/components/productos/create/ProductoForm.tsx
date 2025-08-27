'use client';

import { useState } from 'react';
import { 
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  ProductoFormData,
  TIPOS_PRODUCTO,
  CATEGORIAS_PRODUCTO,
  MAGNITUDES_PRODUCTO,
  ProductoFormProps
} from '@/types/productos';

export default function ProductoForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  loading = false,
  submitText = 'Guardar'
}: ProductoFormProps) {
  const [formData, setFormData] = useState<ProductoFormData>({
    codigo_producto: initialData.codigo_producto || '',
    nombre_producto: initialData.nombre_producto || '',
    tipo_producto: initialData.tipo_producto || 'insumo',
    categoria_producto: initialData.categoria_producto || '',
    proveedor_producto: initialData.proveedor_producto || '',
    costo_unitario: initialData.costo_unitario || 0,
    precio_referencial: initialData.precio_referencial || 0,
    ubicacion_fisica: initialData.ubicacion_fisica || '',
    stock_minimo: initialData.stock_minimo || 1,
    stock_maximo: initialData.stock_maximo || 100,
    stock_critico: initialData.stock_critico || 0,
    descripcion_producto: initialData.descripcion_producto || '',
    magnitud_producto: initialData.magnitud_producto || 'UND',
    requiere_lote: initialData.requiere_lote || false,
    dias_vida_util: initialData.dias_vida_util || 0,
    fecha_vencimiento: initialData.fecha_vencimiento || '',
    lote_serie: initialData.lote_serie || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: keyof ProductoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones requeridas
    if (!formData.codigo_producto.trim()) {
      newErrors.codigo_producto = 'El código es requerido';
    }
    if (!formData.nombre_producto.trim()) {
      newErrors.nombre_producto = 'El nombre es requerido';
    }
    if (!formData.categoria_producto.trim()) {
      newErrors.categoria_producto = 'La categoría es requerida';
    }
    if (!formData.proveedor_producto.trim()) {
      newErrors.proveedor_producto = 'El proveedor es requerido';
    }
    if (!formData.ubicacion_fisica.trim()) {
      newErrors.ubicacion_fisica = 'La ubicación es requerida';
    }

    // Validaciones de números
    if (formData.costo_unitario <= 0) {
      newErrors.costo_unitario = 'El costo debe ser mayor a 0';
    }
    if (formData.stock_minimo < 0) {
      newErrors.stock_minimo = 'El stock mínimo no puede ser negativo';
    }
    if (formData.stock_maximo <= formData.stock_minimo) {
      newErrors.stock_maximo = 'El stock máximo debe ser mayor al mínimo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error general */}
      {submitError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código del Producto *
            </label>
            <input
              type="text"
              value={formData.codigo_producto}
              onChange={(e) => handleChange('codigo_producto', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.codigo_producto ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: PROD-001"
              disabled={isLoading}
            />
            {errors.codigo_producto && (
              <p className="text-sm text-red-600 mt-1">{errors.codigo_producto}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={formData.nombre_producto}
              onChange={(e) => handleChange('nombre_producto', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.nombre_producto ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nombre del producto"
              disabled={isLoading}
            />
            {errors.nombre_producto && (
              <p className="text-sm text-red-600 mt-1">{errors.nombre_producto}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Producto *
            </label>
            <select
              value={formData.tipo_producto}
              onChange={(e) => handleChange('tipo_producto', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              {TIPOS_PRODUCTO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              value={formData.categoria_producto}
              onChange={(e) => handleChange('categoria_producto', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.categoria_producto ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Seleccionar categoría</option>
              {CATEGORIAS_PRODUCTO.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            {errors.categoria_producto && (
              <p className="text-sm text-red-600 mt-1">{errors.categoria_producto}</p>
            )}
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor *
            </label>
            <input
              type="text"
              value={formData.proveedor_producto}
              onChange={(e) => handleChange('proveedor_producto', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.proveedor_producto ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nombre del proveedor"
              disabled={isLoading}
            />
            {errors.proveedor_producto && (
              <p className="text-sm text-red-600 mt-1">{errors.proveedor_producto}</p>
            )}
          </div>

          {/* Magnitud */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidad de Medida *
            </label>
            <select
              value={formData.magnitud_producto}
              onChange={(e) => handleChange('magnitud_producto', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              {MAGNITUDES_PRODUCTO.map((magnitud) => (
                <option key={magnitud.value} value={magnitud.value}>
                  {magnitud.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.descripcion_producto}
            onChange={(e) => handleChange('descripcion_producto', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descripción del producto"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Precios */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo Unitario *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.costo_unitario}
              onChange={(e) => handleChange('costo_unitario', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.costo_unitario ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.costo_unitario && (
              <p className="text-sm text-red-600 mt-1">{errors.costo_unitario}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Referencial
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.precio_referencial}
              onChange={(e) => handleChange('precio_referencial', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Control de Stock</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Mínimo *
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock_minimo}
              onChange={(e) => handleChange('stock_minimo', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.stock_minimo ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.stock_minimo && (
              <p className="text-sm text-red-600 mt-1">{errors.stock_minimo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Máximo *
            </label>
            <input
              type="number"
              min="1"
              value={formData.stock_maximo}
              onChange={(e) => handleChange('stock_maximo', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.stock_maximo ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.stock_maximo && (
              <p className="text-sm text-red-600 mt-1">{errors.stock_maximo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Crítico *
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock_critico}
              onChange={(e) => handleChange('stock_critico', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Ubicación y otros */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación y Datos Adicionales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación Física *
            </label>
            <input
              type="text"
              value={formData.ubicacion_fisica}
              onChange={(e) => handleChange('ubicacion_fisica', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.ubicacion_fisica ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Estante A1, Fila 2"
              disabled={isLoading}
            />
            {errors.ubicacion_fisica && (
              <p className="text-sm text-red-600 mt-1">{errors.ubicacion_fisica}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Días Vida Útil
            </label>
            <input
              type="number"
              min="0"
              value={formData.dias_vida_util}
              onChange={(e) => handleChange('dias_vida_util', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0 = Sin vencimiento"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Checkbox de requiere lote */}
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.requiere_lote}
              onChange={(e) => handleChange('requiere_lote', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Requiere control por lote/serie</span>
          </label>
        </div>

        {/* Campos adicionales si requiere lote */}
        {formData.requiere_lote && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lote/Serie
              </label>
              <input
                type="text"
                value={formData.lote_serie}
                onChange={(e) => handleChange('lote_serie', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Número de lote o serie"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Guardando...
            </div>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
}
