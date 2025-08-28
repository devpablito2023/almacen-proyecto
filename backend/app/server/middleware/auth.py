# backend/app/server/middleware/auth.py
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from server.config.security import SecurityManager
from server.config.database import usuarios_collection
from server.config.settings import settings
from typing import Optional, Dict, Any
import logging
import time

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)

class AuthMiddleware:
    """Middleware para autenticación JWT"""
    
    def __init__(self):
        self.excluded_paths = [
            "/docs",
            "/redoc", 
            "/openapi.json",
            "/health",
            "/",
            "/api/auth/login",
            "/static"
        ]
    
    async def __call__(self, request: Request, call_next):
        """Procesar autenticación en requests"""
        start_time = time.time()
        
        try:
            # Verificar si la ruta necesita autenticación
            if self._is_excluded_path(request.url.path):
                response = await call_next(request)
                return response
            
            # Extraer token del header
            authorization = request.headers.get("Authorization")
            
            if not authorization:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token de autorización requerido",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            
            # Validar formato Bearer
            if not authorization.startswith("Bearer "):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Formato de token inválido",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            
            token = authorization.split(" ")[1]
            
            # Verificar token
            user_data = await self._verify_token(token)
            
            # Agregar datos de usuario al request
            request.state.user = user_data["user"]
            request.state.token_data = user_data["token_data"]
            
            # Continuar con el request
            response = await call_next(request)
            
            # Log del tiempo de procesamiento
            process_time = time.time() - start_time
            logger.debug(f"Auth middleware: {process_time:.3f}s")
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error en auth middleware: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno de autenticación"
            )
    
    def _is_excluded_path(self, path: str) -> bool:
        """Verificar si la ruta está excluida de autenticación"""
        return any(path.startswith(excluded) for excluded in self.excluded_paths)
    
    async def _verify_token(self, token: str) -> Dict[str, Any]:
        """Verificar token JWT y obtener datos de usuario"""
        try:
            # Decodificar token
            payload = SecurityManager.verify_token(token)
            
            # Buscar usuario en BD
            usuario = await usuarios_collection().find_one(
                {"id_usuario": payload["user_id"], "estado_usuario": 1},
                {"password_hash": 0, "_id": 0}
            )
            
            if not usuario:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario no válido o inactivo"
                )
            
            return {
                "user": usuario,
                "token_data": payload
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error verificando token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )

# Instancia global del middleware
auth_middleware = AuthMiddleware()

async def get_current_user_dependency(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """
    Dependencia para obtener usuario actual desde token
    Uso: current_user = Depends(get_current_user_dependency)
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorización requerido",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        token = credentials.credentials
        
        # Verificar token
        payload = SecurityManager.verify_token(token)
        
        # Buscar usuario en BD
        usuario = await usuarios_collection().find_one(
            {"id_usuario": payload["user_id"], "estado_usuario": 1},
            {"password_hash": 0, "_id": 0}
        )
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no válido o inactivo"
            )
        
        return {
            "user": usuario,
            "token_data": payload
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en dependencia de auth: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

def require_user_type(allowed_types: list):
    """
    Decorador para requerir tipos específicos de usuario
    Uso: @require_user_type([0, 1, 2])
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Obtener usuario del request state o kwargs
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario no autenticado"
                )
            
            user_type = current_user["user"]["tipo_usuario"]
            
            # Superusuario (tipo 0) tiene acceso a todo
            if user_type == 0:
                return await func(*args, **kwargs)
            
            # Verificar tipo específico
            if user_type not in allowed_types:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tiene permisos para esta operación"
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator

class PermissionChecker:
    """Clase helper para verificar permisos"""
    
    @staticmethod
    def check_permission(user_type: int, module: str, action: str) -> bool:
        """Verificar permisos específicos por módulo y acción"""
        from server.config.security import check_permission
        return check_permission(user_type, module, action)
    
    @staticmethod
    def require_permission(module: str, action: str):
        """Decorador para requerir permisos específicos"""
        def decorator(func):
            async def wrapper(*args, **kwargs):
                current_user = kwargs.get('current_user')
                if not current_user:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Usuario no autenticado"
                    )
                
                user_type = current_user["user"]["tipo_usuario"]
                
                if not PermissionChecker.check_permission(user_type, module, action):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="No tiene permisos para esta operación"
                    )
                
                return await func(*args, **kwargs)
            
            return wrapper
        return decorator

# Helper functions
def get_user_from_request(request: Request) -> Optional[Dict[str, Any]]:
    """Obtener usuario desde el request state"""
    return getattr(request.state, 'user', None)

def get_token_data_from_request(request: Request) -> Optional[Dict[str, Any]]:
    """Obtener datos del token desde el request state"""
    return getattr(request.state, 'token_data', None)

logger.info("✅ Middleware de autenticación configurado")