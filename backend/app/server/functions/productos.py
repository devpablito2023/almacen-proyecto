# backend/app/server/functions/productos.py
from fastapi import HTTPException, status
from server.config.database import (
    productos_collection,
    stock_collection, 
    get_next_id, 
    save_to_history, 
    log_activity
)
from server.models.productos import ProductoCreate, ProductoUpdate, ProductoSearch
from datetime import datetime
from typing import Optional, List
import logging
import math

logger = logging.getLogger(__name__)

async def crear_producto(producto_data: ProductoCreate, created_by: int, created_by_name: str):
    """Crear nuevo producto"""
    try:
        # Verificar que código no exista
        existing_codigo = await productos_collection().find_one(
            {"codigo_producto": producto_data.codigo_producto}
        )
        if existing_codigo:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El código de producto ya existe"
            )
        
        # Generar ID autoincremental
        nuevo_id = await get_next_id("productos")
        
        # Preparar datos del producto
        producto_dict = {
            "id_producto": nuevo_id,
            "codigo_producto": producto_data.codigo_producto,
            "nombre_producto": producto_data.nombre_producto,
            "tipo_producto": producto_data.tipo_producto,
            "categoria_producto": producto_data.categoria_producto,
            "proveedor_producto": producto_data.proveedor_producto,
            "costo_unitario": float(producto_data.costo_unitario) if producto_data.costo_unitario else None,
            "precio_referencial": float(producto_data.precio_referencial) if producto_data.precio_referencial else None,
            "ubicacion_fisica": producto_data.ubicacion_fisica,
            "stock_minimo": producto_data.stock_minimo,
            "stock_maximo": producto_data.stock_maximo,
            "stock_critico": producto_data.stock_critico,
            "estado_producto": 1,
            "descripcion_producto": producto_data.descripcion_producto,
            "url_foto_producto": None,
            "magnitud_producto": producto_data.magnitud_producto,
            "requiere_lote": producto_data.requiere_lote,
            "dias_vida_util": producto_data.dias_vida_util,
            "created_at": datetime.now(),
            "created_by": created_by,
            "created_by_name": created_by_name,
            "updated_at": None,
            "updated_by": None,
            "updated_by_name": None
        }
        
        # Insertar producto
        result = await productos_collection().insert_one(producto_dict)
        
        # Crear registro inicial en stock
        stock_inicial = {
            "id_stock": await get_next_id("stock"),
            "producto_id": nuevo_id,
            "producto_codigo": producto_data.codigo_producto,
            "producto_nombre": producto_data.nombre_producto,
            "cantidad_disponible": 0,
            "cantidad_reservada": 0,
            "cantidad_total": 0,
            "ubicacion_fisica": producto_data.ubicacion_fisica,
            "lote_serie": None,
            "fecha_vencimiento": None,
            "costo_promedio": float(producto_data.costo_unitario) if producto_data.costo_unitario else 0.0,
            "valor_inventario": 0.0,
            "fecha_ultimo_movimiento": None,
            "estado_stock": 1,
            "alerta_generada": False,
            "created_at": datetime.now(),
            "created_by": created_by,
            "created_by_name": created_by_name
        }
        
        await stock_collection().insert_one(stock_inicial)
        
        # Guardar en histórico
        await save_to_history(
            "productos",
            producto_dict,
            "CREATED",
            created_by,
            created_by_name
        )
        
        # Log de actividad
        await log_activity(
            action="PRODUCT_CREATED",
            module="productos",
            user_id=created_by,
            user_name=created_by_name,
            details={"product_id": nuevo_id, "codigo": producto_data.codigo_producto}
        )
        
        # Obtener producto creado
        producto_creado = await productos_collection().find_one(
            {"_id": result.inserted_id},
            {"_id": 0}
        )
        
        logger.info(f"Producto creado exitosamente: {producto_data.codigo_producto}")
        
        return producto_creado
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando producto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_producto_por_id(product_id: int):
    """Obtener producto por ID"""
    try:
        producto = await productos_collection().find_one(
            {"id_producto": product_id},
            {"_id": 0}
        )
        
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        return producto
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo producto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_productos(page: int = 1, limit: int = 20, estado: Optional[int] = None, tipo: Optional[str] = None):
    """Obtener lista de productos con paginación"""
    try:
        # Construir filtros
        filtros = {}
        if estado is not None:
            filtros["estado_producto"] = estado
        if tipo:
            filtros["tipo_producto"] = tipo
        
        # Calcular skip
        skip = (page - 1) * limit
        
        # Obtener total de registros
        total = await productos_collection().count_documents(filtros)
        
        # Obtener productos
        cursor = productos_collection().find(filtros, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
        productos = await cursor.to_list(length=limit)
        
        # Calcular paginación
        pages = math.ceil(total / limit) if total > 0 else 0
        
        return {
            "data": productos,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo productos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def actualizar_producto(product_id: int, producto_data: ProductoUpdate, updated_by: int, updated_by_name: str):
    """Actualizar producto"""
    try:
        # Verificar que producto existe
        producto_actual = await productos_collection().find_one({"id_producto": product_id})
        if not producto_actual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        # Preparar datos para actualizar
        update_data = {}
        for field, value in producto_data.dict(exclude_unset=True).items():
            if value is not None:
                if field in ["costo_unitario", "precio_referencial"] and value is not None:
                    update_data[field] = float(value)
                else:
                    update_data[field] = value
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay datos para actualizar"
            )
        
        # Agregar metadatos de actualización
        update_data.update({
            "updated_at": datetime.now(),
            "updated_by": updated_by,
            "updated_by_name": updated_by_name
        })
        
        # Actualizar en BD
        result = await productos_collection().update_one(
            {"id_producto": product_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se realizaron cambios"
            )
        
        # Obtener producto actualizado
        producto_actualizado = await productos_collection().find_one(
            {"id_producto": product_id},
            {"_id": 0}
        )
        
        # Actualizar datos relacionados en stock si es necesario
        stock_update = {}
        if "nombre_producto" in update_data:
            stock_update["producto_nombre"] = update_data["nombre_producto"]
        if "ubicacion_fisica" in update_data:
            stock_update["ubicacion_fisica"] = update_data["ubicacion_fisica"]
        if "costo_unitario" in update_data:
            stock_update["costo_promedio"] = update_data["costo_unitario"]
        
        if stock_update:
            await stock_collection().update_one(
                {"producto_id": product_id},
                {"$set": stock_update}
            )
        
        # Guardar en histórico
        await save_to_history(
            "productos",
            producto_actualizado,
            "UPDATED",
            updated_by,
            updated_by_name
        )
        
        # Log de actividad
        await log_activity(
            action="PRODUCT_UPDATED",
            module="productos",
            user_id=updated_by,
            user_name=updated_by_name,
            details={"product_id": product_id, "fields": list(update_data.keys())}
        )
        
        logger.info(f"Producto actualizado: ID {product_id}")
        
        return producto_actualizado
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando producto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
       )

async def eliminar_producto(product_id: int, deleted_by: int, deleted_by_name: str):
   """Eliminar producto (soft delete)"""
   try:
       # Verificar que producto existe y no está ya eliminado
       producto = await productos_collection().find_one({
           "id_producto": product_id,
           "estado_producto": 1
       })
       
       if not producto:
           raise HTTPException(
               status_code=status.HTTP_404_NOT_FOUND,
               detail="Producto no encontrado o ya eliminado"
           )
       
       # Verificar que no tenga stock
       stock = await stock_collection().find_one({"producto_id": product_id})
       if stock and stock["cantidad_total"] > 0:
           raise HTTPException(
               status_code=status.HTTP_400_BAD_REQUEST,
               detail="No se puede eliminar un producto con stock existente"
           )
       
       # Soft delete
       result = await productos_collection().update_one(
           {"id_producto": product_id},
           {
               "$set": {
                   "estado_producto": 0,
                   "updated_at": datetime.now(),
                   "updated_by": deleted_by,
                   "updated_by_name": deleted_by_name
               }
           }
       )
       
       # Eliminar también el stock
       await stock_collection().update_one(
           {"producto_id": product_id},
           {
               "$set": {
                   "estado_stock": 0,
                   "updated_at": datetime.now()
               }
           }
       )
       
       # Guardar en histórico
       producto["estado_producto"] = 0
       await save_to_history(
           "productos",
           producto,
           "DELETED",
           deleted_by,
           deleted_by_name
       )
       
       # Log de actividad
       await log_activity(
           action="PRODUCT_DELETED",
           module="productos",
           user_id=deleted_by,
           user_name=deleted_by_name,
           details={"product_id": product_id, "codigo": producto["codigo_producto"]}
       )
       
       logger.info(f"Producto eliminado: ID {product_id}")
       
       return {"message": "Producto eliminado exitosamente"}
       
   except HTTPException:
       raise
   except Exception as e:
       logger.error(f"Error eliminando producto: {e}")
       raise HTTPException(
           status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
           detail="Error interno del servidor"
       )

async def buscar_productos(search_params: ProductoSearch, limit: int = 20):
   """Buscar productos con filtros"""
   try:
       # Construir filtros de búsqueda
       filtros = {}
       
       if search_params.codigo:
           filtros["codigo_producto"] = {"$regex": search_params.codigo, "$options": "i"}
       
       if search_params.nombre:
           filtros["nombre_producto"] = {"$regex": search_params.nombre, "$options": "i"}
       
       if search_params.tipo:
           filtros["tipo_producto"] = search_params.tipo
       
       if search_params.categoria:
           filtros["categoria_producto"] = {"$regex": search_params.categoria, "$options": "i"}
       
       if search_params.proveedor:
           filtros["proveedor_producto"] = {"$regex": search_params.proveedor, "$options": "i"}
       
       if search_params.estado is not None:
           filtros["estado_producto"] = search_params.estado
       
       # Si busca productos con stock bajo, hacer join con stock
       if search_params.stock_bajo:
           pipeline = [
               {"$match": filtros},
               {
                   "$lookup": {
                       "from": "stock",
                       "localField": "id_producto",
                       "foreignField": "producto_id",
                       "as": "stock_info"
                   }
               },
               {"$unwind": "$stock_info"},
               {
                   "$match": {
                       "$expr": {
                           "$lte": ["$stock_info.cantidad_total", "$stock_minimo"]
                       }
                   }
               },
               {"$project": {"_id": 0, "stock_info": 0}},
               {"$limit": limit}
           ]
           
           cursor = productos_collection().aggregate(pipeline)
           productos = await cursor.to_list(length=limit)
       else:
           # Búsqueda normal
           cursor = productos_collection().find(filtros, {"_id": 0}).sort("nombre_producto", 1).limit(limit)
           productos = await cursor.to_list(length=limit)
       
       return productos
       
   except Exception as e:
       logger.error(f"Error buscando productos: {e}")
       raise HTTPException(
           status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
           detail="Error interno del servidor"
       )

async def verificar_codigo_producto_unico(codigo: str, exclude_id: Optional[int] = None):
   """Verificar si un código de producto es único"""
   try:
       filtros = {"codigo_producto": codigo}
       if exclude_id:
           filtros["id_producto"] = {"$ne": exclude_id}
       
       existing = await productos_collection().find_one(filtros)
       
       return existing is None
       
   except Exception as e:
       logger.error(f"Error verificando código único: {e}")
       return False

async def obtener_productos_autocomplete(query: str, limit: int = 10):
   """Obtener productos para autocomplete"""
   try:
       filtros = {
           "estado_producto": 1,
           "$or": [
               {"codigo_producto": {"$regex": query, "$options": "i"}},
               {"nombre_producto": {"$regex": query, "$options": "i"}}
           ]
       }
       
       cursor = productos_collection().find(
           filtros,
           {"id_producto": 1, "codigo_producto": 1, "nombre_producto": 1, "magnitud_producto": 1, "_id": 0}
       ).sort("nombre_producto", 1).limit(limit)
       
       productos = await cursor.to_list(length=limit)
       
       return productos
       
   except Exception as e:
       logger.error(f"Error en autocomplete de productos: {e}")
       raise HTTPException(
           status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
           detail="Error interno del servidor"
       )