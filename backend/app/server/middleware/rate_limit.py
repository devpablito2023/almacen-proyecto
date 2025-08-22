# backend/app/server/middleware/rate_limit.py
from fastapi import Request, HTTPException, status
from server.config.settings import settings
import time
import logging
from typing import Dict, Tuple
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

class RateLimiter:
    """Rate limiter simple basado en memoria"""
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.last_cleanup = time.time()
        self.cleanup_interval = 300  # Limpiar cada 5 minutos
    
    def is_allowed(self, identifier: str) -> Tuple[bool, int, int]:
        """
        Verificar si el request está permitido
        
        Returns:
            (is_allowed, remaining_requests, reset_time)
        """
        current_time = time.time()
        
        # Limpiar registros antiguos periódicamente
        if current_time - self.last_cleanup > self.cleanup_interval:
            self._cleanup_old_records(current_time)
        
        # Obtener cola de requests para este identificador
        request_times = self.requests[identifier]
        
        # Remover requests fuera de la ventana de tiempo
        cutoff_time = current_time - self.window_seconds
        while request_times and request_times[0] < cutoff_time:
            request_times.popleft()
        
        # Verificar límite
        if len(request_times) >= self.max_requests:
            # Calcular tiempo hasta el reset
            reset_time = int(request_times[0] + self.window_seconds)
            return False, 0, reset_time
        
        # Agregar request actual
        request_times.append(current_time)
        
        # Calcular requests restantes
        remaining = self.max_requests - len(request_times)
        reset_time = int(current_time + self.window_seconds)
        
        return True, remaining, reset_time
    
    def _cleanup_old_records(self, current_time: float):
        """Limpiar registros antiguos para liberar memoria"""
        cutoff_time = current_time - (self.window_seconds * 2)  # Buffer adicional
        
        identifiers_to_remove = []
        for identifier, request_times in self.requests.items():
            # Remover requests antiguos
            while request_times and request_times[0] < cutoff_time:
                request_times.popleft()
            
            # Si no quedan requests, marcar para eliminación
            if not request_times:
                identifiers_to_remove.append(identifier)
        
        # Eliminar identificadores vacíos
        for identifier in identifiers_to_remove:
            del self.requests[identifier]
        
        self.last_cleanup = current_time
        
        if identifiers_to_remove:
            logger.debug(f"Rate limiter: Limpiados {len(identifiers_to_remove)} identificadores")

class RateLimitMiddleware:
    """Middleware de rate limiting"""
    
    def __init__(self):
        self.global_limiter = RateLimiter(
            max_requests=settings.api_rate_limit_per_minute,
            window_seconds=60
        )
        
        # Rate limiters específicos por endpoint
        self.auth_limiter = RateLimiter(
            max_requests=10,  # 10 intentos de login por minuto
            window_seconds=60
        )
        
        # Paths excluidos del rate limiting
        self.excluded_paths = [
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/static"
        ]
        
        # Paths con rate limiting especial
        self.special_limits = {
            "/api/auth/login": self.auth_limiter,
            "/api/auth/refresh": self.auth_limiter,
        }
    
    async def __call__(self, request: Request, call_next):
        """Aplicar rate limiting"""
        
        # Verificar si la ruta está excluida
        if self._is_excluded_path(request.url.path):
            return await call_next(request)
        
        # Obtener identificador del cliente
        client_id = self._get_client_identifier(request)
        
        # Seleccionar limiter apropiado
        limiter = self._get_limiter_for_path(request.url.path)
        
        # Verificar límite
        is_allowed, remaining, reset_time = limiter.is_allowed(client_id)
        
        if not is_allowed:
            # Log del rate limit excedido
            logger.warning(
                f"Rate limit excedido - IP: {client_id} - "
                f"Path: {request.url.path} - Reset: {reset_time}"
            )
            
            # Headers de rate limit
            headers = {
                "X-RateLimit-Limit": str(limiter.max_requests),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time),
                "Retry-After": str(reset_time - int(time.time()))
            }
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiadas requests. Intente más tarde.",
                headers=headers
            )
        
        # Procesar request
        response = await call_next(request)
        
        # Agregar headers de rate limit
        response.headers["X-RateLimit-Limit"] = str(limiter.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_time)
        
        return response
    
    def _is_excluded_path(self, path: str) -> bool:
        """Verificar si la ruta está excluida"""
        return any(path.startswith(excluded) for excluded in self.excluded_paths)
    
    def _get_client_identifier(self, request: Request) -> str:
        """Obtener identificador único del cliente"""
        # Primero intentar obtener IP real
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.headers.get("x-real-ip") or request.client.host
        
        # Si hay usuario autenticado, usar su ID también
        try:
            user = getattr(request.state, 'user', None)
            if user:
                return f"user_{user['id_usuario']}_{client_ip}"
        except:
            pass
        
        return f"ip_{client_ip}"
    
    def _get_limiter_for_path(self, path: str) -> RateLimiter:
        """Obtener rate limiter apropiado para la ruta"""
        # Verificar límites especiales
        for special_path, limiter in self.special_limits.items():
            if path.startswith(special_path):
                return limiter
        
        # Usar limiter global por defecto
        return self.global_limiter

class AdaptiveRateLimiter(RateLimiter):
    """Rate limiter adaptativo que ajusta límites según carga"""
    
    def __init__(self, base_max_requests: int = 100, window_seconds: int = 60):
        super().__init__(base_max_requests, window_seconds)
        self.base_max_requests = base_max_requests
        self.current_load = 0.0
        self.load_history = deque(maxlen=10)  # Últimas 10 mediciones
    
    def update_load(self, current_requests_per_second: float):
        """Actualizar carga actual del sistema"""
        self.load_history.append(current_requests_per_second)
        self.current_load = sum(self.load_history) / len(self.load_history)
        
        # Ajustar límite basado en carga
        if self.current_load > 50:  # Alta carga
            self.max_requests = int(self.base_max_requests * 0.7)
        elif self.current_load > 20:  # Carga media
            self.max_requests = int(self.base_max_requests * 0.85)
        else:  # Carga baja
            self.max_requests = self.base_max_requests
        
        logger.debug(f"Rate limiter adaptativo - Carga: {self.current_load:.1f}, Límite: {self.max_requests}")

# Instancia global del middleware
rate_limit_middleware = RateLimitMiddleware()

# Rate limiter global para uso en funciones específicas
global_rate_limiter = RateLimiter(
    max_requests=settings.api_rate_limit_per_minute,
    window_seconds=60
)

def check_rate_limit(identifier: str, limiter: RateLimiter = None) -> bool:
    """
    Función helper para verificar rate limit manualmente
    
    Args:
        identifier: Identificador único (IP, user_id, etc.)


        limiter: Rate limiter a usar (por defecto global)
   
    Returns:
        True si está permitido, False si excede el límite
    """
    if limiter is None:
        limiter = global_rate_limiter
    
    is_allowed, _, _ = limiter.is_allowed(identifier)
    return is_allowed

def get_rate_limit_info(identifier: str, limiter: RateLimiter = None) -> Dict[str, int]:
   """
   Obtener información detallada del rate limit
   
   Returns:
       Dict con limit, remaining, reset_time
   """
   if limiter is None:
       limiter = global_rate_limiter
   
   is_allowed, remaining, reset_time = limiter.is_allowed(identifier)
   
   return {
       "limit": limiter.max_requests,
       "remaining": remaining,
       "reset_time": reset_time,
       "is_allowed": is_allowed
   }

logger.info("✅ Middleware de rate limiting configurado")