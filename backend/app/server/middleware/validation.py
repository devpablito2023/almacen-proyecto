# backend/app/server/middleware/validation.py
from fastapi import Request, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from server.models.responses import validation_error_response
from server.config.settings import settings
import logging
import json
from typing import Any

logger = logging.getLogger(__name__)

class ValidationMiddleware:
    """Middleware para manejo de validaciones y errores"""
    
    def __init__(self):
        self.max_request_size = settings.max_file_size
        self.allowed_content_types = [
            "application/json",
            "application/x-www-form-urlencoded",
            "multipart/form-data",
            "text/plain"
        ]
    
    async def __call__(self, request: Request, call_next):
        """Validar request antes de procesarlo"""
        
        try:
            # Validar tamaño del request
            await self._validate_request_size(request)
            
            # Validar content type
            await self._validate_content_type(request)
            
            # Validar headers requeridos
            await self._validate_headers(request)
            
            # Procesar request
            response = await call_next(request)
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error en validation middleware: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno de validación"
            )
    
    async def _validate_request_size(self, request: Request):
        """Validar tamaño del request"""
        content_length = request.headers.get("content-length")
        
        if content_length:
            try:
                size = int(content_length)
                if size > self.max_request_size:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Request demasiado grande. Máximo permitido: {self.max_request_size} bytes"
                    )
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Content-Length inválido"
                )
    
    async def _validate_content_type(self, request: Request):
        """Validar content type del request"""
        # Solo validar para métodos que pueden tener body
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            
            # Extraer tipo base (sin parámetros como charset)
            base_content_type = content_type.split(";")[0].strip()
            
            # Verificar si es un tipo permitido
            if base_content_type and not any(
                base_content_type.startswith(allowed) 
                for allowed in self.allowed_content_types
            ):
                logger.warning(f"Content-Type no permitido: {content_type}")
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"Content-Type no soportado: {base_content_type}"
                )
    
    async def _validate_headers(self, request: Request):
        """Validar headers requeridos"""
        # Validar User-Agent para evitar bots maliciosos
        user_agent = request.headers.get("user-agent", "")
        
        if not user_agent and not settings.is_development:
            logger.warning("Request sin User-Agent")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User-Agent requerido"
            )
        
        # Validar headers de seguridad para requests API
        if request.url.path.startswith("/api/"):
            # Validar Accept header para endpoints API
            accept = request.headers.get("accept", "")
            if accept and not any(
                accepted in accept.lower() 
                for accepted in ["application/json", "*/*", "application/*"]
            ):
                logger.warning(f"Accept header no compatible: {accept}")

