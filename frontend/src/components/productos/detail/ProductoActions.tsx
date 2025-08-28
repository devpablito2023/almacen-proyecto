import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { ProductoActionsProps } from '@/types/productos';
import { Button } from '../../commons';

export default function ProductoActions({ onEdit, onDelete, canEdit, canDelete }: ProductoActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <Button
          variant="primary"
          onClick={onEdit}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          leftIcon={<PencilIcon className="w-4 h-4" />}
        >
          Editar
        </Button>
      )}
      
      {canDelete && (
        <Button
          variant="danger"
          onClick={onDelete}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          leftIcon={<TrashIcon className="w-4 h-4" />}
        >
          Eliminar
        </Button>
      )}
    </div>
  );
}
