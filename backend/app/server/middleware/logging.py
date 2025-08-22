# backend/app/server/middleware/logging.py
from fastapi import Request, Response
from server.config.settings import settings
from server.config.database import log_activity
import logging
import logging.config
import time
import uuid
import json
from datetime import datetime
from typing import Callable
import os

# Configurar logging
def setup_logging():
    """Configurar sistema de logging"""
    
    # Crear directorios de logs si no existen
    os.makedirs("logs", exist_ok=True)
    
    # Aplicar configuración de logging
    logging.config.dictConfig(settings.get_logging_config())
    
    logger = logging.getLogger(__name__)
    logger.info("✅ Sistema de logging configurado")
    logger.info(f"📝 Nivel de log: {settings.log_level}")
    logger.info(f"📁 Archivos de log: {settings.log_file}, {settings.error_log_file}")

class LoggingMiddleware:
    """Middleware para logging detallado de requests"""
    
    def __init__(self):
        self.logger = logging.getLogger("middleware.logging")
        self.audit_logger = logging.getLogger("audit")
        
        # Configurar logger de auditoría
        audit_handler = logging.FileHandler(settings.audit_log_file)
        audit_formatter = logging.Formatter(
            '%(asctime)s - AUDIT - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        audit_handler.setFormatter(audit_formatter)
        self.audit_logger.addHandler(audit_handler)
        self.audit_logger.setLevel(logging.INFO)
        self.audit_logger.propagate = False
    
    async def __call__(self, request: Request, call_next: Callable) -> Response:
        """Procesar logging de request"""
        
        # Generar ID único para el request
        request_id = str(uuid.uuid4())[:8]
        
        # Información del request
        start_time = time.time()
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("user-agent", "")
        
        # Información del usuario (si está autenticado)
        user_info = self._get_user_info(request)
        
        # Log del request entrante
        self.logger.info(
            f"[{request_id}] {request.method} {request.url.path} - "
            f"IP: {client_ip} - User: {user_info['email'] if user_info else 'Anonymous'}"
        )
        
        # Log detallado en debug
        if self.logger.isEnabledFor(logging.DEBUG):
            self.logger.debug(
                f"[{request_id}] Headers: {dict(request.headers)}"
            )
            
            # Log de query parameters
            if request.query_params:
                self.logger.debug(
                    f"[{request_id}] Query params: {dict(request.query_params)}"
                )
        
        # Procesar request
        try:
            response = await call_next(request)
            
            # Calcular tiempo de procesamiento
            process_time = time.time() - start_time
            
            # Log de response
            self.logger.info(
                f"[{request_id}] {response.status_code} - {process_time:.3f}s"
            )
            
            # Log de auditoría para operaciones críticas
            await self._log_audit_if_needed(request, response, user_info, request_id, process_time)
            
            # Agregar headers de logging
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = f"{process_time:.3f}s"
            
            return response
            
        except Exception as e:
            # Log de errores
            process_time = time.time() - start_time
            
            self.logger.error(
                f"[{request_id}] ERROR: {str(e)} - {process_time:.3f}s",
                exc_info=True
            )
            
            # Log de auditoría para errores
            await self._log_audit_error(request, e, user_info, request_id)
            
            raise
    
    def _get_client_ip(self, request: Request) -> str:
        """Obtener IP real del cliente"""
        # Verificar headers de proxy
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        # IP directa
        return request.client.host if request.client else "unknown"
    
    def _get_user_info(self, request: Request) -> dict:
        """Obtener información del usuario autenticado"""
        try:
            user = getattr(request.state, 'user', None)
            if user:
                return {
                    "id": user.get("id_usuario"),
                    "email": user.get("email_usuario"),
                    "tipo": user.get("tipo_usuario"),
                    "nombre": user.get("nombre_usuario")
                }
        except:
            pass
        
        return None
    
    async def _log_audit_if_needed(self, request: Request, response: Response, 
                                 user_info: dict, request_id: str, process_time: float):
        """Log de auditoría para operaciones críticas"""
        
        # Operaciones que requieren auditoría
        audit_paths = [
            "/api/auth/login",
            "/api/usuarios/",
            "/api/productos/", 
            "/api/stock/"
        ]
        
        audit_methods = ["POST", "PUT", "DELETE"]
        
        # Verificar si necesita auditoría
        needs_audit = (
            any(request.url.path.startswith(path) for path in audit_paths) and
            request.method in audit_methods and
            200 <= response.status_code < 300
        )
        
        if needs_audit:
            audit_data = {
                "timestamp": datetime.now().isoformat(),
                "request_id": request_id,
                "action": f"{request.method} {request.url.path}",
                "user": user_info,
                "ip": self._get_client_ip(request),
                "status_code": response.status_code,
                "process_time": process_time,
                "user_agent": request.headers.get("user-agent", "")
            }
            
            self.audit_logger.info(json.dumps(audit_data, ensure_ascii=False))
            
            # También registrar en BD
            if user_info:
                try:
                    await log_activity(
                        action=f"{request.method}_{request.url.path.replace('/', '_').upper()}",
                        module="api",
                        user_id=user_info["id"],
                        user_name=user_info["nombre"],
                        details={
                            "request_id": request_id,
                            "ip": self._get_client_ip(request),
                            "status_code": response.status_code,
                            "process_time": process_time
                        }
                    )
                except Exception as e:
                    self.logger.error(f"Error registrando actividad en BD: {e}")
    
    async def _log_audit_error(self, request: Request, error: Exception, 
                             user_info: dict, request_id: str):
        """Log de auditoría para errores"""
        
        audit_data = {
            "timestamp": datetime.now().isoformat(),
            "request_id": request_id,
            "action": f"ERROR_{request.method}_{request.url.path}",
            "user": user_info,
            "ip": self._get_client_ip(request),
            "error": str(error),
            "error_type": type(error).__name__,
            "user_agent": request.headers.get("user-agent", "")
        }
        
        self.audit_logger.error(json.dumps(audit_data, ensure_ascii=False))

class PerformanceLogger:
    """Logger específico para métricas de performance"""
    
    def __init__(self):
        self.logger = logging.getLogger("performance")
        
        # Handler específico para performance
        perf_handler = logging.FileHandler("logs/performance.log")
        perf_formatter = logging.Formatter(
            '%(asctime)s - PERF - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        perf_handler.setFormatter(perf_formatter)
        self.logger.addHandler(perf_handler)
        self.logger.setLevel(logging.INFO)
        self.logger.propagate = False
    
    def log_slow_request(self, request: Request, process_time: float, threshold: float = 1.0):
        """Log de requests lentos"""
        if process_time > threshold:
            self.logger.warning(
                f"SLOW_REQUEST: {request.method} {request.url.path} - {process_time:.3f}s"
            )
    
    def log_db_query(self, query_type: str, duration: float, collection: str = None):
        """Log de queries de base de datos"""
        self.logger.info(
            f"DB_QUERY: {query_type} - {collection or 'unknown'} - {duration:.3f}s"
        )

# Instancias globales
logging_middleware = LoggingMiddleware()
performance_logger = PerformanceLogger()

# Configurar logging al importar
setup_logging()

logger = logging.getLogger(__name__)
logger.info("✅ Middleware de logging configurado")