class RequestSanitizer:
    """Sanitizador de datos de entrada"""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """Sanitizar string de entrada"""
        if not isinstance(value, str):
            return str(value)
        
        # Truncar si es muy largo
        if len(value) > max_length:
            value = value[:max_length]
        
        # Remover caracteres de control (excepto whitespace normal)
        sanitized = ''.join(char for char in value if ord(char) >= 32 or char in '\t\n\r')
        
        # Limpiar espacios múltiples
        sanitized = ' '.join(sanitized.split())
        
        return sanitized.strip()
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitizar nombre de archivo"""
        if not filename:
            return "unnamed_file"
        
        # Caracteres no permitidos en nombres de archivo
        forbidden_chars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*', '\0']
        
        # Reemplazar caracteres prohibidos
        sanitized = filename
        for char in forbidden_chars:
            sanitized = sanitized.replace(char, '_')
        
        # Remover espacios al inicio/final y puntos múltiples
        sanitized = sanitized.strip(' .')
        
        # Limitar longitud
        if len(sanitized) > 255:
            name, ext = sanitized.rsplit('.', 1) if '.' in sanitized else (sanitized, '')
            max_name_length = 255 - len(ext) - 1 if ext else 255
            sanitized = name[:max_name_length] + ('.' + ext if ext else '')
        
        return sanitized or "unnamed_file"
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validar formato de email básico"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validar formato de teléfono básico"""
        import re
        # Permitir números con espacios, guiones, paréntesis y signo +
        pattern = r'^[\+]?[\d\s\-\(\)]{7,15}$'
        return bool(re.match(pattern, phone))

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler personalizado para errores de validación"""
    
    logger.warning(f"Error de validación en {request.url.path}: {exc.errors()}")
    
    # Formatear errores de validación
    formatted_errors = []
    for error in exc.errors():
        field_path = " -> ".join(str(loc) for loc in error["loc"])
        formatted_errors.append({
            "field": field_path,
            "message": error["msg"],
            "type": error["type"],
            "input": error.get("input")
        })
    
    # Crear respuesta de error estándar
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=validation_error_response(
            validation_errors=formatted_errors,
            message="Errores de validación en los datos enviados"
        )
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handler personalizado para HTTPException"""
    
    logger.warning(f"HTTP Exception en {request.url.path}: {exc.status_code} - {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "error": f"HTTP_{exc.status_code}",
            "code": exc.status_code,
            "timestamp": __import__('datetime').datetime.now().isoformat()
        },
        headers=getattr(exc, 'headers', None)
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handler general para excepciones no manejadas"""
    
    logger.error(
        f"Excepción no manejada en {request.url.path}: {type(exc).__name__}: {str(exc)}",
        exc_info=True
    )
    
    # En desarrollo, mostrar detalles del error
    if settings.is_development:
        detail = f"{type(exc).__name__}: {str(exc)}"
    else:
        detail = "Error interno del servidor"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": detail,
            "error": "INTERNAL_SERVER_ERROR",
            "code": 500,
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }
    )

def setup_validation_middleware(app):
    """Configurar middleware y handlers de validación"""
    
    # Agregar middleware de validación
    validation_middleware = ValidationMiddleware()
    
    # Registrar exception handlers
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    logger.info("✅ Middleware de validación configurado")
    
    return validation_middleware

class SecurityValidator:
    """Validador de seguridad para datos sensibles"""
    
    @staticmethod
    def validate_sql_injection(value: str) -> bool:
        """Detectar posibles intentos de inyección SQL"""
        if not isinstance(value, str):
            return True
        
        # Patrones sospechosos comunes
        suspicious_patterns = [
            "union select",
            "drop table",
            "delete from", 
            "insert into",
            "update set",
            "exec(",
            "execute(",
            "script>",
            "javascript:",
            "vbscript:",
            "onload=",
            "onerror="
        ]
        
        value_lower = value.lower()
        return not any(pattern in value_lower for pattern in suspicious_patterns)
    
    @staticmethod
    def validate_xss_attempt(value: str) -> bool:
        """Detectar posibles intentos de XSS"""
        if not isinstance(value, str):
            return True
        
        # Patrones XSS comunes
        xss_patterns = [
            "<script",
            "javascript:",
            "vbscript:",
            "onload=",
            "onerror=",
            "onclick=", 
            "onmouseover=",
            "onfocus=",
            "onblur=",
            "onchange=",
            "onsubmit=",
            "<iframe",
            "<object",
            "<embed",
            "eval(",
            "expression("
        ]
        
        value_lower = value.lower()
        return not any(pattern in value_lower for pattern in xss_patterns)
    
    @staticmethod
    def validate_path_traversal(value: str) -> bool:
        """Detectar intentos de path traversal"""
        if not isinstance(value, str):
            return True
        
        # Patrones de path traversal
        traversal_patterns = [
            "../",
            "..\\",
            "..%2f",
            "..%5c",
            "%2e%2e%2f",
            "%2e%2e%5c"
        ]
        
        value_lower = value.lower()
        return not any(pattern in value_lower for pattern in traversal_patterns)

# Instancia global
validation_middleware = ValidationMiddleware()
request_sanitizer = RequestSanitizer()
security_validator = SecurityValidator()

logger.info("✅ Middleware de validación configurado")