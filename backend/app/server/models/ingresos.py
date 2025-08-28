# backend/app/server/models/ingresos.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime, date
from .base import BaseSchema

class IngresoResponse(BaseSchema):
    """Schema para respuesta de ingreso"""
    id_ingreso: int
    numero_ingreso: str
    producto_id: int
    proveedor_ingreso: str
    factura_ingreso: Optional[str] = None
    orden_compra: Optional[str] = None
    cantidad_solicitada: int
    cantidad_recibida: int
    costo_unitario: Decimal
    costo_total: Decimal
    lote_serie: Optional[str] = None
    fecha_vencimiento: Optional[date] = None
    ubicacion_asignada: Optional[str] = None
    url_foto_ingreso: Optional[str] = None
    documento_ingreso: Optional[str] = None
    observaciones_ingreso: Optional[str] = None
    condicion_ingreso: int
    estado_ingreso: int
    fecha_recepcion: Optional[datetime] = None
    recibido_por: Optional[int] = None
    recibido_por_name: Optional[str] = None
    validado_por: Optional[int] = None
    validado_por_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: int
    created_by_name: str
    updated_by: Optional[int] = None
    updated_by_name: Optional[str] = None
    
    # Información del producto relacionado
    producto_codigo: Optional[str] = None
    producto_nombre: Optional[str] = None
    producto_magnitud: Optional[str] = None

class IngresoCreate(BaseModel):
    """Schema para crear ingreso"""
    producto_id: int = Field(..., description="ID del producto")
    proveedor_ingreso: str = Field(..., min_length=3, max_length=200, description="Nombre del proveedor")
    factura_ingreso: Optional[str] = Field(None, max_length=50, description="Número de factura")
    orden_compra: Optional[str] = Field(None, max_length=50, description="Número de orden de compra")
    cantidad_solicitada: int = Field(..., gt=0, description="Cantidad solicitada")
    cantidad_recibida: int = Field(..., ge=0, description="Cantidad recibida")
    costo_unitario: Decimal = Field(..., gt=0, description="Costo unitario del producto")
    lote_serie: Optional[str] = Field(None, max_length=50, description="Lote o serie")
    fecha_vencimiento: Optional[date] = Field(None, description="Fecha de vencimiento")
    ubicacion_asignada: Optional[str] = Field(None, max_length=100, description="Ubicación asignada")
    url_foto_ingreso: Optional[str] = Field(None, description="URL de foto del ingreso")
    documento_ingreso: Optional[str] = Field(None, description="Documento adjunto")
    observaciones_ingreso: Optional[str] = Field(None, max_length=1000, description="Observaciones")
    
    @validator('cantidad_recibida')
    def validate_cantidad_recibida(cls, v, values):
        if 'cantidad_solicitada' in values and v > values['cantidad_solicitada']:
            raise ValueError('La cantidad recibida no puede ser mayor a la solicitada')
        return v
    
    @validator('fecha_vencimiento')
    def validate_fecha_vencimiento(cls, v):
        if v and v <= date.today():
            raise ValueError('La fecha de vencimiento debe ser posterior a la fecha actual')
        return v

class IngresoUpdate(BaseModel):
    """Schema para actualizar ingreso"""
    proveedor_ingreso: Optional[str] = Field(None, min_length=3, max_length=200)
    factura_ingreso: Optional[str] = Field(None, max_length=50)
    orden_compra: Optional[str] = Field(None, max_length=50)
    cantidad_solicitada: Optional[int] = Field(None, gt=0)
    cantidad_recibida: Optional[int] = Field(None, ge=0)
    costo_unitario: Optional[Decimal] = Field(None, gt=0)
    lote_serie: Optional[str] = Field(None, max_length=50)
    fecha_vencimiento: Optional[date] = None
    ubicacion_asignada: Optional[str] = Field(None, max_length=100)
    observaciones_ingreso: Optional[str] = Field(None, max_length=1000)

