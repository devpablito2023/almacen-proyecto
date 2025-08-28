# backend/app/server/routes/usuarios.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from server.functions.usuarios import (
    crear_usuario,
    obtener_usuario_por_id,
    obtener_usuarios,
    actualizar_usuario,
    eliminar_usuario,
    buscar_usuarios
)
from server.models.usuarios import UsuarioCreate, UsuarioUpdate
from server.models.responses import success_response, error_response, paginated_response
from server.routes.auth import get_current_user
from server.config.security import check_permission
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def check_user_permission(user_type: int, action: str):
    """Verificar permisos de usuario para módulo usuarios"""
    if not check_permission(user_type, "usuarios", action):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para esta operación"
        )

@router.post("/", summary="Crear nuevo usuario")
async def create_usuario(
    usuario_data: UsuarioCreate,
    current_user = Depends(get_current_user)
):
    """
    Crear un nuevo usuario en el sistema
    
    - **codigo_usuario**: Código único de usuario
    - **nombre_usuario**: Nombre completo
    - **email_usuario**: Email único
    - **password**: Contraseña
    - **tipo_usuario**: Tipo de usuario (0-5)
    - **area_usuario**: Área de trabajo
    
    Requiere permisos de creación de usuarios
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_user_permission(user_type, "create")
        
        # Crear usuario
        result = await crear_usuario(
            usuario_data,
            created_by=current_user["user"]["id_usuario"],
            created_by_name=current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data=result,
            message="Usuario creado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="USER_CREATION_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error creando usuario: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/", summary="Listar usuarios")
async def list_usuarios(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(20, ge=1, le=100, description="Elementos por página"),
    estado: Optional[int] = Query(None, ge=0, le=1, description="Estado del usuario"),
    current_user = Depends(get_current_user)
):
    """
    Obtener lista paginada de usuarios
    
    - **page**: Número de página (default: 1)
    - **limit**: Elementos por página (default: 20, max: 100)
    - **estado**: Filtrar por estado (0=inactivo, 1=activo)
    
    Requiere permisos de lectura de usuarios
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_user_permission(user_type, "read")
        
        result = await obtener_usuarios(page, limit, estado)
        
        return paginated_response(
            data=result["data"],
            total=result["total"],
            page=result["page"],
            limit=result["limit"],
            message="Usuarios obtenidos exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="USER_LIST_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error listando usuarios: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/{user_id}", summary="Obtener usuario por ID")
async def get_usuario(
    user_id: int,
    current_user = Depends(get_current_user)
):
    """
    Obtener información de un usuario específico
    
    - **user_id**: ID del usuario a consultar
    
    Requiere permisos de lectura de usuarios
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_user_permission(user_type, "read")
        
        result = await obtener_usuario_por_id(user_id)
        
        return success_response(
            data=result,
            message="Usuario obtenido exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="USER_NOT_FOUND",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error obteniendo usuario {user_id}: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.put("/{user_id}", summary="Actualizar usuario")
async def update_usuario(
    user_id: int,
    usuario_data: UsuarioUpdate,
    current_user = Depends(get_current_user)
):
    """
    Actualizar información de un usuario
    
    - **user_id**: ID del usuario a actualizar
    - **usuario_data**: Datos a actualizar
    
    Requiere permisos de actualización de usuarios
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_user_permission(user_type, "update")
        
        result = await actualizar_usuario(
            user_id,
            usuario_data,
            updated_by=current_user["user"]["id_usuario"],
            updated_by_name=current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data=result,
            message="Usuario actualizado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="USER_UPDATE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error actualizando usuario {user_id}: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.delete("/{user_id}", summary="Eliminar usuario")
async def delete_usuario(
    user_id: int,
    current_user = Depends(get_current_user)
):
    """
    Eliminar un usuario (soft delete)
    
    - **user_id**: ID del usuario a eliminar
    
    Requiere permisos de eliminación de usuarios
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_user_permission(user_type, "delete")
        
        # No permitir auto-eliminación
        if user_id == current_user["user"]["id_usuario"]:
            return error_response(
                error="SELF_DELETE_NOT_ALLOWED",
                message="No puede eliminar su propio usuario",
                code=400
            )
        
        result = await eliminar_usuario(
            user_id,
            deleted_by=current_user["user"]["id_usuario"],
            deleted_by_name=current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data=result,
            message="Usuario eliminado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="USER_DELETE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error eliminando usuario {user_id}: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/search/", summary="Buscar usuarios")
async def search_usuarios(
    q: str = Query(..., min_length=2, description="Término de búsqueda"),
    tipo_usuario: Optional[int] = Query(None, ge=0, le=5, description="Filtrar por tipo"),
    estado: Optional[int] = Query(None, ge=0, le=1, description="Filtrar por estado"),
    limit: int = Query(20, ge=1, le=100, description="Límite de resultados"),
    current_user = Depends(get_current_user)
):
    """
    Buscar usuarios por nombre, email, código o área
    
    - **q**: Término de búsqueda (mínimo 2 caracteres)
    - **tipo_usuario**: Filtrar por tipo de usuario
    - **estado**: Filtrar por estado
    - **limit**: Límite de resultados
    
    Requiere permisos de lectura de usuarios
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_user_permission(user_type, "read")
        
        result = await buscar_usuarios(q, tipo_usuario, estado, limit)
        
        return success_response(
            data=result,
            message=f"Se encontraron {len(result)} usuarios"
        )
        
    except HTTPException as e:
        return error_response(
            error="USER_SEARCH_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error buscando usuarios: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )