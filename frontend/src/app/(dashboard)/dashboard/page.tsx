// src/app/(dashboard)/dashboard/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * PÁGINA PRINCIPAL DEL DASHBOARD
 * 
 * Dashboard básico para testing del sistema de autenticación.
 * Muestra información del usuario y estado del sistema.
 */

const DashboardPage: React.FC = () => {
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

  // Estadísticas mock para el dashboard
  const mockStats = {
    productos: 1250,
    stockBajo: 25,
    solicitudesPendientes: 8,
    otActivas: 15,
    movimientosHoy: 42
  };

  const rolePermissions = {
    isAdmin,
    isJefatura,
    isGeneraOT,
    isValidaSolicitudes,
    isAlmacen,
    isRealizaIngresos
  };

  return (
    <div className="space-y-6">
      {/* Header de bienvenida */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Bienvenido, {user?.nombre_usuario}!
        </h1>
        <p className="text-gray-600">
          Sistema de Control de Almacén • Rol: <span className="font-semibold text-blue-600">{roleName}</span>
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Productos"
          value={mockStats.productos.toLocaleString()}
          icon="📦"
          color="blue"
          description="Total en sistema"
        />
        
        <StatCard
          title="Stock Bajo"
          value={mockStats.stockBajo}
          icon="⚠️"
          color="orange"
          description="Requieren atención"
        />
        
        <StatCard
          title="Solicitudes"
          value={mockStats.solicitudesPendientes}
          icon="📋"
          color="purple"
          description="Pendientes de procesar"
        />
        
        <StatCard
          title="OT Activas"
          value={mockStats.otActivas}
          icon="🔧"
          color="green"
          description="En proceso"
        />
        
        <StatCard
          title="Movimientos"
          value={mockStats.movimientosHoy}
          icon="📊"
          color="indigo"
          description="Realizados hoy"
        />
      </div>

      {/* Panel de información del usuario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Info del usuario */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Usuario
          </h2>
          
          <div className="space-y-3">
            <InfoRow label="Código" value={user?.codigo_usuario || 'N/A'} />
            <InfoRow label="Email" value={user?.email_usuario || 'N/A'} />
            <InfoRow label="Área" value={user?.area_usuario || 'Sin asignar'} />
            <InfoRow label="Tipo de Usuario" value={`${userRole} - ${roleName}`} />
            <InfoRow label="Estado" value={user?.estado_usuario === 1 ? 'Activo' : 'Inactivo'} />
            <InfoRow label="Último Login" value={user?.ultimo_login ? new Date(user.ultimo_login).toLocaleString() : 'N/A'} />
          </div>
        </div>

        {/* Permisos y accesos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Permisos y Accesos
          </h2>
          
          <div className="space-y-3">
            <PermissionRow label="Administrador" hasPermission={isAdmin} />
            <PermissionRow label="Jefatura" hasPermission={isJefatura} />
            <PermissionRow label="Genera OT" hasPermission={isGeneraOT} />
            <PermissionRow label="Valida Solicitudes" hasPermission={isValidaSolicitudes} />
            <PermissionRow label="Almacén/Despacho" hasPermission={isAlmacen} />
            <PermissionRow label="Realiza Ingresos" hasPermission={isRealizaIngresos} />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Módulos Accesibles ({accessibleModules.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {accessibleModules.map(module => (
                <span
                  key={module}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                >
                  {module}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Estado del Sistema
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SystemStatus
            label="Autenticación"
            status={isAuthenticated ? 'Activo' : 'Inactivo'}
            isHealthy={isAuthenticated}
          />
          
          <SystemStatus
            label="Conexión Backend"
            status="Conectado"
            isHealthy={true}
          />
          
          <SystemStatus
            label="Base de Datos"
            status="Operativo"
            isHealthy={true}
          />
        </div>
      </div>

      {/* Debug info para desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🔧 Debug Information
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">User Object:</h3>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Role Permissions:</h3>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(rolePermissions, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para tarjetas de estadísticas
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'orange' | 'purple' | 'green' | 'indigo';
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, description }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

// Componente para filas de información
interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

// Componente para permisos
interface PermissionRowProps {
  label: string;
  hasPermission: boolean;
}

const PermissionRow: React.FC<PermissionRowProps> = ({ label, hasPermission }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className={`text-sm font-medium ${hasPermission ? 'text-green-600' : 'text-gray-400'}`}>
      {hasPermission ? '✅ Permitido' : '❌ No permitido'}
    </span>
  </div>
);

// Componente para estado del sistema
interface SystemStatusProps {
  label: string;
  status: string;
  isHealthy: boolean;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ label, status, isHealthy }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <span className={`text-sm font-medium ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
      {isHealthy ? '🟢' : '🔴'} {status}
    </span>
  </div>
);

export default DashboardPage;