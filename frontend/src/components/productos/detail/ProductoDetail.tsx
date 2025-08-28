'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  MAGNITUDES_PRODUCTO,
  ProductoDetailProps
} from '@/types/productos';
import { authService } from '@/lib/auth/authService';
import { Button } from '../../commons';
import ProductoInfo from './ProductoInfo';
import ProductoActions from './ProductoActions';
import ProductoDeleteModal from './ProductoDeleteModal';
import LoadingSpinner from '../../stock/LoadingSpinner';
import ErrorAlert from '../../stock/ErrorAlert';

const cookieUser = authService.getUserInfoFromCookie();

export default function ProductoDetail({ productId }: ProductoDetailProps) {
  const router = useRouter();
  
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

  const handleBack = () => router.push('/dashboard/productos');
  const handleEdit = () => router.push(`/dashboard/productos/${productId}/edit`);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorAlert error={error} onClose={() => setError(null)} />
        <div className="mt-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
          >
            Volver a productos
          </Button>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Producto no encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">El producto solicitado no existe.</p>
          <div className="mt-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2 mx-auto text-blue-600 hover:text-blue-800"
              leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
            >
              Volver a productos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 5;
  const canDelete = cookieUser?.tipo_usuario === 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{producto.nombre_producto}</h1>
            <p className="text-gray-600">{producto.codigo_producto}</p>
          </div>
        </div>

        <ProductoActions
          onEdit={handleEdit}
          onDelete={() => setShowDeleteModal(true)}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>

      {/* Contenido principal */}
      <ProductoInfo producto={producto} />

      {/* Modal de eliminación */}
      <ProductoDeleteModal
        show={showDeleteModal}
        producto={producto}
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
