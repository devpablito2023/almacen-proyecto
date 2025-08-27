'use client';

import React from 'react';
import { DashboardMobileSidebarProps } from '@/types/layout';
import Sidebar from '@/components/layout/Sidebar';

/**
 * SIDEBAR MÓVIL PARA EL LAYOUT
 * 
 * Overlay con sidebar para dispositivos móviles
 */
export default function DashboardMobileSidebar({ 
  isOpen,
  onClose,
  className = '' 
}: DashboardMobileSidebarProps) {
  
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${className}`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar móvil */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Navegación</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar menú"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
