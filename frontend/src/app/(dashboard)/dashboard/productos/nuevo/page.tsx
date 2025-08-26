// src/app/(dashboard)/productos/nuevo/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  ProductoCreate,
  TIPOS_PRODUCTO,
  CATEGORIAS_PRODUCTO,
  MAGNITUDES_PRODUCTO
} from '@/types/productos';
import { useAuthStore } from '@/stores/authStore';

import {authService} from '@/lib/auth/authService';   
const cookieUser = authService.getUserInfoFromCookie();
console.log("cookieUser en productos/page.tsx:", cookieUser);
        if (cookieUser ) {
          console.log(`👤 useAuth: Usuario encontrado en cookies: ${cookieUser.nombre_usuario}`);
}


export default function NuevoProductoPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<ProductoCreate>({
    codigo_producto: '',
    nombre_producto: '',
    tipo_producto: 'insumo',
    categoria_producto: '',
    proveedor_producto: '',
    costo_unitario: 0,
    precio_referencial: 0,
    ubicacion_fisica: '',
    stock_minimo: 1,
    stock_maximo: 100,
    stock_critico: 0,
    descripcion_producto: '',
    magnitud_producto: 'UND',
    requiere_lote: false,
    dias_vida_util: 0
  });

  // Errores de validación
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.codigo_producto.trim()) {
      errors.codigo_producto = 'El código es requerido';
    } else if (!/^[A-Z0-9-_]{3,20}$/.test(formData.codigo_producto)) {
      errors.codigo_producto = 'Código inválido. Use mayúsculas, números, guiones (3-20 caracteres)';
    }

    if (!formData.nombre_producto.trim()) {
      errors.nombre_producto = 'El nombre es requerido';
    } else if (formData.nombre_producto.length < 3) {
      errors.nombre_producto = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.categoria_producto) {
      errors.categoria_producto = 'La categoría es requerida';
    }

    if (!formData.proveedor_producto.trim()) {
      errors.proveedor_producto = 'El proveedor es requerido';
    }

    if (!formData.ubicacion_fisica.trim()) {
      errors.ubicacion_fisica = 'La ubicación física es requerida';
    }

    if (formData.costo_unitario < 0) {
      errors.costo_unitario = 'El costo debe ser mayor o igual a 0';
    }

    if (formData.precio_referencial < 0) {
      errors.precio_referencial = 'El precio debe ser mayor o igual a 0';
    }

    if (formData.stock_minimo < 0) {
      errors.stock_minimo = 'El stock mínimo debe ser mayor o igual a 0';
    }

    if (formData.stock_maximo < 1) {
      errors.stock_maximo = 'El stock máximo debe ser mayor a 0';
    }

    if (formData.stock_maximo < formData.stock_minimo) {
      errors.stock_maximo = 'El stock máximo debe ser mayor o igual al stock mínimo';
    }

    if (formData.stock_critico < 0) {
      errors.stock_critico = 'El stock crítico debe ser mayor o igual a 0';
    }

    if (formData.dias_vida_util < 0) {
      errors.dias_vida_util = 'Los días de vida útil deben ser mayor o igual a 0';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Limpiar error del campo si existe
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear producto');
      }

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/productos');
        }, 2000);
      } else {
        throw new Error(result.message || 'Error al crear producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verificar permisos
  //if (user?.tipo_usuario !== 0 && user?.tipo_usuario !== 5) {
  if (cookieUser?.tipo_usuario !== 0 && cookieUser?.tipo_usuario !== 5) {

    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-900">Acceso Denegado</h3>
              <p className="text-red-700">No tienes permisos para crear productos.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Producto</h1>
            <p className="text-gray-600">Registra un nuevo producto en el almacén</p>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-green-900">¡Éxito!</h3>
              <p className="text-green-700">Producto creado correctamente. Redirigiendo...</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código del Producto *
                </label>
                <input
                  type="text"
                  name="codigo_producto"
                  value={formData.codigo_producto}
                  onChange={handleInputChange}
                  placeholder="Ej: PRD-001"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.codigo_producto ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {fieldErrors.codigo_producto && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.codigo_producto}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombre_producto"
                  value={formData.nombre_producto}
                  onChange={handleInputChange}
                  placeholder="Nombre descriptivo del producto"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.nombre_producto ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {fieldErrors.nombre_producto && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.nombre_producto}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Producto *
                </label>
                <select
                  name="tipo_producto"
                  value={formData.tipo_producto}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  {TIPOS_PRODUCTO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoria_producto"
                  value={formData.categoria_producto}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.categoria_producto ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIAS_PRODUCTO.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
                {fieldErrors.categoria_producto && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.categoria_producto}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor *
                </label>
                <input
                  type="text"
                  name="proveedor_producto"
                  value={formData.proveedor_producto}
                  onChange={handleInputChange}
                  placeholder="Nombre del proveedor"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.proveedor_producto ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {fieldErrors.proveedor_producto && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.proveedor_producto}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de Medida
                </label>
                <select
                  name="magnitud_producto"
                  value={formData.magnitud_producto}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  {MAGNITUDES_PRODUCTO.map(magnitud => (
                    <option key={magnitud.value} value={magnitud.value}>{magnitud.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Información económica */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Económica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo Unitario (S/)
                </label>
                <input
                  type="number"
                  name="costo_unitario"
                  value={formData.costo_unitario}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.costo_unitario ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {fieldErrors.costo_unitario && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.costo_unitario}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Referencial (S/)
                </label>
                <input
                  type="number"
                  name="precio_referencial"
                  value={formData.precio_referencial}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.precio_referencial ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {fieldErrors.precio_referencial && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.precio_referencial}</p>
                )}
              </div>
            </div>
          </div>

          {/* Control de inventario */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Control de Inventario</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  name="stock_minimo"
                  value={formData.stock_minimo}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.stock_minimo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {fieldErrors.stock_minimo && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.stock_minimo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Máximo
                </label>
                <input
                  type="number"
                  name="stock_maximo"
                  value={formData.stock_maximo}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.stock_maximo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {fieldErrors.stock_maximo && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.stock_maximo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Crítico
                </label>
                <input
                  type="number"
                  name="stock_critico"
                  value={formData.stock_critico}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.stock_critico ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {fieldErrors.stock_critico && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.stock_critico}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación Física *
                </label>
                <input
                  type="text"
                  name="ubicacion_fisica"
                  value={formData.ubicacion_fisica}
                  onChange={handleInputChange}
                  placeholder="Ej: A-01-B (Pasillo-Estante-Nivel)"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.ubicacion_fisica ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {fieldErrors.ubicacion_fisica && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.ubicacion_fisica}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion_producto"
                  value={formData.descripcion_producto}
                  onChange={handleInputChange}
                  placeholder="Descripción detallada del producto"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días de Vida Útil
                  </label>
                  <input
                    type="number"
                    name="dias_vida_util"
                    value={formData.dias_vida_util}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.dias_vida_util ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {fieldErrors.dias_vida_util && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.dias_vida_util}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requiere_lote"
                    checked={formData.requiere_lote}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">
                    Requiere control de lote
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : (
                'Crear Producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}