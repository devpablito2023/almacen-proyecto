import { create } from 'zustand';

interface StockFilters {
  search?: string;
  tipo_producto?: string;
  categoria_producto?: string;
  nivel_alerta?: string;
  con_stock?: boolean;
}

interface StockStore {
  filters: StockFilters;
  setFilters: (filters: Partial<StockFilters>) => void;
}

export const useStockStore = create<StockStore>((set) => ({
  filters: {},
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  }))
}));
