import React from 'react';
import { cn } from '../../lib/utils/cn';
import { AuthFooter } from './Footer';

/**
 * Layout para páginas de autenticación (login, register, etc.)
 * Diseño limpio y centrado sin navegación principal
 */

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
  className
}) => {
  return (
    <div className={cn(
      'min-h-screen bg-gray-50 flex flex-col justify-center',
      className
    )}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 opacity-60" />
      
      {/* Main Content */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Logo and Header */}
        <div className="text-center mb-8">
          {showLogo && (
            <div className="mx-auto w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                />
              </svg>
            </div>
          )}
          
          {title && (
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
          )}
          
          {subtitle && (
            <p className="text-gray-600 text-lg">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Container */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10 border border-gray-200">
          {children}
        </div>

        {/* Footer */}
        <AuthFooter />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Top Left */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-primary-100 rounded-full opacity-30" />
        <div className="absolute top-20 left-10 w-16 h-16 bg-secondary-100 rounded-full opacity-40" />
        
        {/* Bottom Right */}
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary-100 rounded-full opacity-20" />
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-secondary-100 rounded-full opacity-30" />
        
        {/* Center decorations */}
        <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-primary-200 rounded-full opacity-25" />
        <div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-secondary-200 rounded-full opacity-20" />
      </div>
    </div>
  );
};

// Layout específico para página de login
export const LoginLayout: React.FC<Omit<AuthLayoutProps, 'title' | 'subtitle'>> = (props) => {
  return (
    <AuthLayout 
      {...props}
      title="Iniciar Sesión"
      subtitle="Control de Almacén"
    />
  );
};

// Layout para páginas de error de autenticación
export const AuthErrorLayout: React.FC<{
  children: React.ReactNode;
  errorCode?: string;
  errorMessage?: string;
}> = ({ children, errorCode = '401', errorMessage = 'No autorizado' }) => {
  return (
    <AuthLayout 
      title={`Error ${errorCode}`}
      subtitle={errorMessage}
      showLogo={false}
    >
      {children}
    </AuthLayout>
  );
};

// Layout para reset de contraseña
export const ResetPasswordLayout: React.FC<Omit<AuthLayoutProps, 'title' | 'subtitle'>> = (props) => {
  return (
    <AuthLayout 
      {...props}
      title="Restablecer Contraseña"
      subtitle="Ingresa tu email para recibir instrucciones"
    />
  );
};

export default AuthLayout;