import { StatCard } from "@/components/common/molecules/StatCard";
import { CurrencyDollarIcon, CheckBadgeIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";

export const IngresoStats: React.FC<{
  total?: number; validados?: number; cancelados?: number; valorTotal?: number;
}> = ({ total = 0, validados = 0, cancelados = 0, valorTotal = 0 }) => {
  const pendientes = Math.max(0, total - validados - cancelados);
  const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(valorTotal);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard title="Total Ingresos" value={total} icon={<ClockIcon className="w-6 h-6" />} accent="blue" />
      <StatCard title="Validados" value={validados} icon={<CheckBadgeIcon className="w-6 h-6" />} accent="green" />
      <StatCard title="Pendientes" value={pendientes} icon={<ClockIcon className="w-6 h-6" />} accent="yellow" />
      <StatCard title="Valor Total" value={money} icon={<CurrencyDollarIcon className="w-6 h-6" />} accent="purple" />
    </div>
  );
};
