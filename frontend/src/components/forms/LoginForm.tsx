// src/components/forms/LoginForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAuthDebugInfo } from '@/lib/auth/authService'; 
 
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

interface LoginFormProps { 
  onSuccess?: () => void;
  className?: string;
}

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
  // REDIRECCIÓN SI YA ESTÁ AUTENTICADO
  // ========================================
  useEffect(() => {
    console.log('🔄 LoginForm: Verificando estado de autenticación... useEffect');
    if (isAuthenticated && user && isInitialized) {
      console.log(`✅ LoginForm: Usuario ya autenticado (${user.nombre_usuario})`);
      if (onSuccess) {
        onSuccess();
      }
      // La redirección la maneja el hook useAuth
    }
  }, [isAuthenticated, user, isInitialized, onSuccess]);

  // ========================================
  // MANEJO DEL FORMULARIO
  // ========================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores al escribir
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.email_usuario.trim()) {
      return; // Los errores los maneja el HTML5 required
    }
    
    if (!formData.password_usuario.trim()) {
      return;
    }

    console.log(`📝 LoginForm: Enviando formulario para ${formData.email_usuario}`);
    
    setIsSubmitting(true);
    
    try {
      const success = await login(formData);
      
      if (success && onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('💥 LoginForm: Error inesperado:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================
  // UTILIDADES
  // ========================================
  const isFormDisabled = isLoading || isSubmitting || !isInitialized;

  // ========================================
  // RENDER
  // ========================================

  // Mostrar loading mientras se inicializa
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema Control de Almacén
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          
          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Error de autenticación
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  className="ml-auto text-red-400 hover:text-red-600"
                  aria-label="Cerrar mensaje de error"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            
            {/* Campo Email */}
            <div>
              <label htmlFor="email_usuario" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="email_usuario"
                name="email_usuario"
                type="email"
                autoComplete="email"
                required
                disabled={isFormDisabled}
                value={formData.email_usuario}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Correo electrónico"
                aria-describedby="email-error"
              />
            </div>
            
            {/* Campo Password */}
            <div className="relative">
              <label htmlFor="password_usuario" className="sr-only">
                Contraseña
              </label>
              <input
                id="password_usuario"
                name="password_usuario"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={isFormDisabled}
                value={formData.password_usuario}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Contraseña"
                aria-describedby="password-error"
              />
              <button
                type="button"
                disabled={isFormDisabled}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:cursor-not-allowed"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.758 6.758M9.878 9.878a3 3 0 00-.878 2.122m0 0a3 3 0 003 3m0-3a3 3 0 003-3m-3 3a3 3 0 01-3-3m0 3.878l4.242 4.242M6.758 6.758L3.172 3.172" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Botón Submit */}
          <div>
            <button
              type="submit"
              disabled={isFormDisabled}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isFormDisabled ? (
                  <svg className="animate-spin h-5 w-5 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-blue-300 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              {isFormDisabled 
                ? 'Iniciando sesión...' 
                : 'Iniciar Sesión'
              }
            </button>
          </div>

          {/* Credenciales de prueba */}
          <div className="bg-blue-50 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              💡 Credenciales de prueba:
            </h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div><strong>Email:</strong> admin@almacen.com</div>
              <div><strong>Password:</strong> admin123</div>
              <div><strong>Rol:</strong> Superusuario (acceso completo)</div>
            </div>
          </div>

          {/* Información del sistema */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Sistema seguro con autenticación HTTP-Only cookies
            </p>
            <div className="mt-2 flex justify-center space-x-4 text-xs text-gray-400">
              <span>🔒 Encriptado</span>
              <span>🛡️ CSRF Protected</span>
              <span>⚡ SSR Ready</span>
            </div>
          </div>

          {/* Debug info para desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 rounded-md p-3">
              <details className="text-xs">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  🔧 Debug Info (Solo en desarrollo)
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