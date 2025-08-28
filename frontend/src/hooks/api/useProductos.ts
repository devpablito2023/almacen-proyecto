import { useQuery } from "@tanstack/react-query";
import { productosService, Producto } from "@/services/api/productos.service";

export function useProductosSearch(query: string, limit = 20) {
  return useQuery<Producto[]>({
    queryKey: ["productos-search", query, limit],
    queryFn: async () => {
      if (!query || query.length < 3) return []; // seguridad extra
      console.log ("Buscando desde hook productos con query: %s y limit: %d", query, limit);
       
      const res = await productosService.search(query, limit);
      console.log("Productos encontrados desde hook:", res);
      return res
    },
    enabled: query.length >= 3, // solo busca si hay mínimo 3 caracteres
    staleTime: 1000 * 60,       // cache de 1 min
    gcTime: 1000 * 60 * 5,      // (opcional) recolector de cache a los 5 min
  });
}
