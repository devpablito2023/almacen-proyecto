# backend/app/server/functions/auth.py
from fastapi import HTTPException, status
from server.config.database import usuarios_collection, log_activity
from server.config.security import SecurityManager
from server.models.usuarios import UsuarioLogin, ChangePassword
from datetime import datetime
import logging
from passlib.context import CryptContext
from jose import JWTError, ExpiredSignatureError



logger = logging.getLogger(__name__)

#pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


#def get_password_hash(password):
    #return pwd_context.hash(password)

async def authenticate_user(login_data: UsuarioLogin):
    print("aqui estamos")
    print("login_data:", login_data)
    """Autenticar usuario"""
    try:
        # Buscar usuario por email
        usuario = await usuarios_collection().find_one(
            {"email_usuario": login_data.email_usuario, "estado_usuario": 1}
        )
        print("usuario encontrado:", usuario)
        
        if not usuario:
            logger.warning(f"Intento de login con email inexistente: {login_data.email_usuario}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # Verificar contraseña
        #print("vamos a verificar la contraseña")
        #debe = get_password_hash("admin123")
        #print("debe ser:", debe)
        if not SecurityManager.verify_password(login_data.password_usuario, usuario["password_hash"]):
            logger.warning(f"Contraseña incorrecta para usuario: {login_data.email_usuario}")
            #aquiva la validacion 
            #print("Contraseña incorrecta para usuario:", login_data.password)
            #print(usuario["password_hash"] )
            # Incrementar intentos fallidos
            await usuarios_collection().update_one(
                {"_id": usuario["_id"]},
                {"$inc": {"intentos_login": 1}}
            )
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # Resetear intentos fallidos y actualizar último login
        await usuarios_collection().update_one(
            {"_id": usuario["_id"]},
            {
                "$set": {
                    "ultimo_login": datetime.now(),
                    "intentos_login": 0
                }
            }
        )
        
        # Preparar datos para token
        token_data = {
            "user_id": usuario["id_usuario"],
            "email": usuario["email_usuario"],
            "tipo_usuario": usuario["tipo_usuario"],
            "codigo_usuario": usuario["codigo_usuario"]
        }
        
        # Generar tokens
        access_token = SecurityManager.create_access_token(token_data)
        refresh_token = SecurityManager.create_refresh_token(token_data)
        
        # Log de actividad
        await log_activity(
            action="LOGIN_SUCCESS",
            module="auth",
            user_id=usuario["id_usuario"],
            user_name=usuario["nombre_usuario"]
        )
        
        # Remover password_hash del usuario antes de devolverlo
        del usuario["password_hash"]
        del usuario["_id"]
        
        logger.info(f"Login exitoso para usuario: {login_data.email_usuario}")
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 8 * 3600,  # 8 horas en segundos
            "user": usuario
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en autenticación: {e}")
        await log_activity(
            action="LOGIN_ERROR", 
            module="auth",
            details={"email": login_data.email_usuario, "error": str(e)}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def change_user_password(user_id: int, password_data: ChangePassword):
    """Cambiar contraseña de usuario"""
    try:
        # Buscar usuario
        usuario = await usuarios_collection().find_one(
            {"id_usuario": user_id, "estado_usuario": 1}
        )
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Verificar contraseña actual
        if not SecurityManager.verify_password(password_data.current_password, usuario["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contraseña actual incorrecta"
            )
        
        # Hash de la nueva contraseña
        new_password_hash = SecurityManager.hash_password(password_data.new_password)
        
        # Actualizar en base de datos
        await usuarios_collection().update_one(
            {"id_usuario": user_id},
            {
                "$set": {
                    "password_hash": new_password_hash,
                    "updated_at": datetime.now(),
                    "updated_by": user_id
                }
            }
        )
        
        # Log de actividad
        await log_activity(
            action="PASSWORD_CHANGED",
            module="auth",
            user_id=user_id,
            user_name=usuario["nombre_usuario"]
        )
        
        logger.info(f"Contraseña cambiada para usuario ID: {user_id}")
        
        return {"message": "Contraseña actualizada exitosamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cambiando contraseña: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def verify_user_token(token: str):
    """Verificar token de usuario"""
    try:
        # Decodificar token
        payload = SecurityManager.verify_token(token)
        print("payload despues de verificar token:", payload)
        # Buscar usuario en BD para verificar que sigue activo
        user_data = payload.get("user")
        usuario = await usuarios_collection().find_one(
            #{"id_usuario": payload["user_id"], "estado_usuario": 1},
            {"id_usuario": user_data["id_usuario"], "estado_usuario": 1},
            {"password_hash": 0, "_id": 0}
        )
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no válido"
            )
        
        return {
            "user": usuario,
            "token_data": payload
        }
        
    except HTTPException:
        raise
    #except Exception as e:
    except JWTError as e:

        logger.error(f"Error verificando vvv token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

async def refresh_access_token(refresh_token: str):
    """Renovar token de acceso"""
    try:
        # Verificar refresh token
        payload = SecurityManager.verify_token(refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de refresh inválido"
            )
        
        # Buscar usuario
        usuario = await usuarios_collection().find_one(
            {"id_usuario": payload["user_id"], "estado_usuario": 1}
        )
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no válido"
            )
        
        # Generar nuevo access token
        token_data = {
            "user_id": usuario["id_usuario"],
            "email": usuario["email_usuario"],
            "tipo_usuario": usuario["tipo_usuario"],
            "codigo_usuario": usuario["codigo_usuario"]
        }
        
        new_access_token = SecurityManager.create_access_token(token_data)
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": 8 * 3600
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error renovando token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )