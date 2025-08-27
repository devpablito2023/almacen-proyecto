# backend/app/server/models/productos.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from decimal import Decimal
from datetime import date
from .base import BaseSchema

class ProductoCreate(BaseModel):
    """Schema para crear producto"""
    codigo_producto: str = Field(..., min_length=3, max_length=20, description="Código único del producto")
    nombre_producto: str = Field(..., min_length=2, max_length=200, description="Nombre del producto")
    tipo_producto: str = Field(..., description="Tipo: insumo, repuesto, herramienta, otro")
    categoria_producto: Optional[str] = Field(None, max_length=50, description="Categoría del producto")
    proveedor_producto: Optional[str] = Field(None, max_length=100, description="Proveedor principal")
    costo_unitario: Optional[Decimal] = Field(None, ge=0, description="Costo unitario")
    precio_referencial: Optional[Decimal] = Field(None, ge=0, description="Precio de referencia")
    ubicacion_fisica: Optional[str] = Field(None, max_length=50, description="Ubicación en almacén")
    stock_minimo: int = Field(default=1, ge=0, description="Stock mínimo")
    stock_maximo: int = Field(default=100, ge=1, description="Stock máximo")
    stock_critico: int = Field(default=0, ge=0, description="Stock crítico")
    descripcion_producto: Optional[str] = Field(None, max_length=500, description="Descripción detallada")
    magnitud_producto: str = Field(default="UND", max_length=10, description="Unidad de medida")
    requiere_lote: bool = Field(default=False, description="¿Requiere control de lotes?")
    dias_vida_util: Optional[int] = Field(None, ge=0, description="Días de vida útil")
    
    @validator('tipo_producto')
    def validate_tipo(cls, v):
        allowed_types = ['insumo', 'repuesto', 'herramienta', 'otro']
        if v.lower() not in allowed_types:
            raise ValueError(f'Tipo debe ser uno de: {", ".join(allowed_types)}')
        return v.lower()
    
    @validator('codigo_producto')
    def validate_codigo(cls, v):
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Código solo puede contener letras, números, guiones y guiones bajos')
        return v.upper()
    
    @validator('stock_critico')
    def validate_stock_critico(cls, v, values):
        if 'stock_minimo' in values and v > values['stock_minimo']:
            raise ValueError('Stock crítico no puede ser mayor al stock mínimo')
        return v

class ProductoUpdate(BaseModel):
    """Schema para actualizar producto"""
    nombre_producto: Optional[str] = Field(None, min_length=2, max_length=200)
    tipo_producto: Optional[str] = None
    categoria_producto: Optional[str] = Field(None, max_length=50)
    proveedor_producto: Optional[str] = Field(None, max_length=100)
    costo_unitario: Optional[Decimal] = Field(None, ge=0)
    precio_referencial: Optional[Decimal] = Field(None, ge=0)
    ubicacion_fisica: Optional[str] = Field(None, max_length=50)
    stock_minimo: Optional[int] = Field(None, ge=0)
    stock_maximo: Optional[int] = Field(None, ge=1)
    stock_critico: Optional[int] = Field(None, ge=0)
    descripcion_producto: Optional[str] = Field(None, max_length=500)
    magnitud_producto: Optional[str] = Field(None, max_length=10)
    requiere_lote: Optional[bool] = None
    dias_vida_util: Optional[int] = Field(None, ge=0)
    estado_producto: Optional[int] = Field(None, ge=0, le=1)

class ProductoResponse(BaseSchema):
    """Schema para respuesta de producto"""
    id_producto: int
    codigo_producto: str
    nombre_producto: str
    tipo_producto: str
    categoria_producto: Optional[str] = None
    proveedor_producto: Optional[str] = None
    costo_unitario: Optional[Decimal] = None
    precio_referencial: Optional[Decimal] = None
    ubicacion_fisica: Optional[str] = None
    stock_minimo: int
    stock_maximo: int
    stock_critico: int
    estado_producto: int
    descripcion_producto: Optional[str] = None
    url_foto_producto: Optional[str] = None
    magnitud_producto: str
    requiere_lote: bool
    dias_vida_util: Optional[int] = None
    
    class Config:
        from_attributes = True

class ProductoSearch(BaseModel):
    """Schema para búsqueda de productos"""
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    tipo: Optional[str] = None
    categoria: Optional[str] = None
    proveedor: Optional[str] = None
    estado: Optional[int] = Field(None, ge=0, le=1)
    stock_bajo: Optional[bool] = False

class ProductoImportRow(BaseModel):
    """Schema para fila de importación desde Excel"""
    codigo_producto: str = Field(..., description="Código único del producto")
    nombre_producto: str = Field(..., description="Nombre del producto")
    tipo_producto: str = Field(..., description="Tipo de producto")
    categoria_producto: Optional[str] = Field(None, description="Categoría del producto")
    proveedor_producto: Optional[str] = Field(None, description="Proveedor principal")
    costo_unitario: Optional[Decimal] = Field(None, description="Costo unitario")
    precio_referencial: Optional[Decimal] = Field(None, description="Precio de referencia")
    ubicacion_fisica: Optional[str] = Field(None, description="Ubicación en almacén")
    stock_minimo: int = Field(default=1, description="Stock mínimo")
    stock_maximo: int = Field(default=100, description="Stock máximo")
    stock_critico: int = Field(default=0, description="Stock crítico")
    descripcion_producto: Optional[str] = Field(None, description="Descripción del producto")
    magnitud_producto: str = Field(default="UND", description="Unidad de medida")
    requiere_lote: bool = Field(default=False, description="¿Requiere control de lotes?")
    dias_vida_util: Optional[int] = Field(None, description="Días de vida útil")

class ImportError(BaseModel):
    """Error en importación"""
    fila: int
    errores: List[str]
    datos: dict

class ImportResult(BaseModel):
    """Resultado de importación masiva"""
    total_procesados: int
    exitosos: int
    errores: int
    productos_creados: List[dict]
    errores_detalle: List[ImportError]