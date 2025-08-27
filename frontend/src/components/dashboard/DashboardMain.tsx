'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useDashboard from '@/lib/hooks/useDashboard';
import { DashboardMainProps } from '@/types/dashboard';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import DashboardAlerts from './DashboardAlerts';
import DashboardActivity from './DashboardActivity';
import DashboardUserInfo from './DashboardUserInfo';
import DashboardSystemStatus from './DashboardSystemStatus';
import DashboardDebug from './DashboardDebug';

/**
 * COMPONENTE PRINCIPAL DEL DASHBOARD
 * 
 * Coordina todos los subcomponentes del dashboard:
 * - Header con información del usuario
 * - Estadísticas del sistema
 * - Alertas y actividad
 * - Información del usuario y permisos
 * - Estado del sistema
 */
export default function DashboardMain({ className = '' }: DashboardMainProps) {
  // ========================================
  // HOOKS
  // ========================================
  const { 
    user, 
    userRole, 
    roleName, 
    isAuthenticated,
    accessibleModules,
    isAdmin,
    isJefatura,
    isGeneraOT,
    isValidaSolicitudes,
    isAlmacen,
    isRealizaIngresos
  } = useAuth();

  const {
    stats,
    activity,
    alerts,
    loading,
    error,
    refreshDashboard,
    isDataLoaded,
    hasAlerts,
    criticalAlerts
  } = useDashboard();

  // ========================================
  // ESTADO LOCAL
  // ========================================
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ========================================
  // EFECTOS
  // ========================================
  
  // Auto-refresh cada 5 minutos
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshDashboard();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshDashboard]);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDashboard();
    setIsRefreshing(false);
  };

  // ========================================
  // PREPARACIÓN DE DATOS
  // ========================================
  
  // Estadísticas por defecto mientras cargan los datos reales
  const displayStats = stats ? {
    productos: stats.productos || 0,
    stockBajo: stats.stock_bajo || 0,
    solicitudesPendientes: stats.solicitudes_pendientes || 0,
    otActivas: stats.ot_activas || 0,
    movimientosHoy: stats.movimientos_hoy || 0,
    valorInventario: stats.valor_total_inventario || 0,
    usuariosActivos: stats.usuarios_activos || 0
  } : {
    productos: 0,
    stockBajo: 0,
    solicitudesPendientes: 0,
    otActivas: 0,
    movimientosHoy: 0,
    valorInventario: 0,
    usuariosActivos: 0
  };

  const rolePermissions = {
    isAdmin,
    isJefatura,
    isGeneraOT,
    isValidaSolicitudes,
    isAlmacen,
    isRealizaIngresos
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header de bienvenida */}
      <DashboardHeader
        user={user}
        roleName={roleName}
        isDataLoaded={isDataLoaded}
        loading={loading}
        hasAlerts={hasAlerts}
        criticalAlerts={criticalAlerts}
        error={error}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Cards de estadísticas */}
      <DashboardStats
        stats={displayStats}
        loading={loading}
      />

      {/* Alertas y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardAlerts
          alerts={alerts}
          loading={loading}
        />
        
        <DashboardActivity
          activity={activity}
          loading={loading}
        />
      </div>

      {/* Panel de información del usuario */}
      <DashboardUserInfo
        user={user}
        userRole={userRole}
        roleName={roleName}
        rolePermissions={rolePermissions}
        accessibleModules={accessibleModules}
      />

      {/* Estado del sistema */}
      <DashboardSystemStatus
        isAuthenticated={isAuthenticated}
        isDataLoaded={isDataLoaded}
        stats={stats}
      />

      {/* Debug info para desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <DashboardDebug
          user={user}
          rolePermissions={rolePermissions}
        />
      )}
    </div>
  );
}
