# backend/app/server/config/security.py
import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

# Configuración JWT
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", 8))

if not JWT_SECRET:
    raise ValueError("JWT_SECRET no está configurada")

class SecurityManager:
    """Gestor de seguridad para el sistema"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Encriptar contraseña con bcrypt"""
        try:
            rounds = int(os.getenv("BCRYPT_ROUNDS", 12))
            salt = bcrypt.gensalt(rounds=rounds)
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
        except Exception as e:
            logger.error(f"Error hasheando contraseña: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error procesando contraseña"
            )
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verificar contraseña contra hash"""
        try:
            return bcrypt.checkpw(
                password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception as e:
            logger.error(f"Error verificando contraseña: {e}")
            return False
    
    @staticmethod
    def create_access_token(data: Dict[str, Any]) -> str:
        """Crear JWT token"""
        try:
            to_encode = data.copy()
            expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
            to_encode.update({
                "exp": expire,
                "iat": datetime.utcnow(),
                "type": "access"
            })
            
            token = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
            return token
            
        except Exception as e:
            logger.error(f"Error creando token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error generando token"
            )
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """Crear refresh token"""
        try:
            to_encode = data.copy()
            expire = datetime.utcnow() + timedelta(days=30)  # 30 días
            to_encode.update({
                "exp": expire,
                "iat": datetime.utcnow(),
                "type": "refresh"
            })
            
            token = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
            return token
            
        except Exception as e:
            logger.error(f"Error creando refresh token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error generando refresh token"
            )
    
    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """Verificar y decodificar JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            
            # Verificar que no esté expirado
            if datetime.utcnow() > datetime.fromtimestamp(payload["exp"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expirado"
                )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado"
            )
        except jwt.JWTError as e:
            logger.error(f"Error verificando token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
    
    @staticmethod
    def validate_user_permissions(user_type: int, required_types: list) -> bool:
        """Validar permisos de usuario"""
        # Tipo 0 (superusuario) tiene acceso a todo
        if user_type == 0:
            return True
        
        # Verificar si el tipo de usuario está en los requeridos
        return user_type in required_types

# Constantes de tipos de usuario
USER_TYPES = {
    0: "Superusuario",
    1: "Jefatura", 
    2: "Genera OT",
    3: "Valida solicitudes",
    4: "Almacén/Despacho",
    5: "Realiza ingresos"
}

# Permisos por módulo
PERMISSIONS = {
    "usuarios": {
        "create": [0, 1],
        "read": [0, 1, 2, 3, 4, 5],
        "update": [0, 1],
        "delete": [0]
    },
    "productos": {
        "create": [0, 1, 5],
        "read": [0, 1, 2, 3, 4, 5],
        "update": [0, 1, 5],
        "delete": [0, 1]
    },
    "stock": {
        "create": [0, 5],
        "read": [0, 1, 2, 3, 4, 5],
        "update": [0, 4, 5],
        "delete": [0]
    }
}

def check_permission(user_type: int, module: str, action: str) -> bool:
    """Verificar permisos específicos"""
    if user_type == 0:  # Superusuario
        return True
    
    try:
        allowed_types = PERMISSIONS[module][action]
        return user_type in allowed_types
    except KeyError:
        logger.warning(f"Permiso no definido: {module}.{action}")
        return False

logger.info("✅ Configuración de seguridad cargada")