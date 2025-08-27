# backend/app/server/models/kardex.py
from pydantic import BaseModel, Field, validator
from typing import Optional
from decimal import Decimal
from datetime import datetime
from .base import BaseSchema

class KardexResponse(BaseSchema):
    """Schema para respuesta de kardex"""
    id_kardex: int
    numero_movimiento: str
    producto_id: int
    producto_codigo: str
    producto_nombre: str
    lote_serie: Optional[str] = None
    ubicacion: Optional[str] = None
    operacion_kardex: str
    tipo_movimiento: str
    documento_referencia: Optional[str] = None
    numero_documento: Optional[str] = None
    cantidad_anterior: Decimal
    cantidad_movimiento: Decimal
    cantidad_actual: Decimal
    costo_unitario: Optional[Decimal] = None
    costo_total: Optional[Decimal] = None
    motivo_movimiento: Optional[str] = None
    solicitud_id: Optional[int] = None
    ot_numero: Optional[str] = None
    ingreso_id: Optional[int] = None
    estado_kardex: int
    fecha_movimiento: datetime
    realizado_por: int
    realizado_por_name: str
    autorizado_por: Optional[int] = None
    autorizado_por_name: Optional[str] = None
    created_at: datetime
    created_by: int
    created_by_name: str

class KardexCreate(BaseModel):
    """Schema para crear entrada en kardex"""
    producto_id: int = Field(..., description="ID del producto")
    operacion_kardex: str = Field(..., description="INGRESO/SALIDA/DEVOLUCION/AJUSTE_POSITIVO/AJUSTE_NEGATIVO/TRANSFERENCIA")
    tipo_movimiento: str = Field(..., description="COMPRA/DESPACHO/DEVOLUCION/AJUSTE/TRANSFERENCIA")
    cantidad_movimiento: Decimal = Field(..., gt=0, description="Cantidad del movimiento")
    costo_unitario: Optional[Decimal] = Field(None, ge=0, description="Costo unitario")
    documento_referencia: Optional[str] = Field(None, max_length=100, description="Documento de referencia")
    numero_documento: Optional[str] = Field(None, max_length=50, description="Número de documento")
    motivo_movimiento: Optional[str] = Field(None, max_length=500, description="Motivo del movimiento")
    lote_serie: Optional[str] = Field(None, max_length=50, description="Lote o serie")
    ubicacion: Optional[str] = Field(None, max_length=100, description="Ubicación física")
    solicitud_id: Optional[int] = Field(None, description="ID de solicitud relacionada")
    ot_numero: Optional[str] = Field(None, max_length=50, description="Número de OT")
    ingreso_id: Optional[int] = Field(None, description="ID de ingreso relacionado")
    
    @validator('operacion_kardex')
    def validate_operacion(cls, v):
        operaciones_validas = [
            "INGRESO", "SALIDA", "DEVOLUCION", 
            "AJUSTE_POSITIVO", "AJUSTE_NEGATIVO", "TRANSFERENCIA"
        ]
        if v not in operaciones_validas:
            raise ValueError(f'Operación debe ser una de: {", ".join(operaciones_validas)}')
        return v
    
    @validator('tipo_movimiento')
    def validate_tipo(cls, v):
        tipos_validos = [
            "COMPRA", "DESPACHO", "DEVOLUCION", 
            "AJUSTE", "TRANSFERENCIA"
        ]
        if v not in tipos_validos:
            raise ValueError(f'Tipo de movimiento debe ser uno de: {", ".join(tipos_validos)}')
        return v

class KardexQuery(BaseModel):
    """Schema para consultas de kardex"""
    producto_id: Optional[int] = Field(None, description="Filtrar por producto")
    fecha_inicio: Optional[datetime] = Field(None, description="Fecha inicio del período")
    fecha_fin: Optional[datetime] = Field(None, description="Fecha fin del período")
    operacion_kardex: Optional[str] = Field(None, description="Tipo de operación")
    tipo_movimiento: Optional[str] = Field(None, description="Tipo de movimiento")
    solicitud_id: Optional[int] = Field(None, description="ID de solicitud")
    ot_numero: Optional[str] = Field(None, description="Número de OT")
    page: int = Field(1, ge=1, description="Número de página")
    limit: int = Field(20, ge=1, le=100, description="Elementos por página")

class KardexSummary(BaseModel):
    """Schema para resumen de kardex"""
    total_movimientos: int
    total_ingresos: int
    total_salidas: int
    total_devoluciones: int
    valor_total_movimientos: Decimal
    productos_con_movimiento: int
    periodo_inicio: datetime
    periodo_fin: datetime

class KardexBalance(BaseModel):
    """Schema para balance de kardex por producto"""
    producto_id: int
    producto_codigo: str
    producto_nombre: str
    stock_inicial: Decimal
    total_ingresos: Decimal
    total_salidas: Decimal
    total_ajustes: Decimal
    stock_calculado: Decimal
    stock_sistema: Decimal
    diferencia: Decimal
    fecha_calculo: datetime