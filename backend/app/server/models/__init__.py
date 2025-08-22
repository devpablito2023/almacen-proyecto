# backend/app/server/models/__init__.py
"""
Modelos Pydantic para la API del Sistema de Control de Almacén

Este módulo contiene todos los esquemas de validación y serialización
utilizados por FastAPI para validar requests y responses.
"""

# Modelos base y respuestas
from .base import (
   BaseResponse,
   ErrorResponse,
   BaseSchema,
   PaginationParams,
   PaginatedResponse,
   ResponseModel,
   ErrorResponseModel
)

from .responses import (
   StandardResponse,
   LoginResponse,
   ValidationErrorResponse,
   success_response,
   error_response,
   paginated_response,
   validation_error_response,
   ErrorCodes,
   ErrorMessages
)

# Modelos de dominio
from .usuarios import (
   UsuarioCreate,
   UsuarioUpdate,
   UsuarioResponse,
   UsuarioLogin,
   ChangePassword,
   TokenResponse
)

from .productos import (
   ProductoCreate,
   ProductoUpdate,
   ProductoResponse,
   ProductoSearch
)

from .stock import (
   StockResponse,
   StockAlert,
   StockAdjust,
   StockValuation,
   StockMovement
)

# Tipos de datos comunes
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, date
from decimal import Decimal

# Constantes para validaciones
CODIGO_REGEX = r'^[A-Z0-9_-]+$'
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
PHONE_REGEX = r'^[\+]?[\d\s\-\(\)]{7,15}$'

# Tipos de usuario
TIPOS_USUARIO = {
   0: "Superusuario",
   1: "Jefatura",
   2: "Genera OT", 
   3: "Valida solicitudes",
   4: "Almacén/Despacho",
   5: "Realiza ingresos"
}

# Tipos de producto
TIPOS_PRODUCTO = [
   "insumo",
   "repuesto", 
   "herramienta",
   "otro"
]

# Estados comunes
ESTADOS = {
   0: "Inactivo",
   1: "Activo"
}

# Operaciones de kardex (para futuras fases)
OPERACIONES_KARDEX = [
   "INGRESO",
   "SALIDA", 
   "DEVOLUCION",
   "AJUSTE_POSITIVO",
   "AJUSTE_NEGATIVO",
   "TRANSFERENCIA"
]

# Configuraciones de validación
class ValidationConfig:
   """Configuraciones globales para validaciones"""
   
   # Longitudes de campos
   MIN_PASSWORD_LENGTH = 6
   MAX_PASSWORD_LENGTH = 100
   MIN_CODIGO_LENGTH = 3
   MAX_CODIGO_LENGTH = 20
   MIN_NOMBRE_LENGTH = 2
   MAX_NOMBRE_LENGTH = 200
   MAX_DESCRIPCION_LENGTH = 500
   MAX_OBSERVACION_LENGTH = 1000
   
   # Límites numéricos
   MIN_STOCK_VALUE = 0
   MAX_STOCK_VALUE = 999999
   MIN_PRECIO_VALUE = 0.01
   MAX_PRECIO_VALUE = 9999999.99
   
   # Archivos
   MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
   ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
   ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx']

# Funciones de utilidad para modelos
def validate_codigo_formato(codigo: str) -> bool:
   """Validar formato de código (letras, números, guiones y guiones bajos)"""
   import re
   return bool(re.match(CODIGO_REGEX, codigo))

def validate_email_formato(email: str) -> bool:
   """Validar formato de email"""
   import re
   return bool(re.match(EMAIL_REGEX, email))

def sanitize_string(value: str, max_length: int = None) -> str:
   """Sanitizar string eliminando caracteres especiales"""
   if not isinstance(value, str):
       return str(value)
   
   # Remover caracteres de control
   sanitized = ''.join(char for char in value if ord(char) >= 32 or char in '\t\n\r')
   
   # Limpiar espacios múltiples
   sanitized = ' '.join(sanitized.split())
   
   # Truncar si es necesario
   if max_length and len(sanitized) > max_length:
       sanitized = sanitized[:max_length]
   
   return sanitized.strip()

def format_currency(amount: Union[float, Decimal]) -> str:
   """Formatear cantidad como moneda"""
   if amount is None:
       return "0.00"
   return f"{float(amount):,.2f}"

def format_datetime(dt: datetime) -> str:
   """Formatear datetime para display"""
   if dt is None:
       return ""
   return dt.strftime("%d/%m/%Y %H:%M:%S")

def format_date(d: date) -> str:
   """Formatear date para display"""
   if d is None:
       return ""
   return d.strftime("%d/%m/%Y")

# Esquemas para responses comunes
class HealthResponse(BaseResponse):
   """Response para endpoint de salud"""
   data: Dict[str, Any] = {
       "status": "OK",
       "timestamp": datetime.now().isoformat(),
       "version": "1.0.0"
   }

class CountResponse(BaseResponse):
   """Response para conteos simples"""
   data: Dict[str, int]

class MessageResponse(BaseResponse):
   """Response para mensajes simples"""
   data: Dict[str, str]

