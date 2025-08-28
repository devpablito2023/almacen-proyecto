import React from 'react';
import { cn } from '../../lib/utils/cn';

/**
 * Componente Footer de la aplicación
 * Información de copyright, versión y enlaces útiles
 */

export interface FooterProps {
  className?: string;
  showVersion?: boolean;
  showLinks?: boolean;
  compact?: boolean;
}

const Footer: React.FC<FooterProps> = ({
  className,
  showVersion = true,
  showLinks = true,
  compact = false
}) => {
  const currentYear = new Date().getFullYear();
  
  if (compact) {
    return (
      <footer className={cn(
        'bg-white border-t border-gray-200 py-3',
        className
      )}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              © {currentYear} Control de Almacén. Todos los derechos reservados.jajaj
            </div>
            {showVersion && (
              <div>
                v1.0.0
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn(
      'bg-white border-t border-gray-200',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Control de Almacén</span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 max-w-md">
              Sistema integral para la gestión y control de inventarios, 
              órdenes de trabajo y solicitudes de materiales en tiempo real.
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Desarrollado con</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  React
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  FastAPI
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  MongoDB
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          {showLinks && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                  Módulos Principales
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/productos" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                      Productos
                    </a>
                  </li>
                  <li>
                    <a href="/stock" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                      Inventario
                    </a>
                  </li>
                  <li>
                    <a href="/ot" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                      Órdenes de Trabajo
                    </a>
                  </li>
                  <li>
                    <a href="/solicitudes" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                      Solicitudes
                    </a>
                  </li>
                  <li>
                    <a href="/reportes" className="text-gray-600 hover:text-primary-600 text-sm transition-colors">
                      Reportes
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                  Soporte
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button className="text-gray-600 hover:text-primary-600 text-sm transition-colors text-left">
                      Manual de Usuario
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-600 hover:text-primary-600 text-sm transition-colors text-left">
                      Preguntas Frecuentes
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-600 hover:text-primary-600 text-sm transition-colors text-left">
                      Soporte Técnico
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-600 hover:text-primary-600 text-sm transition-colors text-left">
                      Reportar Problema
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-600 hover:text-primary-600 text-sm transition-colors text-left">
                      Solicitar Función
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-gray-500">
              © {currentYear} Control de Almacén. Todos los derechos reservados.
            </div>
            
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              {showVersion && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Versión 1.0.0</span>
                  <span>•</span>
                  <span>Build 2024.1.1</span>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <span className="sr-only">Privacidad</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </button>
                
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <span className="sr-only">Términos</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Footer específico para páginas de auth
export const AuthFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-8 text-center">
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <span>© {currentYear} Control de Almacén</span>
        <span>•</span>
        <button className="hover:text-primary-600 transition-colors">
          Soporte
        </button>
        <span>•</span>
        <button className="hover:text-primary-600 transition-colors">
          Privacidad
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        v1.0.0 - Sistema de Control de Inventarios
      </div>
    </footer>
  );
};

export default Footer;