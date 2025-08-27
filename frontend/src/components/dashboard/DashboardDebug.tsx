'use client';

import React from 'react';
import { DashboardDebugProps } from '@/types/dashboard';

/**
 * PANEL DE DEBUG PARA DESARROLLO
 * 
 * Solo visible en modo desarrollo, muestra información técnica
 */
export default function DashboardDebug({ user, rolePermissions }: DashboardDebugProps) {
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
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
  );
}
