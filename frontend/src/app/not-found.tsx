import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-secondary-900">
        Página no encontrada
      </h2>
      <p className="mt-2 text-secondary-600">
        La página que buscas no existe malito
      </p>
      <Link
        href="/dashboard"
        className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
      >
        Volver al Dashboard
      </Link>
    </div>
  );
}