import { Badge } from "@/components/common/atoms/Badge";
import { Button } from "@/components/common/atoms/Button";
import type { Ingreso } from "@/types/ingresos";

interface IngresoTableProps {
  ingresos: Ingreso[];
  onValidate: (id: number) => void;
  onCancel: (id: number) => void;
}

const estadoColors: Record<number, string> = {
  0: "bg-red-100 text-red-800",
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-green-100 text-green-800",
  3: "bg-blue-100 text-blue-800",
};

const estadoLabels: Record<number, string> = {
  0: "Cancelado",
  1: "Creado",
  2: "Validado",
  3: "Modificado",
};

export const IngresoTable: React.FC<IngresoTableProps> = ({
  ingresos,
  onValidate,
  onCancel,
}) => (
  <div className="overflow-x-auto bg-white rounded-lg shadow">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
          <th className="px-6 py-3">Estado</th>
          <th className="px-6 py-3">Fecha</th>
          <th className="px-6 py-3">Costo Total</th>
          <th className="px-6 py-3">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {ingresos.map((ing) => (
          <tr key={ing.id_ingreso}>
            <td className="px-6 py-4">{ing.proveedor}</td>
            <td className="px-6 py-4">
              <Badge text={estadoLabels[ing.condicion_ingreso]} color={estadoColors[ing.condicion_ingreso]} />
            </td>
            <td className="px-6 py-4">{ing.fecha}</td>
            <td className="px-6 py-4">{ing.costo_total ?? "-"}</td>
            <td className="px-6 py-4 flex gap-2">
              {ing.condicion_ingreso === 1 && (
                <Button variant="primary" onClick={() => onValidate(ing.id_ingreso)}>
                  Validar
                </Button>
              )}
              {ing.condicion_ingreso === 1 && (
                <Button variant="danger" onClick={() => onCancel(ing.id_ingreso)}>
                  Cancelar
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
