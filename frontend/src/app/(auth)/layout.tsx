import React from 'react';
import AuthLayout from '../../components/layout/AuthLayout';

/**
 * Layout para el grupo de rutas de autenticación
 * Páginas de login, registro, reset password, etc.
 */

export default function AuthLayoutApp({
  children,
}: {
  children: React.ReactNode;
}) {
  return children; // Las páginas de auth manejan su propio AuthLayout específico
}