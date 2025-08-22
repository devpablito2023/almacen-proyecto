# backend/app/server/models/base.py
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime

class BaseResponse(BaseModel):
   """Modelo base para respuestas"""
   success: bool = True
   message: str = "Operación exitosa"
   data: Optional[Any] = None
   code: int = 200

class ErrorResponse(BaseModel):
   """Modelo para respuestas de error"""
   success: bool = False
   message: str
   error: str
   code: int
   details: Optional[Dict[str, Any]] = None

class BaseSchema(BaseModel):
   """Esquema base con campos comunes"""
   created_at: Optional[datetime] = None
   updated_at: Optional[datetime] = None
   created_by: Optional[int] = None
   created_by_name: Optional[str] = None
   updated_by: Optional[int] = None
   updated_by_name: Optional[str] = None

class PaginationParams(BaseModel):
   """Parámetros de paginación"""
   page: int = Field(default=1, ge=1, description="Número de página")
   limit: int = Field(default=20, ge=1, le=100, description="Elementos por página")
   
class PaginatedResponse(BaseModel):
   """Respuesta paginada"""
   data: list
   total: int
   page: int
   limit: int
   pages: int
   has_next: bool
   has_prev: bool

def ResponseModel(data: Any, message: str = "Operación exitosa") -> Dict[str, Any]:
   """Crear respuesta exitosa estándar"""
   return {
       "success": True,
       "message": message,
       "data": data,
       "code": 200
   }

def ErrorResponseModel(error: str, code: int, message: str, details: Dict = None) -> Dict[str, Any]:
   """Crear respuesta de error estándar"""
   return {
       "success": False,
       "message": message,
       "error": error,
       "code": code,
       "details": details
   }