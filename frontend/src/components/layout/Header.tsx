// src/components/layout/Header.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button, Input } from '../commons';

/**
 * HEADER PROFESIONAL DEL SISTEMA
 * 
 * Funcionalidades:
 * - Información del usuario logueado
 * - Dropdown menu con perfil y logout
 * - Búsqueda global (preparado para futuro)
 * - Notificaciones (preparado para futuro)
 * - Breadcrumbs automáticos
 * - Responsive design
 */

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Dashboard', 
  breadcrumbs = [] 
}) => {
  const { user, logout, roleName } = useAuth();
  const router = useRouter();
  
  // Estados locales
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Refs para manejar clicks outside
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Cerrar menu al hacer click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar logout
  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
  };

  // Navegación a perfil
  const handleProfileClick = () => {
    setIsUserMenuOpen(false);
    router.push('/dashboard/perfil');
  };

  // Handle search (preparado para futuro)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('🔍 Búsqueda:', searchQuery);
      // Implementar búsqueda global en el futuro
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Lado izquierdo: Logo, Título y Breadcrumbs */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            
            {/* Logo del sistema */}
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>

            {/* Información de página */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                <span>Control de Almacén</span>
                {breadcrumbs.length > 0 && (
                  <>
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {crumb.href ? (
                          <Button 
                            onClick={() => router.push(crumb.href!)}
                            variant="ghost"
                            size="sm"
                          >
                            {crumb.label}
                          </Button>
                        ) : (
                          <span className="text-gray-900 font-medium">{crumb.label}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}
              </div>
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
            </div>
          </div>

          {/* Centro: Búsqueda Global */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className={`h-5 w-5 transition-colors ${
                      isSearchFocused ? 'text-blue-400' : 'text-gray-400'
                    }`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="Buscar productos, OT, solicitudes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`pl-10 ${
                    isSearchFocused 
                      ? 'border-blue-300 bg-white' 
                      : 'border-gray-300 bg-gray-50 hover:bg-white'
                  }`}
                />
              </div>
            </form>
          </div>

          {/* Lado derecho: Notificaciones y Usuario */}
          <div className="flex items-center space-x-4">
            
            {/* Notificaciones (preparado para futuro) */}
            <Button 
              variant="ghost" 
              size="sm"
              className="relative"
              title="Ver notificaciones"
            >
              <span className="sr-only">Ver notificaciones</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Badge de notificaciones */}
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </Button>

            {/* Menu del usuario */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 text-left p-2 rounded-lg hover:bg-gray-50 transition-colors h-auto"
              >
                {/* Avatar */}
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.nombre_usuario?.charAt(0).toUpperCase() || 'U'}
                </div>
                
                {/* Info del usuario */}
                <div className="hidden md:block min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.nombre_usuario || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {roleName}
                  </p>
                </div>
                
                {/* Icono dropdown */}
                <svg 
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.nombre_usuario}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user?.email_usuario}
                    </p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      {roleName} • {user?.codigo_usuario}
                    </p>
                  </div>
                  
                  <div className="py-2">
                    <Button
                      onClick={handleProfileClick}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      leftIcon={
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                    >
                      Mi Perfil
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        router.push('/dashboard/configuracion');
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      leftIcon={
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      }
                    >
                      Configuración
                    </Button>
                  </div>
                  
                  <div className="border-t border-gray-100 py-2">
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-700 hover:bg-red-50"
                      leftIcon={
                        <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      }
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;