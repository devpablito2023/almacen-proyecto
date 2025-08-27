'use client';

import React from 'react';
import { DashboardUserInfoProps, InfoRowProps, PermissionRowProps } from '@/types/dashboard';

/**
 * INFORMACIÓN DEL USUARIO Y PERMISOS
 * 
 * Muestra información detallada del usuario y sus permisos
 */
export default function DashboardUserInfo({
  user,
  userRole,
  roleName,
  rolePermissions,
  accessibleModules
}: DashboardUserInfoProps) {
  return (
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
          <PermissionRow label="Administrador" hasPermission={rolePermissions.isAdmin} />
          <PermissionRow label="Jefatura" hasPermission={rolePermissions.isJefatura} />
          <PermissionRow label="Genera OT" hasPermission={rolePermissions.isGeneraOT} />
          <PermissionRow label="Valida Solicitudes" hasPermission={rolePermissions.isValidaSolicitudes} />
          <PermissionRow label="Almacén/Despacho" hasPermission={rolePermissions.isAlmacen} />
          <PermissionRow label="Realiza Ingresos" hasPermission={rolePermissions.isRealizaIngresos} />
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
  );
}

/**
 * COMPONENTE PARA FILAS DE INFORMACIÓN
 */
const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

/**
 * COMPONENTE PARA PERMISOS
 */
const PermissionRow: React.FC<PermissionRowProps> = ({ label, hasPermission }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className={`text-sm font-medium ${hasPermission ? 'text-green-600' : 'text-gray-400'}`}>
      {hasPermission ? '✅ Permitido' : '❌ No permitido'}
    </span>
  </div>
);
