"use client";

import { useState } from "react";
import { Input } from "@/components/common/atoms/Input";
import { Button } from "@/components/common/atoms/Button";
import { ProductoSelect } from "@/components/productos/ProductoSelect";
import { ingresosService } from "@/services/api/ingresos.service";

export const IngresoForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [form, setForm] = useState({
    producto_id: 0,
    proveedor_ingreso: "",
    factura_ingreso: "",
    orden_compra: "",
    cantidad_solicitada: 0,
    cantidad_recibida: 0,
    costo_unitario: 0,
    lote_serie: "",
    fecha_vencimiento: "",
    ubicacion_asignada: "",
    observaciones_ingreso: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const costoTotal = form.cantidad_recibida * form.costo_unitario;

  const handleSubmit = async () => {
    if (!form.producto_id) {
      alert("Debe seleccionar un producto");
      return;
    }
    if (form.cantidad_recibida > form.cantidad_solicitada) {
      alert("La cantidad recibida no puede ser mayor a la solicitada");
      return;
    }
    if (form.costo_unitario <= 0) {
      alert("El costo unitario debe ser mayor a 0");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        producto_id: Number(form.producto_id),
        cantidad_solicitada: Number(form.cantidad_solicitada),
        cantidad_recibida: Number(form.cantidad_recibida),
        costo_unitario: Number(form.costo_unitario),
        fecha_vencimiento: form.fecha_vencimiento || undefined,
      };
      await ingresosService.create(payload);
      alert("Ingreso creado exitosamente ✅");
      onSuccess?.();
    } catch (e) {
      console.error("Error creando ingreso:", e);
      alert("Error al crear ingreso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Producto con búsqueda remota */}
      <ProductoSelect onSelect={(id) => handleChange("producto_id", id)} />

      {/* Proveedor, Factura, Orden */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Proveedor"
          value={form.proveedor_ingreso}
          onChange={(e) => handleChange("proveedor_ingreso", e.target.value)}
        />
        <Input
          label="Factura"
          value={form.factura_ingreso}
          onChange={(e) => handleChange("factura_ingreso", e.target.value)}
        />
      </div>
      <Input
        label="Orden de Compra"
        value={form.orden_compra}
        onChange={(e) => handleChange("orden_compra", e.target.value)}
      />

      {/* Cantidades y Costo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Cantidad Solicitada"
          type="number"
          value={form.cantidad_solicitada}
          onChange={(e) => handleChange("cantidad_solicitada", e.target.value)}
        />
        <Input
          label="Cantidad Recibida"
          type="number"
          value={form.cantidad_recibida}
          onChange={(e) => handleChange("cantidad_recibida", e.target.value)}
        />
        <Input
          label="Costo Unitario"
          type="number"
          value={form.costo_unitario}
          onChange={(e) => handleChange("costo_unitario", e.target.value)}
        />
      </div>

      {/* Lote, Vencimiento, Ubicación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Lote / Serie"
          value={form.lote_serie}
          onChange={(e) => handleChange("lote_serie", e.target.value)}
        />
        <Input
          label="Fecha Vencimiento"
          type="date"
          value={form.fecha_vencimiento}
          onChange={(e) => handleChange("fecha_vencimiento", e.target.value)}
        />
        <Input
          label="Ubicación Asignada"
          value={form.ubicacion_asignada}
          onChange={(e) => handleChange("ubicacion_asignada", e.target.value)}
        />
      </div>

      {/* Observaciones */}
      <Input
        label="Observaciones"
        value={form.observaciones_ingreso}
        onChange={(e) => handleChange("observaciones_ingreso", e.target.value)}
      />

      {/* Resumen y Guardar */}
      <div className="flex justify-between items-center mt-4">
        <p className="font-semibold">Costo Total: {costoTotal.toFixed(2)}</p>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          Guardar Ingreso
        </Button>
      </div>
    </div>
  );
};
