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
import { authService } from '@/lib/auth/authService';
import { Button } from '../../commons';
import ProductoForm from './ProductoForm';
import LoadingSpinner from '../../stock/LoadingSpinner';
import ErrorAlert from '../../stock/ErrorAlert';
import SuccessAlert from '../../stock/SuccessAlert';

const cookieUser = authService.getUserInfoFromCookie();

export default function ProductoCreateComponent() {
  const router = useRouter();
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
    dias_vida_util: 0,
  });

  const handleBack = () => router.push('/dashboard/productos');

  const handleSubmit = async (data: ProductoCreate) => {
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
        body: JSON.stringify(data),
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

  const canCreate = cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 5;

  if (!canCreate) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sin permisos</h3>
          <p className="mt-1 text-sm text-gray-500">No tienes permisos para crear productos.</p>
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

  if (success) {
    return (
      <div className="p-6">
        <SuccessAlert 
          message="Producto creado exitosamente. Redirigiendo..." 
          onClose={() => setSuccess(false)}
        />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Producto</h1>
            <p className="text-gray-600">Agrega un nuevo producto al inventario</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <ErrorAlert error={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="mb-6">
          <LoadingSpinner />
        </div>
      )}

      {/* Form */}
      <ProductoForm
        initialData={formData}
        onSubmit={handleSubmit}
        onCancel={handleBack}
        loading={loading}
        mode="create"
      />
    </div>
  );
}
