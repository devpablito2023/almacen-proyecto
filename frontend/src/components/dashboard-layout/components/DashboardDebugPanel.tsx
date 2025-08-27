'use client';

import React from 'react';
import { DashboardDebugPanelProps } from '@/types/layout';

/**
 * PANEL DE DEBUG PARA EL LAYOUT
 * 
 * Solo visible en desarrollo, muestra información de estado del layout
 */
export default function DashboardDebugPanel({ 
  pathname,
  pageTitle,
  breadcrumbsCount,
  isSidebarCollapsed,
  isMobileSidebarOpen,
  userRole,
  className = '' 
}: DashboardDebugPanelProps) {
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <details className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-xs">
        <summary className="p-3 cursor-pointer text-xs font-medium text-gray-700 hover:bg-gray-50">
          🔧 Layout Debug
        </summary>
        <div className="p-3 border-t border-gray-200 text-xs font-mono space-y-1">
          <div><strong>Path:</strong> {pathname}</div>
          <div><strong>Title:</strong> {pageTitle}</div>
          <div><strong>Breadcrumbs:</strong> {breadcrumbsCount}</div>
          <div><strong>Sidebar:</strong> {isSidebarCollapsed ? 'Collapsed' : 'Expanded'}</div>
          <div><strong>Mobile:</strong> {isMobileSidebarOpen ? 'Open' : 'Closed'}</div>
          <div><strong>User Role:</strong> {userRole}</div>
        </div>
      </details>
    </div>
  );
}
