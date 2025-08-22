# backend/app/server/functions/usuarios.py
from fastapi import HTTPException, status
from server.config.database import (
    usuarios_collection, 
    get_next_id, 
    save_to_history, 
    log_activity
)
from server.config.security import SecurityManager
from server.models.usuarios import UsuarioCreate, UsuarioUpdate
from datetime import datetime
from typing import Optional, List, Dict, Any
import logging
import math

logger = logging.getLogger(__name__)

async def crear_usuario(usuario_data: UsuarioCreate, created_by: int = 0, created_by_name: str = "Sistema"):
    """Crear nuevo usuario"""
    try:
        # Verificar que email no exista
        existing_email = await usuarios_collection().find_one(
            {"email_usuario": usuario_data.email_usuario}
        )
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está registrado"
            )
        
        # Verificar que código no exista
        existing_codigo = await usuarios_collection().find_one(
            {"codigo_usuario": usuario_data.codigo_usuario}
        )
        if existing_codigo:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El código de usuario ya existe"
            )
        
        # Generar ID autoincremental
        nuevo_id = await get_next_id("usuarios")
        
        # Hash de la contraseña
        password_hash = SecurityManager.hash_password(usuario_data.password)
        
        # Preparar datos del usuario
        usuario_dict = {
            "id_usuario": nuevo_id,
            "codigo_usuario": usuario_data.codigo_usuario,
            "nombre_usuario": usuario_data.nombre_usuario,
            "email_usuario": usuario_data.email_usuario,
            "password_hash": password_hash,
            "tipo_usuario": usuario_data.tipo_usuario,
            "area_usuario": usuario_data.area_usuario,
            "estado_usuario": 1,
            "ultimo_login": None,
            "intentos_login": 0,
            "token_reset": None,
            "created_at": datetime.now(),
            "created_by": created_by,
            "created_by_name": created_by_name,
            "updated_at": None,
            "updated_by": None,
            "updated_by_name": None
        }
        
        # Insertar en BD
        result = await usuarios_collection().insert_one(usuario_dict)
        
        # Guardar en histórico
        await save_to_history(
            "usuarios",
            usuario_dict,
            "CREATED",
            created_by,
            created_by_name
        )
        
        # Log de actividad
        await log_activity(
            action="USER_CREATED",
            module="usuarios",
            user_id=created_by,
            user_name=created_by_name,
            details={"new_user_id": nuevo_id, "email": usuario_data.email_usuario}
        )
        
        # Obtener usuario creado sin password
        usuario_creado = await usuarios_collection().find_one(
            {"_id": result.inserted_id},
            {"password_hash": 0, "_id": 0}
        )
        
        logger.info(f"Usuario creado exitosamente: {usuario_data.email_usuario}")
        
        return usuario_creado
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando usuario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_usuario_por_id(user_id: int):
    """Obtener usuario por ID"""
    try:
        usuario = await usuarios_collection().find_one(
            {"id_usuario": user_id},
            {"password_hash": 0, "_id": 0}
        )
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        return usuario
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo usuario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_usuarios(page: int = 1, limit: int = 20, estado: Optional[int] = None):
    """Obtener lista de usuarios con paginación"""
    try:
        # Construir filtros
        filtros = {}
        if estado is not None:
            filtros["estado_usuario"] = estado
        
        # Calcular skip
        skip = (page - 1) * limit
        
        # Obtener total de registros
        total = await usuarios_collection().count_documents(filtros)
        
        # Obtener usuarios
        cursor = usuarios_collection().find(
            filtros,
            {"password_hash": 0, "_id": 0}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        usuarios = await cursor.to_list(length=limit)
        
        # Calcular paginación
        pages = math.ceil(total / limit) if total > 0 else 0
        
        return {
            "data": usuarios,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo usuarios: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def actualizar_usuario(user_id: int, usuario_data: UsuarioUpdate, updated_by: int, updated_by_name: str):
    """Actualizar usuario"""
    try:
        # Verificar que usuario existe
        usuario_actual = await usuarios_collection().find_one({"id_usuario": user_id})
        if not usuario_actual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Preparar datos para actualizar
        update_data = {}
        for field, value in usuario_data.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay datos para actualizar"
            )
        
        # Verificar email único si se está actualizando
        if "email_usuario" in update_data:
            existing_email = await usuarios_collection().find_one({
                "email_usuario": update_data["email_usuario"],
                "id_usuario": {"$ne": user_id}
            })
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El email ya está registrado"
                )
        
        # Agregar metadatos de actualización
        update_data.update({
            "updated_at": datetime.now(),
            "updated_by": updated_by,
            "updated_by_name": updated_by_name
        })
        
        # Actualizar en BD
        result = await usuarios_collection().update_one(
            {"id_usuario": user_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se realizaron cambios"
            )
        
        # Obtener usuario actualizado
        usuario_actualizado = await usuarios_collection().find_one(
            {"id_usuario": user_id},
            {"password_hash": 0, "_id": 0}
        )
        
        # Guardar en histórico
        await save_to_history(
            "usuarios",
            usuario_actualizado,
            "UPDATED",
            updated_by,
            updated_by_name
        )
        
        # Log de actividad
        await log_activity(
            action="USER_UPDATED",
            module="usuarios",
            user_id=updated_by,
            user_name=updated_by_name,
            details={"updated_user_id": user_id, "fields": list(update_data.keys())}
        )
        
        logger.info(f"Usuario actualizado: ID {user_id}")
        
        return usuario_actualizado
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando usuario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def eliminar_usuario(user_id: int, deleted_by: int, deleted_by_name: str):
    """Eliminar usuario (soft delete)"""
    try:
        # Verificar que usuario existe y no está ya eliminado
        usuario = await usuarios_collection().find_one({
            "id_usuario": user_id,
            "estado_usuario": 1
        })
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado o ya eliminado"
            )
        
        # No permitir eliminar superusuario
        if usuario["tipo_usuario"] == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar un superusuario"
            )
        
        # Soft delete
        result = await usuarios_collection().update_one(
            {"id_usuario": user_id},
            {
                "$set": {
                    "estado_usuario": 0,
                    "updated_at": datetime.now(),
                    "updated_by": deleted_by,
                    "updated_by_name": deleted_by_name
                }
            }
        )
        
        # Guardar en histórico
        usuario["estado_usuario"] = 0
        await save_to_history(
            "usuarios",
            usuario,
            "DELETED",
            deleted_by,
            deleted_by_name
        )
        
        # Log de actividad
        await log_activity(
            action="USER_DELETED",
            module="usuarios",
            user_id=deleted_by,
            user_name=deleted_by_name,
            details={"deleted_user_id": user_id, "email": usuario["email_usuario"]}
        )
        
        logger.info(f"Usuario eliminado: ID {user_id}")
        
        return {"message": "Usuario eliminado exitosamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando usuario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def buscar_usuarios(query: str, tipo_usuario: Optional[int] = None, estado: Optional[int] = None, limit: int = 20):
    """Buscar usuarios por nombre, email o código"""
    try:
        # Construir filtros de búsqueda
        filtros = {
            "$or": [
                {"nombre_usuario": {"$regex": query, "$options": "i"}},
                {"email_usuario": {"$regex": query, "$options": "i"}},
                {"codigo_usuario": {"$regex": query, "$options": "i"}},
                {"area_usuario": {"$regex": query, "$options": "i"}}
            ]
        }
        
        if tipo_usuario is not None:
            filtros["tipo_usuario"] = tipo_usuario
            
        if estado is not None:
            filtros["estado_usuario"] = estado
        
        # Realizar búsqueda
        cursor = usuarios_collection().find(
            filtros,
            {"password_hash": 0, "_id": 0}
        ).sort("nombre_usuario", 1).limit(limit)
        
        usuarios = await cursor.to_list(length=limit)
        
        return usuarios
        
    except Exception as e:
        logger.error(f"Error buscando usuarios: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )