import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ProductoActionsProps } from '@/types/productos';

export default function ProductoActions({ onEdit, onDelete, canEdit, canDelete }: ProductoActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
          Editar
        </button>
      )}
      
      {canDelete && (
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          Eliminar
        </button>
      )}
    </div>
  );
}
