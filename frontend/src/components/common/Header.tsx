"use client";

import { useState } from "react";
import { Menu, User } from "lucide-react";

export const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden text-gray-600"
      >
        <Menu size={24} />
      </button>

      <h1 className="text-lg font-semibold text-gray-700">
        Sistema de Control de Almacén
      </h1>

      <div className="flex items-center gap-3">
        <User className="text-gray-600" />
        <span className="text-sm font-medium">Usuario</span>
      </div>
    </header>
  );
};
