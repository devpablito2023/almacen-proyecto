'use client';

import { IngresoNuevoLayout } from "@/components/ingresos/templates/IngresoNuevoLayout";
import { IngresoForm } from "@/components/ingresos/organisms/IngresoForm";

export default function NuevoIngresoPage() {
  return (
    <IngresoNuevoLayout title="Nuevo Ingreso">
      <IngresoForm onSuccess={() => {
        window.location.href = "/dashboard/ingresos";
      }} />
    </IngresoNuevoLayout>
  );
}
