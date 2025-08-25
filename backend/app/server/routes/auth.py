# backend/app/server/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status,Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from server.functions.auth import authenticate_user, change_user_password, verify_user_token, refresh_access_token
from server.models.usuarios import UsuarioLogin, ChangePassword
from server.models.responses import success_response, error_response
from jose import JWTError, ExpiredSignatureError

import logging

logger = logging.getLogger(__name__)
router = APIRouter()
#security = HTTPBearer()
security = HTTPBearer(auto_error=False)  # No rompas si no hay header

#async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    #"""Dependencia para obtener usuario actual desde token"""
    #try:
        #token = credentials.credentials
        #user_data = await verify_user_token(token)
        #return user_data
    #except HTTPException:
        #raise
    #except Exception as e:
        #logger.error(f"Error en get_current_user: {e}")
        #raise HTTPException(
            #status_code=status.HTTP_401_UNAUTHORIZED,
            #detail="Token inválido"
        #)

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Dependencia para obtener usuario actual desde token (cookie o header)"""
    try:
        token = None

        # 1. Intentar leer cookie
        if "auth-token" in request.cookies:
            token = request.cookies.get("auth-token")

        # 2. Si no hay cookie, revisar Authorization header
        if not token and credentials:
            token = credentials.credentials

        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No se proporcionó token"
            )

        # 3. Verificar token con tu SecurityManager
        user_data = await verify_user_token(token)
        return user_data

    except ExpiredSignatureError:
        logger.error("❌ Token expirado en get_current_user")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except JWTError as e:
        logger.error(f"❌ Token inválido en get_current_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    except Exception as e:
        logger.error(f"🔥 Error inesperado en get_current_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno en autenticación"
        )


@router.post("/login", summary="Iniciar sesión")
async def login(login_data: UsuarioLogin):
    """
    Autenticar usuario y generar tokens de acceso
    
    - **email_usuario**: Email del usuario
    - **password**: Contraseña del usuario
    
    Retorna tokens de acceso y refresh junto con datos del usuario
    """
    try:
        result = await authenticate_user(login_data)
        
        return success_response(
            data=result,
            message="Login exitoso"
        )
        
    except HTTPException as e:
        logger.warning(f"Login fallido para {login_data.email_usuario}: {e.detail}")
        return error_response(
            error="LOGIN_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error inesperado en login: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.post("/refresh", summary="Renovar token de acceso")
async def refresh_token(refresh_token: str):
    """
    Renovar token de acceso usando refresh token
    
    - **refresh_token**: Token de refresh válido
    
    Retorna nuevo token de acceso
    """
    try:
        result = await refresh_access_token(refresh_token)
        
        return success_response(
            data=result,
            message="Token renovado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="TOKEN_REFRESH_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error renovando token: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.post("/change-password", summary="Cambiar contraseña")
async def change_password(
    password_data: ChangePassword,
    current_user = Depends(get_current_user)
):
    """
    Cambiar contraseña del usuario actual
    
    - **current_password**: Contraseña actual
    - **new_password**: Nueva contraseña
    - **confirm_password**: Confirmación de nueva contraseña
    
    Requiere autenticación
    """
    try:
        user_id = current_user["user"]["id_usuario"]
        
        result = await change_user_password(user_id, password_data)
        
        return success_response(
            data=result,
            message="Contraseña cambiada exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="PASSWORD_CHANGE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error cambiando contraseña: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.post("/logout", summary="Cerrar sesión")
async def logout(current_user = Depends(get_current_user)):
    """
    Cerrar sesión del usuario actual
    
    Requiere autenticación
    """
    try:
        # En una implementación completa, aquí se invalidaría el token
        # Por ahora solo retornamos confirmación
        
        logger.info(f"Usuario {current_user['user']['email_usuario']} cerró sesión")
        
        return success_response(
            data={"logged_out": True},
            message="Sesión cerrada exitosamente"
        )
        
    except Exception as e:
        logger.error(f"Error en logout: {e}")
        return error_response(
            error="LOGOUT_ERROR",
            message="Error cerrando sesión",
            code=500
        )

@router.get("/me", summary="Obtener datos del usuario actual")
async def get_current_user_info(current_user = Depends(get_current_user)):
    """
    Obtener información del usuario autenticado
    
    Requiere autenticación
    """
    try:
        return success_response(
            data=current_user["user"],
            message="Datos de usuario obtenidos exitosamente"
        )
        
    except Exception as e:
        logger.error(f"Error obteniendo datos de usuario: {e}")
        return error_response(
            error="USER_INFO_ERROR",
            message="Error obteniendo datos de usuario",
            code=500
        )

@router.post("/verify-token", summary="Verificar validez del token")
async def verify_token(current_user = Depends(get_current_user)):
    """
    Verificar si el token actual es válido
    
    Requiere autenticación
    """
    try:
        return success_response(
            data={
                "valid": True,
                "user": current_user["user"],
                "token_data": current_user["token_data"]
            },
            message="Token válido"
        )
        
    except Exception as e:
        logger.error(f"Error verificando token: {e}")
        return error_response(
            error="TOKEN_VERIFICATION_ERROR",
            message="Error verificando token",
            code=500
        )