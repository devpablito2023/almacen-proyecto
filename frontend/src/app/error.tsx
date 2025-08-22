'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-error-600">
        Ha ocurrido un error
      </h2>
      <p className="mt-2 text-secondary-600">
        {error.message || 'Error inesperado'}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}