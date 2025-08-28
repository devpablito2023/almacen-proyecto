# backend/app/server/middleware/cors.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.config.settings import settings
import logging

logger = logging.getLogger(__name__)

def setup_cors_middleware(app: FastAPI) -> None:
    """Configurar middleware CORS"""
    
    # Obtener configuración CORS
    cors_config = settings.get_cors_config()
    
    # En desarrollo, permitir todos los orígenes
    if settings.is_development:
        cors_config["allow_origins"] = ["*"]
        logger.info("🔓 CORS configurado para desarrollo (permite todos los orígenes)")
    else:
        logger.info(f"🔒 CORS configurado para producción: {cors_config['allow_origins']}")
    
    # Agregar middleware CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_config["allow_origins"],
        allow_credentials=cors_config["allow_credentials"],
        allow_methods=cors_config["allow_methods"],
        allow_headers=cors_config["allow_headers"],
        expose_headers=[
            "X-Total-Count",
            "X-Page-Count", 
            "X-Current-Page",
            "X-Per-Page",
            "Content-Range"
        ]
    )
    
    logger.info("✅ Middleware CORS configurado exitosamente")

class CustomCORSMiddleware:
    """Middleware CORS personalizado con logging detallado"""
    
    def __init__(self, app: FastAPI):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        """Procesar request CORS"""
        
        if scope["type"] == "http":
            # Log de request CORS
            headers = dict(scope.get("headers", []))
            origin = headers.get(b"origin")
            
            if origin:
                origin_str = origin.decode("utf-8")
                logger.debug(f"CORS request desde: {origin_str}")
                
                # Verificar si el origen está permitido
                allowed_origins = settings.cors_origins
                
                if origin_str not in allowed_origins and not settings.is_development:
                    logger.warning(f"CORS: Origen no permitido: {origin_str}")
        
        # Continuar con el siguiente middleware/app
        await self.app(scope, receive, send)

def add_cors_headers(response, request):
    """Agregar headers CORS personalizados a response"""
    
    # Headers de seguridad adicionales
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # Headers para API
    response.headers["X-API-Version"] = settings.app_version
    response.headers["X-Environment"] = settings.environment
    
    # Cache control para APIs
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    
    return response

logger.info("✅ Configuración CORS cargada")