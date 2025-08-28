import { create } from "zustand";
import type { Ingreso, IngresoEstado } from "@/types/ingresos";

/* =========================================================
   Estado global del módulo Ingresos
   - Filtros de búsqueda
   - Selección actual
   - UI states (modales, etc.)
   ========================================================= */

interface IngresosFilters {
  search?: string;
  proveedor?: string;
  estado?: IngresoEstado | "";
  fecha_inicio?: string; // YYYY-MM-DD
  fecha_fin?: string;    // YYYY-MM-DD
  page?: number;
  limit?: number;
}

interface IngresosUIState {
  showCreateModal: boolean;
  showEditModal: boolean;
  showValidateModal: boolean;
  showCancelModal: boolean;
}

interface IngresosStore {
  filters: IngresosFilters;
  selectedIngreso: Ingreso | null;
  ui: IngresosUIState;

  // Actions
  setFilters: (filters: Partial<IngresosFilters>) => void;
  clearFilters: () => void;

  setSelectedIngreso: (ingreso: Ingreso | null) => void;

  toggleModal: (modal: keyof IngresosUIState, open: boolean) => void;
}

export const useIngresosStore = create<IngresosStore>((set) => ({
  filters: {
    page: 1,
    limit: 20,
    estado: "",
  },
  selectedIngreso: null,
  ui: {
    showCreateModal: false,
    showEditModal: false,
    showValidateModal: false,
    showCancelModal: false,
  },

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  clearFilters: () =>
    set(() => ({
      filters: { page: 1, limit: 20, estado: "" },
    })),

  setSelectedIngreso: (ingreso) => set(() => ({ selectedIngreso: ingreso })),

  toggleModal: (modal, open) =>
    set((state) => ({
      ui: { ...state.ui, [modal]: open },
    })),
}));
