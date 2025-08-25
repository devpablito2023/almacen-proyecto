"use client";

import Link from "next/link";
import { Package, Users, BarChart, Warehouse } from "lucide-react";

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-gray-900 text-gray-200">
      <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-gray-700">
        Almacén
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700">
          <BarChart size={18} /> Dashboard
        </Link>
        <Link href="/usuarios" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700">
          <Users size={18} /> Usuarios
        </Link>
        <Link href="/productos" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700">
          <Package size={18} /> Productos
        </Link>
        <Link href="/stock" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700">
          <Warehouse size={18} /> Stock
        </Link>
      </nav>
    </aside>
  );
};
