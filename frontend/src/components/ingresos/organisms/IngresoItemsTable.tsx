"use client";

import { Input } from "@/components/common/atoms/Input";
import { Button } from "@/components/common/atoms/Button";

export interface IngresoItemForm {
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  costo_unitario: number;
  lote_serie?: string;
  fecha_vencimiento?: string;
  ubicacion?: string;
}

export const IngresoItemsTable: React.FC<{
  items: IngresoItemForm[];
  onChange: (items: IngresoItemForm[]) => void;
}> = ({ items, onChange }) => {
  const handleUpdate = (index: number, field: keyof IngresoItemForm, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  const addItem = () => {
    onChange([...items, { producto_id: 0, producto_nombre: "", cantidad: 0, costo_unitario: 0 }]);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Detalle de ítems</h3>
        <Button variant="primary" onClick={addItem}>+ Agregar Ítem</Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No hay ítems aún</p>
      ) : (
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-sm">Producto</th>
              <th className="px-2 py-2 text-sm">Cantidad</th>
              <th className="px-2 py-2 text-sm">Costo Unitario</th>
              <th className="px-2 py-2 text-sm">Subtotal</th>
              <th className="px-2 py-2 text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-2">
                  <Input
                    placeholder="Nombre producto"
                    value={item.producto_nombre}
                    onChange={(e) => handleUpdate(i, "producto_nombre", e.target.value)}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => handleUpdate(i, "cantidad", Number(e.target.value))}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    value={item.costo_unitario}
                    onChange={(e) => handleUpdate(i, "costo_unitario", Number(e.target.value))}
                  />
                </td>
                <td className="px-2 py-2 text-sm text-gray-800">
                  {(item.cantidad * item.costo_unitario).toFixed(2)}
                </td>
                <td className="px-2 py-2">
                  <Button variant="danger" onClick={() => removeItem(i)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
