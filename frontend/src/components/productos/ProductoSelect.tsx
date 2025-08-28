"use client";

import { useState } from "react"; // 👈 te falta esta línea

import { AsyncSelect } from "@/components/common/molecules/AsyncSelect";
import { useProductosSearch } from "@/hooks/api/useProductos";

export const ProductoSelect: React.FC<{ onSelect: (id: number) => void }> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const { data: productos = [], isFetching } = useProductosSearch(query);
  console.log("Productos encontrados:", productos);
  const options = productos.map((p) => ({
    value: p.id_producto,
    label: `${p.nombre_producto} (${p.codigo_producto})`,
  }));

  return (
    <AsyncSelect
      label="Producto"
      placeholder="Buscar producto..."
      fetchOptions={async (q) => {
        setQuery(q);
        return options;
      }}
      onSelect={(opt) => onSelect(Number(opt.value))}
      loading={isFetching}
    />
  );
};
