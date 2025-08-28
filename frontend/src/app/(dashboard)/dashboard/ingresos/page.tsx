'use client';

import { useState } from "react";
import { IngresosLayout } from "@/components/ingresos/templates/IngresosLayout";
import { IngresoStats } from "@/components/ingresos/organisms/IngresoStats";
import { IngresoActionBar } from "@/components/ingresos/organisms/IngresoActionBar";
import { IngresoTable } from "@/components/ingresos/organisms/IngresoTable";
import { Select } from "@/components/common/atoms/Select";
import { Input } from "@/components/common/atoms/Input";
import { Pagination } from "@/components/common/molecules/Pagination";
import { ConfirmDialog } from "@/components/common/molecules/ConfirmDialog";

import { useIngresos } from "@/hooks/api/useIngresos";
import { useIngresosStore } from "@/stores/ingresosStore";
import { authService } from "@/lib/auth/authService";

const cookieUser = authService.getUserInfoFromCookie();

export default function IngresosPage() {
  // Global (Zustand)
  const { filters, setFilters, ui, toggleModal, selectedIngreso, setSelectedIngreso } = useIngresosStore();

  // Server state
  const { list, stats, loading, validate, cancel } = useIngresos(filters);

  // Local UI
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const canCreateOrImport = (cookieUser?.tipo_usuario ?? -1) === 0 || (cookieUser?.tipo_usuario ?? -1) === 5;

  // Filtro por búsqueda local (puedes llevarlo a la API si quieres)
  const filtered = list.filter((ing) => {
    const term = search.toLowerCase();
    return (ing.proveedor ?? "").toLowerCase().includes(term) || String(ing.id_ingreso).includes(term);
  });

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const data = filtered.slice(start, start + perPage);

  const filtersPanel = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
      <Select
        label="Estado"
        value={filters.estado ?? ""}
        onChange={(e) => setFilters({ estado: (e.target.value === "" ? "" : Number(e.target.value)) as any })}
        options={[
          { value: "", label: "Todos" },
          { value: 1, label: "Creado" },
          { value: 2, label: "Validado" },
          { value: 0, label: "Cancelado" },
          { value: 3, label: "Modificado" },
        ]}
      />
      <Input
        label="Fecha inicio"
        type="date"
        value={filters.fecha_inicio ?? ""}
        onChange={(e) => setFilters({ fecha_inicio: (e.target as HTMLInputElement).value })}
      />
      <Input
        label="Fecha fin"
        type="date"
        value={filters.fecha_fin ?? ""}
        onChange={(e) => setFilters({ fecha_fin: (e.target as HTMLInputElement).value })}
      />
      <Input
        label="Proveedor"
        placeholder="Nombre proveedor"
        value={filters.proveedor ?? ""}
        onChange={(e) => setFilters({ proveedor: (e.target as HTMLInputElement).value })}
      />
    </div>
  );

  return (
    <IngresosLayout
      title="Ingresos"
      subtitle="Gestión y validación de ingresos al almacén"
      actions={
        <IngresoActionBar
          canCreateOrImport={canCreateOrImport}
          onImport={() => {/* abrir file input + ingresosService.uploadExcel */}}
          onCreate={() => (window.location.href = "/dashboard/ingresos/nuevo")}
          onExport={() => {/* llamar a tu export en intermedia, si aplica */}}
        />
      }
      stats={
        <IngresoStats
          total={stats?.total_ingresos}
          validados={stats?.total_validado}
          cancelados={stats?.total_cancelado}
          valorTotal={stats?.costo_total_periodo}
        />
      }
      searchValue={search}
      onSearchChange={(v) => {
        setSearch(v);
        setPage(1);
      }}
      filters={filtersPanel}
      table={
        loading ? (
          <div>Cargando ingresos…</div>
        ) : (
          <IngresoTable
            data={data as any}
            canCreateOrImport={canCreateOrImport}
            onView={(id) => (window.location.href = `/dashboard/ingresos/${id}`)}
            onValidate={(id) => {
              setSelectedIngreso({ id_ingreso: id, condicion_ingreso: 1 } as any);
              toggleModal("showValidateModal", true);
            }}
            onCancel={(id) => {
              setSelectedIngreso({ id_ingreso: id, condicion_ingreso: 1 } as any);
              toggleModal("showCancelModal", true);
            }}
          />
        )
      }
      pagination={
        <Pagination
          page={page}
          total={total}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
        />
      }
      modals={
        <>
          <ConfirmDialog
            open={ui.showValidateModal}
            title="Validar ingreso"
            message={`¿Desea validar el ingreso #${selectedIngreso?.id_ingreso}?`}
            onCancel={() => toggleModal("showValidateModal", false)}
            onConfirm={async () => {
              if (selectedIngreso) {
                await validate({ id: selectedIngreso.id_ingreso, data: { cantidad_validada: 1, ubicacion_final: "A1" } as any });
                toggleModal("showValidateModal", false);
              }
            }}
          />
          <ConfirmDialog
            open={ui.showCancelModal}
            title="Cancelar ingreso"
            message={`¿Desea cancelar el ingreso #${selectedIngreso?.id_ingreso}?`}
            onCancel={() => toggleModal("showCancelModal", false)}
            onConfirm={async () => {
              if (selectedIngreso) {
                await cancel({ id: selectedIngreso.id_ingreso, motivo: "Motivo de cancelación" });
                toggleModal("showCancelModal", false);
              }
            }}
          />
        </>
      }
    />
  );
}
