'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginMainProps, TestCredential } from '@/types/auth';
import LoginForm from './LoginForm';
import TestingPanel from './testing/TestingPanel';

/**
 * COMPONENTE PRINCIPAL DE LOGIN
 * 
 * Coordina:
 * - LoginForm component
 * - Manejo de redirecciones
 * - Panel de testing en desarrollo
 */
export default function LoginMain({ className = '' }: LoginMainProps) {
  const { login, isLoading } = useAuth();

  const handleLoginSuccess = () => {
    console.log('✅ LoginMain: Login exitoso, el hook useAuth manejará la redirección');
  };

  const handleTestLogin = async (credentials: TestCredential) => {
    console.log('🧪 LoginMain: Testing credenciales:', credentials.role);
    
    // Usar las credenciales del test para hacer login
    await login({
      email_usuario: credentials.email_usuario,
      password_usuario: credentials.password_usuario
    });
  };

  return (
    <div className={className}>
      {/* Componente de formulario */}
      <LoginForm 
        onSuccess={handleLoginSuccess}
        className="animate-fade-in"
      />

      {/* Testing Panel - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8">
          <TestingPanel 
            onTestLogin={handleTestLogin}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
