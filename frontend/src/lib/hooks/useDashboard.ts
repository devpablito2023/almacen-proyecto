// frontend/src/lib/hooks/useDashboard.ts
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface DashboardStats {
  productos: number;
  productos_activos: number;
  stock_bajo: number;
  productos_sin_stock: number;
  solicitudes_pendientes: number;
  ot_activas: number;
  movimientos_hoy: number;
  usuarios_activos: number;
  total_usuarios: number;
  valor_total_inventario: number;
  actividad_reciente: number;
  productos_por_categoria: Record<string, number>;
  productos_por_tipo: Record<string, number>;
  alertas: {
    stock_bajo: boolean;
    sin_stock: boolean;
    solicitudes_pendientes: boolean;
    ot_vencidas: boolean;
  };
  ultima_actualizacion: string;
}

interface ActivityItem {
  timestamp: string;
  action: string;
  user_id: number;
  user_name: string;
  details: string | { product_id: number; codigo: string };
  ip_address?: string;
  user_agent?: string;
}

interface DashboardActivity {
  actividad: ActivityItem[];
  total: number;
  productos_recientes?: any[];
  movimientos_recientes?: any[];
  usuarios_recientes?: any[];
}

interface Alert {
  id: string;
  tipo: 'stock_critico' | 'sin_stock' | 'proximo_vencer' | 'solicitud_pendiente';
  titulo: string;
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
  timestamp: string;
  producto_id?: number;
  cantidad?: number;
}

interface DashboardSummary {
  productos_por_tipo: Array<{
    tipo: string;
    cantidad: number;
    porcentaje: number;
  }>;
  productos_por_categoria: Array<{
    categoria: string;
    cantidad: number;
    porcentaje: number;
  }>;
  total_productos: number;
}

interface CompleteDashboard {
  stats: DashboardStats;
  activity: DashboardActivity;
  alerts: Alert[];
  summary: DashboardSummary;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<DashboardActivity | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [completeDashboard, setCompleteDashboard] = useState<CompleteDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Función para obtener estadísticas
  const fetchStats = async () => {
    if (!isAuthenticated) return null;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching dashboard stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener actividad reciente
  const fetchActivity = async () => {
    if (!isAuthenticated) return null;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/activity', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setActivity(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener actividad');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching dashboard activity:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener alertas
  const fetchAlerts = async () => {
    if (!isAuthenticated) return null;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/alerts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener alertas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching dashboard alerts:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener resumen
  const fetchSummary = async () => {
    if (!isAuthenticated) return null;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/summary', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener resumen');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching dashboard summary:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener dashboard completo
  const fetchCompleteDashboard = async () => {
    if (!isAuthenticated) return null;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCompleteDashboard(data.data);
        setStats(data.data.stats);
        setActivity(data.data.activity);
        setAlerts(data.data.alerts);
        setSummary(data.data.summary);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching complete dashboard:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar todos los datos
  const refreshDashboard = async () => {
    await fetchCompleteDashboard();
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (isAuthenticated) {
      fetchCompleteDashboard();
    }
  }, [isAuthenticated]);

  return {
    // Estados
    stats,
    activity,
    alerts,
    summary,
    completeDashboard,
    loading,
    error,
    
    // Funciones
    fetchStats,
    fetchActivity,
    fetchAlerts,
    fetchSummary,
    fetchCompleteDashboard,
    refreshDashboard,
    
    // Utilidades
    isDataLoaded: !!completeDashboard,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(alert => alert.prioridad === 'alta'),
  };
};

export default useDashboard;
