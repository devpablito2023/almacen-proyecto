// ==========================================
// TYPES - DASHBOARD LAYOUT
// ==========================================

/**
 * Breadcrumb item para navegación
 */
export interface Breadcrumb {
  label: string;
  href?: string;
}

/**
 * Mapeo de rutas a nombres amigables
 */
export interface RouteNames {
  [key: string]: string;
}

// ==========================================
// INTERFACES PARA COMPONENTES DE LAYOUT
// ==========================================

/**
 * Props para el componente principal del layout
 */
export interface DashboardLayoutMainProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Props para el componente de carga
 */
export interface DashboardLayoutLoadingProps {
  className?: string;
}

/**
 * Props para el componente de error/no autorizado
 */
export interface DashboardLayoutErrorProps {
  onReturnLogin: () => void;
  className?: string;
}

/**
 * Props para el sidebar móvil
 */
export interface DashboardMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Props para el botón de menú móvil
 */
export interface DashboardMobileMenuButtonProps {
  onOpen: () => void;
  className?: string;
}

/**
 * Props para el área de contenido principal
 */
export interface DashboardMainContentProps {
  children: React.ReactNode;
  isSidebarCollapsed: boolean;
  className?: string;
}

/**
 * Props para el footer del dashboard
 */
export interface DashboardFooterProps {
  userName: string;
  version?: string;
  className?: string;
}

/**
 * Props para el panel de debug
 */
export interface DashboardDebugPanelProps {
  pathname: string;
  pageTitle: string;
  breadcrumbsCount: number;
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  userRole: string;
  className?: string;
}

/**
 * Props para el generador de breadcrumbs
 */
export interface BreadcrumbGeneratorProps {
  pathname: string;
  routeNames: RouteNames;
}

/**
 * Props para el generador de título de página
 */
export interface PageTitleGeneratorProps {
  pathname: string;
  routeNames: RouteNames;
}
