'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductoEditProps, Producto, ProductoFormData } from '@/types/productos';
import { authService } from '@/lib/auth/authService';
import { Button } from '../../commons';
import ProductoForm from '../create/ProductoForm';
import LoadingSpinner from '../../stock/LoadingSpinner';
import ErrorAlert from '../../stock/ErrorAlert';

const cookieUser = authService.getUserInfoFromCookie();

export default function ProductoEdit({ productId, onSuccess, onCancel }: ProductoEditProps) {
  const router = useRouter();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del producto
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

  const handleSubmit = async (formData: ProductoFormData) => {
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
        if (onSuccess) {
          onSuccess(result.data);
        } else {
          router.push(`/dashboard/productos/${productId}`);
        }
      } else {
        throw new Error(result.message || 'Error al actualizar producto');
      }
    } catch (error) {
      throw error; // Re-throw para que ProductoForm maneje el error
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push(`/dashboard/productos/${productId}`);
    }
  };

  // Verificar permisos
  const canEdit = cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 5;
  
  if (!canEdit) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900">Sin permisos</h3>
          <p className="mt-1 text-sm text-gray-500">No tienes permisos para editar productos.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !producto) {
    return (
      <div className="p-6">
        <ErrorAlert error={error || 'Producto no encontrado'} onClose={() => setError(null)} />
        <div className="mt-4">
          <Button
            onClick={handleCancel}
            variant="ghost"
            size="sm"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  // Convertir datos del producto al formato del formulario
  const initialData: Partial<ProductoFormData> = {
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
    descripcion_producto: producto.descripcion_producto,
    magnitud_producto: producto.magnitud_producto,
    requiere_lote: producto.requiere_lote,
    dias_vida_util: producto.dias_vida_util,
    fecha_vencimiento: producto.fecha_vencimiento,
    lote_serie: producto.lote_serie
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
        <p className="text-gray-600">
          Modifica la información del producto: {producto.nombre_producto}
        </p>
      </div>

      <ProductoForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitText="Actualizar Producto"
      />
    </div>
  );
}
