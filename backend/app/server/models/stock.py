# backend/app/server/models/stock.py
from pydantic import BaseModel, Field, validator
from typing import Optional
from decimal import Decimal
from datetime import date, datetime
from .base import BaseSchema

class StockResponse(BaseSchema):
    """Schema para respuesta de stock"""
    id_stock: int
    producto_id: int
    producto_codigo: str
    producto_nombre: str
    cantidad_disponible: int
    cantidad_reservada: int
    cantidad_total: int
    ubicacion_fisica: Optional[str] = None
    lote_serie: Optional[str] = None
    fecha_vencimiento: Optional[date] = None
    costo_promedio: Optional[Decimal] = None
    valor_inventario: Optional[Decimal] = None
    fecha_ultimo_movimiento: Optional[datetime] = None
    estado_stock: int
    alerta_generada: bool = False
    
    class Config:
        from_attributes = True

class StockAlert(BaseModel):
    """Schema para alertas de stock"""
    producto_id: int
    producto_codigo: str
    producto_nombre: str
    cantidad_actual: int
    stock_minimo: int
    stock_critico: int
    tipo_alerta: str  # "bajo", "critico", "vencimiento"
    urgencia: str     # "baja", "media", "alta", "critica"
    fecha_alerta: datetime
    
class StockAdjust(BaseModel):
    """Schema para ajuste de stock"""
    producto_id: int = Field(..., description="ID del producto")
    cantidad_ajuste: int = Field(..., description="Cantidad a ajustar (+ o -)")
    motivo: str = Field(..., min_length=5, max_length=200, description="Motivo del ajuste")
    ubicacion: Optional[str] = Field(None, description="Ubicación física")
    lote_serie: Optional[str] = Field(None, description="Lote o serie")
    
    @validator('cantidad_ajuste')
    def validate_cantidad(cls, v):
        if v == 0:
            raise ValueError('La cantidad de ajuste no puede ser cero')
        return v

class StockValuation(BaseModel):
    """Schema para valorización de stock"""
    total_productos: int
    valor_total_inventario: Decimal
    productos_stock_bajo: int
    productos_stock_critico: int
    productos_sin_stock: int
    productos_vencidos: int
    productos_por_vencer: int
    fecha_calculo: datetime

class StockMovement(BaseModel):
    """Schema para movimiento de stock"""
    producto_codigo: str
    producto_nombre: str
    tipo_movimiento: str
    cantidad_anterior: int
    cantidad_movimiento: int
    cantidad_actual: int
    motivo: str
    fecha_movimiento: datetime
    realizado_por: str