'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { DashboardLayoutMainProps } from '@/types/layout';
import DashboardLayoutLoading from './components/DashboardLayoutLoading';
import DashboardLayoutError from './components/DashboardLayoutError';
import DashboardMobileSidebar from './components/DashboardMobileSidebar';
import DashboardMobileMenuButton from './components/DashboardMobileMenuButton';
import DashboardMainContent from './components/DashboardMainContent';
import DashboardFooter from './components/DashboardFooter';
import DashboardDebugPanel from './components/DashboardDebugPanel';
import { generateBreadcrumbs, generatePageTitle } from './utils/navigationUtils';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

/**
 * COMPONENTE PRINCIPAL DEL LAYOUT DEL DASHBOARD
 * 
 * Coordina todos los componentes del layout:
 * - Gestión de estados (sidebar, mobile menu)
 * - Autenticación y permisos
 * - Navegación y breadcrumbs
 * - Estados de carga y error
 */
export default function DashboardLayoutMain({ 
  children, 
  className = '' 
}: DashboardLayoutMainProps) {
  
  // ========================================
  // HOOKS
  // ========================================
  const { user, isLoading, isInitialized } = useAuth();
  const pathname = usePathname();
  
  // ========================================
  // ESTADO LOCAL
  // ========================================
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ========================================
  // DATOS CALCULADOS
  // ========================================
  const breadcrumbs = generateBreadcrumbs(pathname);
  const pageTitle = generatePageTitle(pathname);

  // ========================================
  // HANDLERS
  // ========================================
  const handleReturnLogin = () => {
    window.location.href = '/login';
  };

  const handleOpenMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // ========================================
  // ESTADOS DE CARGA Y ERROR
  // ========================================
  
  // Estado de carga
  if (!isInitialized || isLoading) {
    return <DashboardLayoutLoading />;
  }

  // Estado de error (usuario no autenticado)
  if (!user) {
    return <DashboardLayoutError onReturnLogin={handleReturnLogin} />;
  }

  // ========================================
  // RENDER PRINCIPAL
  // ========================================
  return (
    <div className={`flex h-screen bg-gray-50 ${className}`}>
      
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={setIsSidebarCollapsed}
        />
      </div>

      {/* Sidebar Mobile - Overlay */}
      <DashboardMobileSidebar 
        isOpen={isMobileSidebarOpen}
        onClose={handleCloseMobileSidebar}
      />

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Header */}
        <Header 
          title={pageTitle}
          breadcrumbs={breadcrumbs}
        />

        {/* Botón menú móvil */}
        <DashboardMobileMenuButton 
          onOpen={handleOpenMobileSidebar}
        />

        {/* Contenido principal */}
        <DashboardMainContent 
          isSidebarCollapsed={isSidebarCollapsed}
        >
          {children}
        </DashboardMainContent>

        {/* Footer */}
        <DashboardFooter 
          userName={user.nombre_usuario}
          version="1.0.0"
        />
      </div>

      {/* Debug panel para desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <DashboardDebugPanel
          pathname={pathname}
          pageTitle={pageTitle}
          breadcrumbsCount={breadcrumbs.length}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobileSidebarOpen={isMobileSidebarOpen}
          userRole={user.tipo_usuario.toString()}
        />
      )}
    </div>
  );
}
