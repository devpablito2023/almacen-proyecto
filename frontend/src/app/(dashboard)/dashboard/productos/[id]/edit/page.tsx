// src/app/(dashboard)/productos/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { 
  Producto,
  ProductoUpdate,
  TIPOS_PRODUCTO,
  CATEGORIAS_PRODUCTO,
  MAGNITUDES_PRODUCTO,
  TipoProducto
} from '@/types/productos';
import { useAuthStore } from '@/stores/authStore';

import {authService} from '@/lib/auth/authService';   
const cookieUser = authService.getUserInfoFromCookie();
console.log("cookieUser en productos/page.tsx:", cookieUser);
        if (cookieUser ) {
          console.log(`👤 useAuth: Usuario encontrado en cookies: ${cookieUser.nombre_usuario}`);
}



export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const productId = parseInt(params.id as string);
  
  const [originalProduct, setOriginalProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<ProductoUpdate>({});

  // Errores de validación
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Cargar producto original
  useEffect(() => {
    const fetchProducto = async () => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/productos/${productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Producto no encontrado');
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          const producto = result.data;
          setOriginalProduct(producto);
          
          // Inicializar formulario con datos del producto
          setFormData({
            codigo_producto: producto.codigo_producto,
            nombre_producto: producto.nombre_producto,
            tipo_producto: producto.tipo_producto,
            categoria_producto: producto.categoria_producto,
            proveedor_producto: producto.proveedor_producto,
            costo_unitario: producto.costo_unitario,
            precio_referencial: producto.precio_referencial,
            ubicacion_fisica: producto.ubicacion_fisica,
            stock_minimo: producto.stock_minimo,
            stock_maximo: producto.stock_maximo,
            stock_critico: producto.stock_critico,
            estado_producto: producto.estado_producto,
            descripcion_producto: producto.descripcion_producto,
            magnitud_producto: producto.magnitud_producto,
            requiere_lote: producto.requiere_lote,
            dias_vida_util: producto.dias_vida_util,
            url_foto_producto: producto.url_foto_producto
          });
        } else {
          throw new Error(result.message || 'Error al obtener producto');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [productId]);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (!originalProduct) return;

    const hasChanged = 
      formData.codigo_producto !== originalProduct.codigo_producto ||
      formData.nombre_producto !== originalProduct.nombre_producto ||
      formData.tipo_producto !== originalProduct.tipo_producto ||
      formData.categoria_producto !== originalProduct.categoria_producto ||
      formData.proveedor_producto !== originalProduct.proveedor_producto ||
      formData.costo_unitario !== originalProduct.costo_unitario ||
      formData.precio_referencial !== originalProduct.precio_referencial ||
      formData.ubicacion_fisica !== originalProduct.ubicacion_fisica ||
      formData.stock_minimo !== originalProduct.stock_minimo ||
      formData.stock_maximo !== originalProduct.stock_maximo ||
      formData.stock_critico !== originalProduct.stock_critico ||
      formData.estado_producto !== originalProduct.estado_producto ||
      formData.descripcion_producto !== originalProduct.descripcion_producto ||
      formData.magnitud_producto !== originalProduct.magnitud_producto ||
      formData.requiere_lote !== originalProduct.requiere_lote ||
      formData.dias_vida_util !== originalProduct.dias_vida_util;

    setHasChanges(hasChanged);
  }, [formData, originalProduct]);

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.codigo_producto?.trim()) {
      errors.codigo_producto = 'El código es requerido';
    } else if (!/^[A-Z0-9-_]{3,20}$/.test(formData.codigo_producto)) {
      errors.codigo_producto = 'Código inválido. Use mayúsculas, números, guiones (3-20 caracteres)';
    }

    if (!formData.nombre_producto?.trim()) {
      errors.nombre_producto = 'El nombre es requerido';
    } else if (formData.nombre_producto.length < 3) {
      errors.nombre_producto = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.categoria_producto) {
      errors.categoria_producto = 'La categoría es requerida';
    }

    if (!formData.proveedor_producto?.trim()) {
      errors.proveedor_producto = 'El proveedor es requerido';
    }

    if (!formData.ubicacion_fisica?.trim()) {
      errors.ubicacion_fisica = 'La ubicación física es requerida';
    }

    if (formData.costo_unitario !== undefined && formData.costo_unitario !== null && formData.costo_unitario < 0) {
      errors.costo_unitario = 'El costo debe ser mayor o igual a 0';
    }

    if (formData.precio_referencial !== undefined && formData.precio_referencial !== null && formData.precio_referencial < 0) {
      errors.precio_referencial = 'El precio debe ser mayor o igual a 0';
    }

    if (formData.stock_minimo !== undefined && formData.stock_minimo < 0) {
      errors.stock_minimo = 'El stock mínimo debe ser mayor o igual a 0';
    }

    if (formData.stock_maximo !== undefined && formData.stock_maximo < 1) {
      errors.stock_maximo = 'El stock máximo debe ser mayor a 0';
    }

    if (formData.stock_maximo !== undefined && formData.stock_minimo !== undefined && 
        formData.stock_maximo < formData.stock_minimo) {
      errors.stock_maximo = 'El stock máximo debe ser mayor o igual al stock mínimo';
    }

    if (formData.stock_critico !== undefined && formData.stock_critico < 0) {
      errors.stock_critico = 'El stock crítico debe ser mayor o igual a 0';
    }

    if (formData.dias_vida_util !== undefined && formData.dias_vida_util < 0) {
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
      [name]: type === 'number' ? (parseFloat(value) || 0) : value
    }));

    // Limpiar error del campo si existe
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Limpiar mensajes de estado
    setError(null);
    setSuccess(false);
  };

  // Manejar checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
    setError(null);
    setSuccess(false);
  };

  // Restaurar valores originales
  const handleReset = () => {
    if (!originalProduct) return;

    setFormData({
      codigo_producto: originalProduct.codigo_producto,
      nombre_producto: originalProduct.nombre_producto,
      tipo_producto: originalProduct.tipo_producto,
      categoria_producto: originalProduct.categoria_producto,
      proveedor_producto: originalProduct.proveedor_producto,
      costo_unitario: originalProduct.costo_unitario,
      precio_referencial: originalProduct.precio_referencial,
      ubicacion_fisica: originalProduct.ubicacion_fisica,
      stock_minimo: originalProduct.stock_minimo,
      stock_maximo: originalProduct.stock_maximo,
      stock_critico: originalProduct.stock_critico,
      estado_producto: originalProduct.estado_producto,
      descripcion_producto: originalProduct.descripcion_producto,
      magnitud_producto: originalProduct.magnitud_producto,
      requiere_lote: originalProduct.requiere_lote,
      dias_vida_util: originalProduct.dias_vida_util,
      url_foto_producto: originalProduct.url_foto_producto
    });
    
    setFieldErrors({});
    setError(null);
    setSuccess(false);
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hasChanges) {
      setError('No se detectaron cambios para guardar');
      return;
    }

    setSaveLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/productos/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar producto');
      }

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setOriginalProduct(result.data);
        setHasChanges(false);
        
        setTimeout(() => {
          router.push(`/dashboard/productos/${productId}`);
        }, 2000);
      } else {
        throw new Error(result.message || 'Error al actualizar producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
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
              <p className="text-red-700">No tienes permisos para editar productos.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error sin producto
  if (error && !originalProduct) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-red-900">Error al cargar producto</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!originalProduct) return null;

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
            <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
            <p className="text-gray-600">{originalProduct.nombre_producto} - {originalProduct.codigo_producto}</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/dashboard/productos/${productId}`)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <EyeIcon className="w-5 h-5" />
          Ver Detalle
        </button>
      </div>

      {/* Indicador de cambios */}
      {hasChanges && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3" />
              <p className="text-yellow-800">Tienes cambios sin guardar</p>
            </div>
            <button
              onClick={handleReset}
              className="text-yellow-600 hover:text-yellow-800 underline text-sm"
            >
              Descartar cambios
            </button>
          </div>
        </div>
      )}

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
              <p className="text-green-700">Producto actualizado correctamente. Redirigiendo...</p>
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
                  value={formData.codigo_producto || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: PRD-001"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.codigo_producto ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saveLoading}
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
                  value={formData.nombre_producto || ''}
                  onChange={handleInputChange}
                  placeholder="Nombre descriptivo del producto"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.nombre_producto ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saveLoading}
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
                  value={formData.tipo_producto || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saveLoading}
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
                  value={formData.categoria_producto || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.categoria_producto ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saveLoading}
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
                  value={formData.proveedor_producto || ''}
                  onChange={handleInputChange}
                  placeholder="Nombre del proveedor"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.proveedor_producto ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saveLoading}
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
                  value={formData.magnitud_producto || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saveLoading}
                >
                  {MAGNITUDES_PRODUCTO.map(magnitud => (
                    <option key={magnitud.value} value={magnitud.value}>{magnitud.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="estado_producto"
                  value={formData.estado_producto || 1}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saveLoading}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
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
                  value={formData.costo_unitario || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.costo_unitario ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saveLoading}
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
                  value={formData.precio_referencial || 0}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.precio_referencial ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saveLoading}
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
                  value={formData.stock_minimo || 0}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.stock_minimo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saveLoading}
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
                  value={formData.stock_maximo || 0}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.stock_maximo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saveLoading}
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
                  value={formData.stock_critico || 0}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.stock_critico ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saveLoading}
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
                  value={formData.ubicacion_fisica || ''}
                  onChange={handleInputChange}
                  placeholder="Ej: A-01-B (Pasillo-Estante-Nivel)"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.ubicacion_fisica ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={saveLoading}
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
                  value={formData.descripcion_producto || ''}
                  onChange={handleInputChange}
                  placeholder="Descripción detallada del producto"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saveLoading}
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
                    value={formData.dias_vida_util || 0}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.dias_vida_util ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={saveLoading}
                  />
                  {fieldErrors.dias_vida_util && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.dias_vida_util}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requiere_lote"
                    checked={formData.requiere_lote || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={saveLoading}
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">
                    Requiere control de lote
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={saveLoading}
              >
                Cancelar
              </button>
              
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-sm text-yellow-600 hover:text-yellow-800 underline"
                  disabled={saveLoading}
                >
                  Descartar cambios
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/productos/${productId}`)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={saveLoading}
              >
                <EyeIcon className="w-4 h-4" />
                Ver Detalle
              </button>
              
              <button
                type="submit"
                disabled={saveLoading || !hasChanges}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>

          {/* Información de auditoría */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Información de Auditoría</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Creado por:</span> {originalProduct.created_by_name}
                <br />
                <span className="font-medium">Fecha:</span> {new Date(originalProduct.created_at).toLocaleString('es-PE')}
              </div>
              {originalProduct.updated_at && originalProduct.updated_by_name && (
                <div>
                  <span className="font-medium">Última modificación:</span> {originalProduct.updated_by_name}
                  <br />
                  <span className="font-medium">Fecha:</span> {new Date(originalProduct.updated_at).toLocaleString('es-PE')}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}