// src/app/(dashboard)/productos/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  MapPinIcon,
  CubeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  Producto,
  TIPOS_PRODUCTO,
  TIPO_COLORS,
  MAGNITUDES_PRODUCTO
} from '@/types/productos';
import { useAuthStore } from '@/stores/authStore';

import {authService} from '@/lib/auth/authService';   
const cookieUser = authService.getUserInfoFromCookie();
console.log("cookieUser en productos/page.tsx:", cookieUser);
        if (cookieUser ) {
          console.log(`👤 useAuth: Usuario encontrado en cookies: ${cookieUser.nombre_usuario}`);
}



export default function DetalleProductoPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const productId = parseInt(params.id as string);
  
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Obtener producto
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
          setProducto(result.data);
        } else {
          throw new Error(result.message || 'Error al obtener producto');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error fetching producto:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [productId]);

  // Eliminar producto
  const handleDelete = async () => {
    if (!producto) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/productos/${producto.id_producto}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar producto');
      }

      const result = await response.json();

      if (result.success) {
        router.push('/dashboard/productos');
      } else {
        throw new Error(result.message || 'Error al eliminar producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Formatear moneda
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'No definido';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener label de tipo
  const getTipoLabel = (tipo: string) => {
    return TIPOS_PRODUCTO.find(t => t.value === tipo)?.label || tipo;
  };

  // Obtener label de magnitud
  const getMagnitudLabel = (magnitud: string) => {
    return MAGNITUDES_PRODUCTO.find(m => m.value === magnitud)?.label || magnitud;
  };

  // Estados de carga
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              <div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error && !producto) {
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
          <h1 className="text-2xl font-bold text-gray-900">Detalle de Producto</h1>
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

  if (!producto) return null;

  // Verificar permisos para editar/eliminar
  //const canEdit = user?.tipo_usuario === 0 || user?.tipo_usuario === 5;
  const canEdit = cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 5;


  return (
    <div className="p-6 max-w-6xl mx-auto">
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
            <h1 className="text-2xl font-bold text-gray-900">{producto.nombre_producto}</h1>
            <p className="text-gray-600">Código: {producto.codigo_producto}</p>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/dashboard/productos/${producto.id_producto}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
              Editar
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Alerta de error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${TIPO_COLORS[producto.tipo_producto]}`}>
                    {getTipoLabel(producto.tipo_producto)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Categoría</label>
                <p className="text-gray-900 font-medium">{producto.categoria_producto}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Proveedor</label>
                <p className="text-gray-900 font-medium">{producto.proveedor_producto}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Unidad de Medida</label>
                <p className="text-gray-900 font-medium">{getMagnitudLabel(producto.magnitud_producto)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  producto.estado_producto === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {producto.estado_producto === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Control de Lote</label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  producto.requiere_lote ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {producto.requiere_lote ? 'Requerido' : 'No requerido'}
                </span>
              </div>
            </div>

            {producto.descripcion_producto && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500 mb-1">Descripción</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{producto.descripcion_producto}</p>
              </div>
            )}
          </div>

          {/* Información económica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5" />
              Información Económica
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-blue-700 mb-1">Costo Unitario</label>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(producto.costo_unitario)}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-green-700 mb-1">Precio Referencial</label>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(producto.precio_referencial)}</p>
              </div>
            </div>
          </div>

          {/* Control de inventario */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CubeIcon className="w-5 h-5" />
              Control de Inventario
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-yellow-700">Stock Mínimo</p>
                <p className="text-2xl font-bold text-yellow-900">{producto.stock_minimo}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-green-700">Stock Máximo</p>
                <p className="text-2xl font-bold text-green-900">{producto.stock_maximo}</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-red-700">Stock Crítico</p>
                <p className="text-2xl font-bold text-red-900">{producto.stock_critico}</p>
              </div>
            </div>

            {producto.dias_vida_util > 0 && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">
                    Vida Útil: {producto.dias_vida_util} días
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Imagen del producto */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagen</h3>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              {producto.url_foto_producto ? (
                <img 
                  src={producto.url_foto_producto} 
                  alt={producto.nombre_producto}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Sin imagen</p>
                </div>
              )}
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" />
              Ubicación
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-mono text-lg text-center">
                {producto.ubicacion_fisica}
              </p>
            </div>
          </div>

          {/* Información de auditoría */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Auditoría
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Creado por</label>
                <p className="text-gray-900 font-medium">{producto.created_by_name}</p>
                <p className="text-sm text-gray-500">{formatDate(producto.created_at)}</p>
              </div>

              {producto.updated_at && producto.updated_by_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Última modificación</label>
                  <p className="text-gray-900 font-medium">{producto.updated_by_name}</p>
                  <p className="text-sm text-gray-500">{formatDate(producto.updated_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el producto <strong>{producto.nombre_producto}</strong>? 
              Esta acción no se puede deshacer.
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}