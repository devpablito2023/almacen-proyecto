import { Badge } from "@/components/common/atoms/Badge";
import { Button } from "@/components/common/atoms/Button";

type Estado = 0 | 1 | 2 | 3;
export interface IngresoRow {
  id_ingreso: number;
  proveedor?: string;
  condicion_ingreso: Estado;
  fecha?: string;
  costo_total?: number;
}

const estadoColors: Record<Estado, string> = {
  0: "bg-red-100 text-red-800",
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-green-100 text-green-800",
  3: "bg-blue-100 text-blue-800",
};
const estadoLabels: Record<Estado, string> = {
  0: "Cancelado",
  1: "Creado",
  2: "Validado",
  3: "Modificado",
};

export const IngresoTable: React.FC<{
  data: IngresoRow[];
  canCreateOrImport: boolean;
  onView: (id: number) => void;
  onValidate: (id: number) => void;
  onCancel: (id: number) => void;
}> = ({ data, canCreateOrImport, onView, onValidate, onCancel }) => {
  const formatCurrency = (v?: number) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v ?? 0);

  return (
    <div className="hidden md:block overflow-x-auto">
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
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((ing) => (
            <tr key={ing.id_ingreso} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">{ing.proveedor ?? "-"}</td>
              <td className="px-6 py-4">
                <Badge text={estadoLabels[ing.condicion_ingreso]} color={estadoColors[ing.condicion_ingreso]} />
              </td>
              <td className="px-6 py-4 text-sm">{ing.fecha ?? "-"}</td>
              <td className="px-6 py-4 text-sm">{formatCurrency(ing.costo_total)}</td>
              <td className="px-6 py-4 flex gap-2">
                <Button variant="ghost" onClick={() => onView(ing.id_ingreso)}>Ver</Button>
                {canCreateOrImport && ing.condicion_ingreso === 1 && (
                  <>
                    <Button variant="primary" onClick={() => onValidate(ing.id_ingreso)}>Validar</Button>
                    <Button variant="danger" onClick={() => onCancel(ing.id_ingreso)}>Cancelar</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {data.map((ing) => (
          <div key={ing.id_ingreso} className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">{ing.proveedor ?? "-"}</p>
                <p className="text-xs text-gray-500">{ing.fecha ?? "-"}</p>
              </div>
              <Badge text={estadoLabels[ing.condicion_ingreso]} color={estadoColors[ing.condicion_ingreso]} />
            </div>
            <div className="mt-2 text-sm">Costo: {formatCurrency(ing.costo_total)}</div>
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" onClick={() => onView(ing.id_ingreso)}>Ver</Button>
              {canCreateOrImport && ing.condicion_ingreso === 1 && (
                <>
                  <Button variant="primary" onClick={() => onValidate(ing.id_ingreso)}>Validar</Button>
                  <Button variant="danger" onClick={() => onCancel(ing.id_ingreso)}>Cancelar</Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
