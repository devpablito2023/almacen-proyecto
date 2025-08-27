// src/hooks/useDashboard.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '@/lib/api/endpoints';

export interface DashboardStats {
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
  usuario_actual: {
    id: number;
    nombre: string;
    tipo: number;
  };
}

export interface ActivityItem {
  action: string;
  module: string;
  user_name: string;
  timestamp: string;
  details?: any;
}

export interface SystemHealth {
  sistema_operativo: boolean;
  base_datos: boolean;
  tiempo_respuesta_ms: number;
  colecciones: {
    productos: number;
    stock: number;
    usuarios: number;
  };
  servidor: {
    timestamp: string;
    uptime: string;
    memoria: string;
  };
}

export interface UseDashboardResult {
  stats: DashboardStats | null;
  activity: ActivityItem[];
  health: SystemHealth | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  refreshHealth: () => Promise<void>;
  refreshAll: () => Promise<void>;
  clearError: () => void;
}

export const useDashboard = (): UseDashboardResult => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener estadísticas del dashboard
  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const response = await dashboardApi.getStats();
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Error obteniendo estadísticas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching dashboard stats:', err);
    }
  }, []);

  // Obtener actividad reciente
  const fetchActivity = useCallback(async () => {
    try {
      const response = await dashboardApi.getActivity();
      if (response.success) {
        setActivity(response.data.actividad || []);
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
    }
  }, []);

  // Obtener estado de salud del sistema
  const fetchHealth = useCallback(async () => {
    try {
      const response = await dashboardApi.getHealth();
      if (response.success) {
        setHealth(response.data);
      }
    } catch (err) {
      console.error('Error fetching system health:', err);
    }
  }, []);

  // Refrescar estadísticas
  const refreshStats = useCallback(async () => {
    setLoading(true);
    try {
      await fetchStats();
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  // Refrescar actividad
  const refreshActivity = useCallback(async () => {
    await fetchActivity();
  }, [fetchActivity]);

  // Refrescar estado de salud
  const refreshHealth = useCallback(async () => {
    await fetchHealth();
  }, [fetchHealth]);

  // Refrescar todo
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchActivity(),
        fetchHealth()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchActivity, fetchHealth]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    refreshAll();
  }, []);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [refreshAll]);

  return {
    stats,
    activity,
    health,
    loading,
    error,
    refreshStats,
    refreshActivity,
    refreshHealth,
    refreshAll,
    clearError
  };
};
