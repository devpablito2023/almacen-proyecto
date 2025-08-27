'use client';

import { useParams } from 'next/navigation';
import ProductoEdit from '@/components/productos/edit/ProductoEdit';

export default function EditarProductoPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);

  if (!productId || isNaN(productId)) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900">ID de producto inválido</h3>
          <p className="mt-1 text-sm text-gray-500">El identificador del producto no es válido.</p>
        </div>
      </div>
    );
  }

  return <ProductoEdit productId={productId} />;
}
