'use client';

import React from 'react';
import { LoginLayout } from '../../../components/layout';
import { Input, Button } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';

/**
 * Página de Login
 * Ejemplo de implementación usando AuthLayout
 */

const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    try {
      await login({
        email_usuario :email,
        password:password,
        remember: rememberMe,
      });
    } catch (error) {
      // Error manejado por el store
    }
  };

  return (
    <LoginLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Error Message */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-danger-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-danger-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Email Field */}
        <Input
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@empresa.com"
          required
          disabled={isLoading}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        {/* Password Field */}
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isLoading}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Recordar sesión
            </label>
          </div>

          <button
            type="button"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            disabled={isLoading}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          loadingText="Iniciando sesión..."
          disabled={!email || !password}
        >
          Iniciar Sesión
        </Button>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Credenciales de demostración:</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div><strong>Superusuario:</strong> admin@empresa.com / admin123</div>
            <div><strong>Jefatura:</strong> jefe@empresa.com / jefe123</div>
            <div><strong>Almacén:</strong> almacen@empresa.com / almacen123</div>
          </div>
        </div>
      </form>
    </LoginLayout>
  );
};

export default LoginPage;