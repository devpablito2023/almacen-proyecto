// src/app/page.tsx
import { redirect } from 'next/navigation';

/**
 * PÁGINA RAÍZ CON REDIRECCIÓN
 * 
 * Redirige automáticamente a /login.
 * El middleware se encargará de redirigir a dashboard si ya está autenticado.
 */

export default function HomePage() {
  redirect('/login');
}