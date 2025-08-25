"use client";
import React from 'react';
import { cn } from '../../lib/utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Breadcrumbs from './Breadcrumbs';
import { LoadingScreen, ToastProvider } from '../ui';

/**
 * Layout principal de la aplicación
 * Combina Header, Sidebar, Footer y maneja el estado global de UI
 */

export interface MainLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  showFooter?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showBreadcrumbs = true,
  showFooter = false,
  fullWidth = false,
  className
}) => {
  const { user, isAuthenticated, isLoading: authLoading, initializeAuth } = useAuth();
  
  // Estado del sidebar (persistente)
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage('sidebar-open', true);
  
  // Estado de loading inicial
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

const [hasHydrated, setHasHydrated] = React.useState(false);


  // Esperar a que Zustand se hidrate
  React.useEffect(() => {
    const checkHydration = () => {
      setHasHydrated(true);
      console.log('🔄 MainLayout - Zustand hidratado');
    };
    
    // Esperar un tick para que Zustand se hidrate
    const timer = setTimeout(checkHydration, 100);
    return () => clearTimeout(timer);
  }, []);

  // Inicializar autenticación
  React.useEffect(() => {
    if (!hasHydrated) return;
    
    const initialize = async () => {
      try {
        console.log('🔄 Inicializando auth desde MainLayout...');
        initializeAuth();
        
        // Debug adicional
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');
        console.log('📦 Token en localStorage:', token ? 'Existe' : 'No existe');
        console.log('👤 User en localStorage:', userData ? 'Existe' : 'No existe');
        
      } catch (error) {
        console.error('❌ Error inicializando auth:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initialize();
  }, [hasHydrated, initializeAuth]);

  console.log('🔍 MainLayout - hasHydrated:', hasHydrated);
  console.log('🔍 MainLayout - isAuthenticated:', isAuthenticated);
  console.log('🔍 MainLayout - user:', user);

  // Loading mientras se hidrata o inicializa
  if (!hasHydrated || isInitialLoading || authLoading) {
    return (
      <LoadingScreen 
        message="Inicializando aplicación..."
        showLogo={true}
      />
    );
  }

  // Si no está autenticado, no renderizar (el middleware redirigirá)
  if (!isAuthenticated || !user) {
    console.log('⚠️ Usuario no autenticado, no renderizando MainLayout');
    return null;
  }






  // Inicializar autenticación al montar el componente
  React.useEffect(() => {
    const initialize = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Error inicializando auth:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initialize();
  }, [initializeAuth]);

  // Cerrar sidebar en mobile al cambiar de ruta
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // En desktop, mantener el estado persistente
        return;
      } else {
        // En mobile, cerrar sidebar
        if (isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen, setIsSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Loading inicial
  if (isInitialLoading || authLoading) {
    return (
      <LoadingScreen 
        message="Inicializando aplicación... "
        showLogo={true}
      />
    );
  }

  // Si no está autenticado, no renderizar el layout
  console.log("desde mainlayout, el estado de autenticacion es :")
  console.log(isAuthenticated)
  console.log("desde mainlayout, el estado de user es :")
  console.log(user)


  if (!isAuthenticated || !user) {
      return (
    <LoadingScreen 
      message="Validando sesión..." 
      showLogo={true} 
    />
  );
    //return null; // El middleware de Next.js se encargará de redirigir
  }

  return (
    <ToastProvider position="top-right">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        
        {/* Header */}
        <Header 
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar */}
          <Sidebar 
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
          />

          {/* Main Content Area */}
          <main 
            className={cn(
              'flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
              // Ajustar margen basado en estado del sidebar
              'lg:ml-0', // En desktop el sidebar es static, no necesita margen
              className
            )}
          >
            
            {/* Breadcrumbs */}
            {showBreadcrumbs && (
              <div className="bg-white border-b border-gray-200">
                <div className={cn(
                  'px-4 sm:px-6 py-4',
                  !fullWidth && 'lg:px-8 max-w-7xl mx-auto w-full'
                )}>
                  <Breadcrumbs />
                </div>
              </div>
            )}

            {/* Page Content */}
            <div className="flex-1 overflow-y-auto focus:outline-none">
              <div className={cn(
                'py-6',
                fullWidth ? 'px-4 sm:px-6 lg:px-8' : 'px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full'
              )}>
                {children}
              </div>
            </div>

            {/* Footer */}
            {showFooter && (
              <Footer compact className="mt-auto" />
            )}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

// Layout específico para páginas con sidebar colapsado por defecto
export const CompactLayout: React.FC<MainLayoutProps> = (props) => {
  return <MainLayout {...props} />;
};

// Layout para páginas full-width (reportes, dashboards amplios)
export const FullWidthLayout: React.FC<MainLayoutProps> = (props) => {
  return <MainLayout {...props} fullWidth showFooter />;
};

// Layout para páginas con breadcrumbs personalizados
export interface CustomBreadcrumbLayoutProps extends Omit<MainLayoutProps, 'showBreadcrumbs'> {
  breadcrumbComponent: React.ReactNode;
}

export const CustomBreadcrumbLayout: React.FC<CustomBreadcrumbLayoutProps> = ({
  breadcrumbComponent,
  children,
  ...props
}) => {
  return (
    <MainLayout {...props} showBreadcrumbs={false}>
      {breadcrumbComponent}
      {children}
    </MainLayout>
  );
};

// Layout simple sin breadcrumbs ni footer (para modales, wizards, etc.)
export const SimpleLayout: React.FC<MainLayoutProps> = (props) => {
  return (
    <MainLayout 
      {...props} 
      showBreadcrumbs={false} 
      showFooter={false}
    />
  );
};

// Hook para controlar el estado del layout
export const useLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage('sidebar-open', true);

  return {
    isSidebarOpen,
    toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
    openSidebar: () => setIsSidebarOpen(true),
    closeSidebar: () => setIsSidebarOpen(false),
  };
};

export default MainLayout;