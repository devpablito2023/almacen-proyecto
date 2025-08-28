// src/app/(auth)/login/page.tsx
import React from 'react';
import LoginMain from '@/components/login/LoginMain';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Sistema Control de Almacén',
  description: 'Acceso al sistema de control de almacén',
  robots: 'noindex, nofollow',
};

/**
 * PÁGINA DE LOGIN
 * 
 * Simple wrapper que usa el componente LoginMain modularizado
 */
export default function LoginPage() {
  return <LoginMain className="animate-fade-in" />;
}