class IngresoValidate(BaseModel):
    """Schema para validar ingreso"""
    cantidad_validada: int = Field(..., gt=0, description="Cantidad validada por almacén")
    ubicacion_final: Optional[str] = Field(None, max_length=100, description="Ubicación final")
    observaciones_validacion: Optional[str] = Field(None, max_length=500, description="Observaciones de validación")
    
    @validator('cantidad_validada')
    def validate_cantidad_validada(cls, v):
        if v <= 0:
            raise ValueError('La cantidad validada debe ser mayor a cero')
        return v

class IngresoBulk(BaseModel):
    """Schema para ingreso masivo"""
    ingresos: List[IngresoCreate] = Field(..., min_items=1, max_items=1000, description="Lista de ingresos")
    
    @validator('ingresos')
    def validate_ingresos(cls, v):
        if len(v) > 1000:
            raise ValueError('No se pueden procesar más de 1000 ingresos a la vez')
        return v

class IngresoExcelRow(BaseModel):
    """Schema para fila de Excel de ingreso"""
    codigo_producto: str = Field(..., description="Código del producto")
    proveedor: str = Field(..., description="Proveedor")
    factura: Optional[str] = None
    orden_compra: Optional[str] = None
    cantidad_solicitada: int = Field(..., gt=0)
    cantidad_recibida: int = Field(..., ge=0)
    costo_unitario: Decimal = Field(..., gt=0)
    lote_serie: Optional[str] = None
    fecha_vencimiento: Optional[str] = None  # Se validará y convertirá en el procesamiento
    ubicacion: Optional[str] = None
    observaciones: Optional[str] = None

class IngresoQuery(BaseModel):
    """Schema para consultas de ingreso"""
    producto_id: Optional[int] = Field(None, description="Filtrar por producto")
    proveedor: Optional[str] = Field(None, description="Filtrar por proveedor")
    fecha_inicio: Optional[date] = Field(None, description="Fecha inicio del período")
    fecha_fin: Optional[date] = Field(None, description="Fecha fin del período")
    condicion_ingreso: Optional[int] = Field(None, description="Condición del ingreso")
    estado_ingreso: Optional[int] = Field(None, description="Estado del ingreso")
    pendiente_validacion: Optional[bool] = Field(None, description="Solo pendientes de validación")
    page: int = Field(1, ge=1, description="Número de página")
    limit: int = Field(20, ge=1, le=100, description="Elementos por página")

class IngresoSearch(BaseModel):
    """Schema para búsqueda de ingresos"""
    q: Optional[str] = Field(None, description="Búsqueda general (producto, proveedor, factura)")
    producto_codigo: Optional[str] = Field(None, description="Código del producto")
    producto_nombre: Optional[str] = Field(None, description="Nombre del producto")
    proveedor: Optional[str] = Field(None, description="Nombre del proveedor")
    factura: Optional[str] = Field(None, description="Número de factura")
    orden_compra: Optional[str] = Field(None, description="Número de orden de compra")
    fecha_inicio: Optional[date] = Field(None, description="Fecha inicio")
    fecha_fin: Optional[date] = Field(None, description="Fecha fin")
    condicion_min: Optional[int] = Field(None, ge=0, le=3, description="Condición mínima")
    condicion_max: Optional[int] = Field(None, ge=0, le=3, description="Condición máxima")
    monto_min: Optional[Decimal] = Field(None, ge=0, description="Monto mínimo")
    monto_max: Optional[Decimal] = Field(None, ge=0, description="Monto máximo")
    con_vencimiento: Optional[bool] = Field(None, description="Solo productos con vencimiento")
    vencimiento_proximo: Optional[int] = Field(None, ge=1, le=365, description="Días hasta vencimiento")
    page: int = Field(1, ge=1, description="Número de página")
    limit: int = Field(20, ge=1, le=100, description="Elementos por página")
    sort_by: Optional[str] = Field("created_at", description="Campo para ordenar")
    sort_order: Optional[str] = Field("desc", description="Orden: asc o desc")

class IngresoStats(BaseModel):
    """Schema para estadísticas de ingresos"""
    total_ingresos: int
    ingresos_pendientes: int
    ingresos_validados: int
    ingresos_cancelados: int
    valor_total_ingresos: Decimal
    cantidad_total_ingresada: int
    proveedores_activos: int
    productos_ingresados: int
    periodo_inicio: datetime
    periodo_fin: datetime