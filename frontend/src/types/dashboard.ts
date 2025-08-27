// src/types/dashboard.ts

/**
 * TIPOS CENTRALIZADOS PARA EL DASHBOARD
 * 
 * Todas las interfaces y tipos relacionados con el dashboard
 * están centralizados aquí para evitar duplicación
 */

// ========================================
// INTERFACES PARA COMPONENTES PRINCIPALES
// ========================================

export interface DashboardMainProps {
  className?: string;
}

export interface DashboardHeaderProps {
  user: any;
  roleName: string;
  isDataLoaded: boolean;
  loading: boolean;
  hasAlerts: boolean;
  criticalAlerts: any[];
  error: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export interface DashboardStatsProps {
  stats: DisplayStats;
  loading: boolean;
}

// Estadísticas procesadas para mostrar
export interface DisplayStats {
  productos: number;
  stockBajo: number;
  solicitudesPendientes: number;
  otActivas: number;
  movimientosHoy: number;
  valorInventario: number;
  usuariosActivos: number;
}

export interface DashboardAlertsProps {
  alerts: Alert[];
  loading: boolean;
}

export interface DashboardActivityProps {
  activity: Activity | null;
  loading: boolean;
}

export interface DashboardUserInfoProps {
  user: any;
  userRole: number;
  roleName: string;
  rolePermissions: RolePermissions;
  accessibleModules: string[];
}

export interface DashboardSystemStatusProps {
  isAuthenticated: boolean;
  isDataLoaded: boolean;
  stats: DashboardStats | null;
}

export interface DashboardDebugProps {
  user: any;
  rolePermissions: RolePermissions;
}

// ========================================
// INTERFACES PARA COMPONENTES INDIVIDUALES
// ========================================

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'orange' | 'purple' | 'green' | 'indigo' | 'emerald' | 'teal';
  description: string;
  loading?: boolean;
}

export interface InfoRowProps {
  label: string;
  value: string;
}

export interface PermissionRowProps {
  label: string;
  hasPermission: boolean;
}

export interface SystemStatusProps {
  label: string;
  status: string;
  isHealthy: boolean;
}

// ========================================
// INTERFACES DE DATOS
// ========================================

export interface DashboardStats {
  productos?: number;
  stock_bajo?: number;
  solicitudes_pendientes?: number;
  ot_activas?: number;
  movimientos_hoy?: number;
  valor_total_inventario?: number;
  usuarios_activos?: number;
  ultima_actualizacion?: string;
  productos_por_categoria?: { [key: string]: number };
  productos_por_tipo?: { [key: string]: number };
}

export interface Alert {
  id?: string | number;
  titulo?: string;
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
  timestamp?: string;
}

export interface Activity {
  actividad: ActivityItem[];
  total?: number;
}

export interface ActivityItem {
  action: string;
  user_name: string;
  timestamp: string;
  details?: any;
}

export interface RolePermissions {
  isAdmin: boolean;
  isJefatura: boolean;
  isGeneraOT: boolean;
  isValidaSolicitudes: boolean;
  isAlmacen: boolean;
  isRealizaIngresos: boolean;
}
