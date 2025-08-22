# backend/app/server/models/responses.py
from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from datetime import datetime

class StandardResponse(BaseModel):
   """Respuesta estándar del sistema"""
   success: bool
   message: str
   data: Optional[Any] = None
   code: int = 200
   timestamp: datetime = datetime.now()

class ErrorResponse(BaseModel):
   """Respuesta de error del sistema"""
   success: bool = False
   message: str
   error: str
   code: int
   details: Optional[Dict[str, Any]] = None
   timestamp: datetime = datetime.now()

class PaginatedResponse(BaseModel):
   """Respuesta con paginación"""
   success: bool = True
   message: str = "Datos obtenidos exitosamente"
   data: List[Any]
   pagination: Dict[str, Any]
   code: int = 200
   timestamp: datetime = datetime.now()

class LoginResponse(BaseModel):
   """Respuesta de login exitoso"""
   success: bool = True
   message: str = "Login exitoso"
   data: Dict[str, Any]  # Incluye tokens y datos de usuario
   code: int = 200
   timestamp: datetime = datetime.now()

class ValidationErrorResponse(BaseModel):
   """Respuesta de error de validación"""
   success: bool = False
   message: str = "Error de validación"
   error: str = "VALIDATION_ERROR"
   validation_errors: List[Dict[str, Any]]
   code: int = 422
   timestamp: datetime = datetime.now()

# Funciones helper para crear respuestas estándar
def success_response(data: Any = None, message: str = "Operación exitosa", code: int = 200) -> Dict[str, Any]:
   """Crear respuesta exitosa"""
   return {
       "success": True,
       "message": message,
       "data": data,
       "code": code,
       "timestamp": datetime.now().isoformat()
   }

def error_response(error: str, message: str, code: int = 400, details: Dict = None) -> Dict[str, Any]:
   """Crear respuesta de error"""
   return {
       "success": False,
       "message": message,
       "error": error,
       "code": code,
       "details": details,
       "timestamp": datetime.now().isoformat()
   }

def paginated_response(data: List[Any], total: int, page: int, limit: int, message: str = "Datos obtenidos exitosamente") -> Dict[str, Any]:
   """Crear respuesta paginada"""
   pages = (total + limit - 1) // limit if total > 0 else 0
   
   return {
       "success": True,
       "message": message,
       "data": data,
       "pagination": {
           "total": total,
           "page": page,
           "limit": limit,
           "pages": pages,
           "has_next": page < pages,
           "has_prev": page > 1
       },
       "code": 200,
       "timestamp": datetime.now().isoformat()
   }

def validation_error_response(validation_errors: List[Dict], message: str = "Error de validación") -> Dict[str, Any]:
   """Crear respuesta de error de validación"""
   return {
       "success": False,
       "message": message,
       "error": "VALIDATION_ERROR",
       "validation_errors": validation_errors,
       "code": 422,
       "timestamp": datetime.now().isoformat()
   }

# Constantes de códigos de error comunes
class ErrorCodes:
   # Errores de autenticación
   UNAUTHORIZED = 401
   FORBIDDEN = 403
   TOKEN_EXPIRED = 401
   INVALID_CREDENTIALS = 401
   
   # Errores de validación
   VALIDATION_ERROR = 422
   REQUIRED_FIELD = 400
   INVALID_FORMAT = 400
   
   # Errores de recursos
   NOT_FOUND = 404
   ALREADY_EXISTS = 409
   CONFLICT = 409
   
   # Errores del servidor
   INTERNAL_ERROR = 500
   DATABASE_ERROR = 500
   
   # Errores de negocio
   INSUFFICIENT_STOCK = 400
   INVALID_OPERATION = 400
   BUSINESS_RULE_VIOLATION = 400

# Mensajes de error estándar
class ErrorMessages:
   # Autenticación
   INVALID_CREDENTIALS = "Credenciales inválidas"
   TOKEN_EXPIRED = "Token expirado"
   ACCESS_DENIED = "Acceso denegado"
   
   # Validación
   REQUIRED_FIELD = "Campo requerido"
   INVALID_FORMAT = "Formato inválido"
   
   # Recursos
   NOT_FOUND = "Recurso no encontrado"
   ALREADY_EXISTS = "El recurso ya existe"
   
   # Sistema
   INTERNAL_ERROR = "Error interno del servidor"
   DATABASE_ERROR = "Error de base de datos"
   
   # Negocio
   INSUFFICIENT_STOCK = "Stock insuficiente"
   INVALID_OPERATION = "Operación no válida"