# Validadores personalizados reutilizables
from pydantic import validator

def codigo_validator(cls, v):
   """Validator para códigos únicos"""
   if not v:
       raise ValueError('Código es requerido')
   
   v = v.upper().strip()
   
   if not validate_codigo_formato(v):
       raise ValueError('Código solo puede contener letras, números, guiones y guiones bajos')
   
   if len(v) < ValidationConfig.MIN_CODIGO_LENGTH:
       raise ValueError(f'Código debe tener al menos {ValidationConfig.MIN_CODIGO_LENGTH} caracteres')
       
   if len(v) > ValidationConfig.MAX_CODIGO_LENGTH:
       raise ValueError(f'Código no puede tener más de {ValidationConfig.MAX_CODIGO_LENGTH} caracteres')
   
   return v

def nombre_validator(cls, v):
   """Validator para nombres"""
   if not v:
       raise ValueError('Nombre es requerido')
   
   v = sanitize_string(v, ValidationConfig.MAX_NOMBRE_LENGTH)
   
   if len(v) < ValidationConfig.MIN_NOMBRE_LENGTH:
       raise ValueError(f'Nombre debe tener al menos {ValidationConfig.MIN_NOMBRE_LENGTH} caracteres')
   
   return v

def email_validator(cls, v):
   """Validator para emails"""
   if not v:
       raise ValueError('Email es requerido')
   
   v = v.lower().strip()
   
   if not validate_email_formato(v):
       raise ValueError('Formato de email inválido')
   
   return v

def password_validator(cls, v):
   """Validator para contraseñas"""
   if not v:
       raise ValueError('Contraseña es requerida')
   
   if len(v) < ValidationConfig.MIN_PASSWORD_LENGTH:
       raise ValueError(f'Contraseña debe tener al menos {ValidationConfig.MIN_PASSWORD_LENGTH} caracteres')
   
   if len(v) > ValidationConfig.MAX_PASSWORD_LENGTH:
       raise ValueError(f'Contraseña no puede tener más de {ValidationConfig.MAX_PASSWORD_LENGTH} caracteres')
   
   return v

def stock_validator(cls, v):
   """Validator para valores de stock"""
   if v is None:
       return v
       
   if v < ValidationConfig.MIN_STOCK_VALUE:
       raise ValueError(f'Stock no puede ser menor a {ValidationConfig.MIN_STOCK_VALUE}')
   
   if v > ValidationConfig.MAX_STOCK_VALUE:
       raise ValueError(f'Stock no puede ser mayor a {ValidationConfig.MAX_STOCK_VALUE}')
   
   return v

def precio_validator(cls, v):
   """Validator para precios"""
   if v is None:
       return v
       
   if v < ValidationConfig.MIN_PRECIO_VALUE:
       raise ValueError(f'Precio no puede ser menor a {ValidationConfig.MIN_PRECIO_VALUE}')
   
   if v > ValidationConfig.MAX_PRECIO_VALUE:
       raise ValueError(f'Precio no puede ser mayor a {ValidationConfig.MAX_PRECIO_VALUE}')
   
   return v

# Exports principales
__all__ = [
   # Modelos base
   "BaseResponse",
   "ErrorResponse", 
   "BaseSchema",
   "PaginationParams",
   "PaginatedResponse",
   "ResponseModel",
   "ErrorResponseModel",
   
   # Responses
   "StandardResponse",
   "LoginResponse",
   "ValidationErrorResponse",
   "success_response",
   "error_response",
   "paginated_response",
   "validation_error_response",
   "ErrorCodes",
   "ErrorMessages",
   "HealthResponse",
   "CountResponse",
   "MessageResponse",
   
   # Usuarios
   "UsuarioCreate",
   "UsuarioUpdate", 
   "UsuarioResponse",
   "UsuarioLogin",
   "ChangePassword",
   "TokenResponse",
   
   # Productos
   "ProductoCreate",
   "ProductoUpdate",
   "ProductoResponse", 
   "ProductoSearch",
   
   # Stock
   "StockResponse",
   "StockAlert",
   "StockAdjust",
   "StockValuation",
   "StockMovement",
   
   # Constantes
   "TIPOS_USUARIO",
   "TIPOS_PRODUCTO",
   "ESTADOS",
   "OPERACIONES_KARDEX",
   "ValidationConfig",
   
   # Validators
   "codigo_validator",
   "nombre_validator",
   "email_validator", 
   "password_validator",
   "stock_validator",
   "precio_validator",
   
   # Utilidades
   "validate_codigo_formato",
   "validate_email_formato",
   "sanitize_string",
   "format_currency",
   "format_datetime",
   "format_date"
]

# Información del módulo
__version__ = "1.0.0"
__author__ = "Sistema Control de Almacén"
__description__ = "Modelos Pydantic para validación y serialización"

# Log de inicialización
import logging
logger = logging.getLogger(__name__)
logger.info("✅ Modelos Pydantic cargados exitosamente")
logger.debug(f"📦 Modelos disponibles: {len(__all__)} elementos")