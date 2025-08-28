import { Button } from "@/components/common/atoms/Button";
import { PlusIcon, ArrowUpTrayIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export const IngresoActionBar: React.FC<{
  canCreateOrImport: boolean;
  onImport: () => void;
  onCreate: () => void;
  onExport: () => void;
}> = ({ canCreateOrImport, onImport, onCreate, onExport }) => (
  <div className="flex gap-3">
    {canCreateOrImport && (
      <>
        <Button className="gap-2" onClick={onImport}>
          <ArrowUpTrayIcon className="w-5 h-5" /> Importar Excel
        </Button>
        <Button variant="primary" className="gap-2" onClick={onCreate}>
          <PlusIcon className="w-5 h-5" /> Nuevo Ingreso
        </Button>
      </>
    )}
    <Button variant="secondary" className="gap-2" onClick={onExport}>
      <ArrowDownTrayIcon className="w-5 h-5" /> Exportar
    </Button>
  </div>
);
