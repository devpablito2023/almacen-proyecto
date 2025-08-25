// src/app/(auth)/layout.tsx
import React from 'react';
import { Metadata } from 'next';

/**
 * LAYOUT PARA PÁGINAS DE AUTENTICACIÓN
 * 
 * Layout simple sin sidebar ni header.
 * Usado para login, registro, reset password, etc.
 */

export const metadata: Metadata = {
  title: 'Autenticación - Sistema Control de Almacén',
  description: 'Acceso seguro al sistema de control de almacén',
  robots: 'noindex, nofollow', // No indexar páginas de auth
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background pattern opcional */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50"></div>
      
      {/* Contenido principal */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Footer simple para páginas de auth */}
      <footer className="relative z-10 text-center py-4 text-xs text-gray-500">
        <p>Sistema Control de Almacén &copy; {new Date().getFullYear()}</p>
        <p>Autenticación segura con cookies HTTP-Only</p>
      </footer>
    </div>
  );
};

export default AuthLayout;