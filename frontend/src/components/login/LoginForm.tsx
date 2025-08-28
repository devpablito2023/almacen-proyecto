'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAuthDebugInfo } from '@/lib/auth/authService';
import { LoginFormProps } from '@/types/auth';
import { Button, Input, Label } from '../commons';

 
/**
 * FORMULARIO DE LOGIN PROFESIONAL
 * 
 * Características:
 * - Manejo de estados completo (loading, error, success)
 * - Validación client-side básica
 * - Accesibilidad (a11y) completa
 * - Responsive design
 * - Debug info para desarrollo
 * - Redirección automática si ya está autenticado
 */
const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  className = '' 
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================
  const [formData, setFormData] = useState({
    email_usuario: 'admin@almacen.com',
    password_usuario: 'admin123'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ========================================
  // HOOK DE AUTENTICACIÓN
  // ========================================
  const {
    login,
    error,
    clearError,
    isLoading,
    isAuthenticated,
    isInitialized,
    user
  } = useAuth();

  // ========================================
  // EFECTOS
  // ========================================
  
  // Redirección automática si ya está autenticado
  useEffect(() => {
    console.log('🔄 LoginForm: useEffect - estado de auth cambió');
    console.log('   • isInitialized:', isInitialized);
    console.log('   • isAuthenticated:', isAuthenticated);
    console.log('   • user:', user?.nombre_usuario);
    
    if (isInitialized && isAuthenticated && user) {
      console.log('✅ LoginForm: Usuario autenticado, ejecutando callback onSuccess');
      onSuccess?.();
    }
  }, [isInitialized, isAuthenticated, user, onSuccess]);

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.email_usuario || !formData.password_usuario) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🔐 LoginForm: Iniciando proceso de login...');
      await login(formData);
      console.log('✅ LoginForm: Login completado exitosamente');
    } catch (err) {
      console.error('❌ LoginForm: Error en login:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ========================================
  // ESTADO DE CARGA
  // ========================================
  const isFormLoading = isLoading || isSubmitting;

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 ${className}`}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Control de Almacén
          </h1>
          <p className="text-gray-600">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-8 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error de autenticación
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <Label htmlFor="email_usuario">
              Email
            </Label>
            <Input
              id="email_usuario"
              name="email_usuario"
              type="email"
              required
              value={formData.email_usuario}
              onChange={handleInputChange}
              disabled={isFormLoading}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password_usuario">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password_usuario"
                name="password_usuario"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password_usuario}
                onChange={handleInputChange}
                disabled={isFormLoading}
                className="pr-10"
                placeholder="Tu contraseña"
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={togglePasswordVisibility}
                disabled={isFormLoading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center h-auto p-1"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={isFormLoading || !formData.email_usuario || !formData.password_usuario}
              isLoading={isFormLoading}
              loadingText="Iniciando sesión..."
            >
              Iniciar Sesión
            </Button>
          </div>

          {/* Debug Panel para desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="border-t pt-4">
              <details className="group">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 list-none">
                  🐛 Debug Info (Dev Only)
                </summary>
                <DebugInfo />
              </details>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

/**
 * Componente de debug para desarrollo
 */
const DebugInfo: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { isAuthenticated, user, userRole, isLoading, error } = useAuth();

  useEffect(() => {
    const info = getAuthDebugInfo();
    setDebugInfo(info);
  }, []);

  return (
    <div className="bg-white rounded p-2 font-mono text-xs space-y-1">
      <div><strong>Auth Estado:</strong></div>
      <div className="pl-2 space-y-1">
        <div>• Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>• Loading: {isLoading ? '⏳' : '✅'}</div>
        <div>• Error: {error || 'None'}</div>
        <div>• User: {user ? `${user.nombre_usuario} (${userRole})` : 'None'}</div>
      </div>
      
      {debugInfo && (
        <>
          <div><strong>Cookies:</strong></div>
          <div className="pl-2 space-y-1">
            <div>• Auth Token: {debugInfo.hasAuthToken ? '✅' : '❌'}</div>
            <div>• User Info: {debugInfo.hasUserInfo ? '✅' : '❌'}</div>
            <div>• Timestamp: {debugInfo.timestamp?.substring(11, 19)}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginForm;
