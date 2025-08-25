import React from 'react';
import MainLayout from '../../components/layout/MainLayout';

/**
 * Layout para el grupo de rutas del dashboard
 * Envuelve todas las páginas protegidas con el MainLayout
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}