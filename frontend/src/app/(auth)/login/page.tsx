// src/app/(auth)/login/page.tsx
'use client';

import React from 'react';
import LoginMain from '@/components/login/LoginMain';

/**
 * PÁGINA DE LOGIN
 * 
 * Simple wrapper que usa el componente LoginMain modularizado
 */
export default function LoginPage() {
  return (
    <>
      {/* Metadata para SEO */}
      <head>
        <title>Login - Sistema Control de Almacén</title>
        <meta name="description" content="Acceso al sistema de control de almacén" />
        <meta name="robots" content="noindex, nofollow" />
      </head>

      {/* Componente principal modularizado */}
      <LoginMain className="animate-fade-in" />
    </>
  );
}
