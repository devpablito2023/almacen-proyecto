import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorAlertProps {
  error: string | null;
  onClose: () => void;
}

export default function ErrorAlert({ error, onClose }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 underline text-sm"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
