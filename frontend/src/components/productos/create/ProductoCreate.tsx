'use client';

import { useRouter } from 'next/navigation';
import { Producto, ProductoCreateProps } from '@/types/productos';
import { authService } from '@/lib/auth/authService';
import ProductoForm from './ProductoForm';

const cookieUser = authService.getUserInfoFromCookie();

export default function ProductoCreate({ onSuccess, onCancel }: ProductoCreateProps) {
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
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
        if (onSuccess) {
          onSuccess(result.data);
        } else {
          router.push('/dashboard/productos');
        }
      } else {
        throw new Error(result.message || 'Error al crear producto');
      }
    } catch (error) {
      throw error; // Re-throw para que ProductoForm maneje el error
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/dashboard/productos');
    }
  };

  // Verificar permisos
  const canCreate = cookieUser?.tipo_usuario === 0 || cookieUser?.tipo_usuario === 5;
  
  if (!canCreate) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900">Sin permisos</h3>
          <p className="mt-1 text-sm text-gray-500">No tienes permisos para crear productos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Producto</h1>
        <p className="text-gray-600">Completa la información del producto</p>
      </div>

      <ProductoForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitText="Crear Producto"
      />
    </div>
  );
}
