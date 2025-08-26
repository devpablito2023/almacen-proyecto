# backend/app/server/routes/productos.py
from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from server.functions.productos import (
    crear_producto,
    obtener_producto_por_id,
    obtener_productos,
    actualizar_producto,
    eliminar_producto,
    buscar_productos,
    verificar_codigo_producto_unico,
    obtener_estadistica,
    actualizar_estadistica,
    obtener_productos_autocomplete
)
from server.models.productos import ProductoCreate, ProductoUpdate, ProductoSearch
from server.models.responses import success_response, error_response, paginated_response
from server.routes.auth import get_current_user
from server.config.security import check_permission
from typing import Optional
import logging
import os
import uuid
from pathlib import Path

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/stats_ok")
async def actualizar_estadistica_productos():
    stats = await actualizar_estadistica()
    if not stats:
        return {"message": "No procesado"}
    return stats

@router.get("/stats")
async def obtener_estadisticas_productos():
    #stats = await stats_collection().find_one({"_id": "productos_stats"}, {"_id": 0})
    stats = await obtener_estadistica()
    if not stats:
        return {"message": "No hay estadísticas registradas"}
    return stats

def check_product_permission(user_type: int, action: str):
    """Verificar permisos de usuario para módulo productos"""
    if not check_permission(user_type, "productos", action):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para esta operación"
        )

@router.post("/", summary="Crear nuevo producto")
async def create_producto(
    producto_data: ProductoCreate,
    current_user = Depends(get_current_user)
):
    """
    Crear un nuevo producto en el sistema
    
    - **codigo_producto**: Código único del producto
    - **nombre_producto**: Nombre del producto
    - **tipo_producto**: Tipo (insumo, repuesto, herramienta, otro)
    - **categoria_producto**: Categoría del producto
    - **proveedor_producto**: Proveedor principal
    - **costo_unitario**: Costo unitario
    - **stock_minimo**: Stock mínimo
    - **stock_maximo**: Stock máximo
    - **stock_critico**: Stock crítico
    
    Requiere permisos de creación de productos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_product_permission(user_type, "create")
        
        result = await crear_producto(
            producto_data,
            created_by=current_user["user"]["id_usuario"],
            created_by_name=current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data=result,
            message="Producto creado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="PRODUCT_CREATION_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error creando producto: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/", summary="Listar productos")
async def list_productos(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(20, ge=1, le=100, description="Elementos por página"),
    estado: Optional[int] = Query(None, ge=0, le=1, description="Estado del producto"),
    tipo: Optional[str] = Query(None, description="Tipo de producto"),
    current_user = Depends(get_current_user)
):
    """
    Obtener lista paginada de productos
    
    - **page**: Número de página (default: 1)
    - **limit**: Elementos por página (default: 20, max: 100)
    - **estado**: Filtrar por estado (0=inactivo, 1=activo)
    - **tipo**: Filtrar por tipo de producto
    
    Requiere permisos de lectura de productos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_product_permission(user_type, "read")
        
        result = await obtener_productos(page, limit, estado, tipo)
        
        return paginated_response(
            data=result["data"],
            total=result["total"],
            page=result["page"],
            limit=result["limit"],
            message="Productos obtenidos exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="PRODUCT_LIST_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error listando productos: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/autocomplete", summary="Autocompletar productos")
async def autocomplete_productos(
    q: str = Query(..., min_length=1, description="Término de búsqueda"),
    limit: int = Query(10, ge=1, le=50, description="Límite de resultados"),
    current_user = Depends(get_current_user)
):
    """
    Obtener productos para autocompletar
    
    - **q**: Término de búsqueda
    - **limit**: Límite de resultados (default: 10, max: 50)
    
    Requiere permisos de lectura de productos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_product_permission(user_type, "read")
        
        result = await obtener_productos_autocomplete(q, limit)
        
        return success_response(
            data=result,
            message=f"Se encontraron {len(result)} productos"
        )
        
    except HTTPException as e:
        return error_response(
            error="AUTOCOMPLETE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error en autocomplete: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/search", summary="Buscar productos")
async def search_productos(
    codigo: Optional[str] = Query(None, description="Código del producto"),
    nombre: Optional[str] = Query(None, description="Nombre del producto"),
    tipo: Optional[str] = Query(None, description="Tipo de producto"),
    categoria: Optional[str] = Query(None, description="Categoría"),
    proveedor: Optional[str] = Query(None, description="Proveedor"),
    estado: Optional[int] = Query(None, ge=0, le=1, description="Estado"),
    stock_bajo: Optional[bool] = Query(False, description="Solo productos con stock bajo"),
    limit: int = Query(20, ge=1, le=100, description="Límite de resultados"),
    current_user = Depends(get_current_user)
):
    """
    Buscar productos con filtros avanzados
    
    - **codigo**: Filtrar por código
    - **nombre**: Filtrar por nombre
    - **tipo**: Filtrar por tipo
    - **categoria**: Filtrar por categoría
    - **proveedor**: Filtrar por proveedor
    - **estado**: Filtrar por estado
    - **stock_bajo**: Solo productos con stock bajo
    - **limit**: Límite de resultados
    
    Requiere permisos de lectura de productos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_product_permission(user_type, "read")
        
        search_params = ProductoSearch(
            codigo=codigo,
            nombre=nombre,
            tipo=tipo,
            categoria=categoria,
            proveedor=proveedor,
            estado=estado,
            stock_bajo=stock_bajo
        )
        
        result = await buscar_productos(search_params, limit)
        
        return success_response(
            data=result,
            message=f"Se encontraron {len(result)} productos"
        )
        
    except HTTPException as e:
        return error_response(
            error="PRODUCT_SEARCH_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error buscando productos: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/{product_id}", summary="Obtener producto por ID")
async def get_producto(
    product_id: int,
    current_user = Depends(get_current_user)
):
    """
    Obtener información de un producto específico
    
    - **product_id**: ID del producto a consultar
    
    Requiere permisos de lectura de productos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_product_permission(user_type, "read")
        
        result = await obtener_producto_por_id(product_id)
        
        return success_response(
            data=result,
            message="Producto obtenido exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="PRODUCT_NOT_FOUND",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error obteniendo producto {product_id}: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.put("/{product_id}", summary="Actualizar producto")
async def update_producto(
    product_id: int,
    producto_data: ProductoUpdate,
    current_user = Depends(get_current_user)
):
    """
    Actualizar información de un producto
    
    - **product_id**: ID del producto a actualizar
    - **producto_data**: Datos a actualizar
    
    Requiere permisos de actualización de productos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_product_permission(user_type, "update")
        
        result = await actualizar_producto(
            product_id,
            producto_data,
            updated_by=current_user["user"]["id_usuario"],
            updated_by_name=current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data=result,
            message="Producto actualizado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="PRODUCT_UPDATE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error actualizando producto {product_id}: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.delete("/{product_id}", summary="Eliminar producto")
async def delete_producto(
    product_id: int,
    current_user = Depends(get_current_user)
):
    """
    Eliminar un producto (soft delete)
    
    - **product_id**: ID del producto a eliminar
    
    Requiere permisos de eliminación de productos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_product_permission(user_type, "delete")
        
        result = await eliminar_producto(
            product_id,
            deleted_by=current_user["user"]["id_usuario"],
            deleted_by_name=current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data=result,
            message="Producto eliminado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="PRODUCT_DELETE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error eliminando producto {product_id}: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.post("/{product_id}/upload-image", summary="Subir imagen de producto")
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """
    Subir imagen para un producto
    
    - **product_id**: ID del producto
    - **file**: Archivo de imagen (JPG, PNG, máx 5MB)
    
    Requiere permisos de actualización de productos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_product_permission(user_type, "update")
        
        # Verificar que el producto existe
        await obtener_producto_por_id(product_id)
        
        # Validar archivo
        if not file.content_type.startswith('image/'):
            return error_response(
                error="INVALID_FILE_TYPE",
                message="Solo se permiten archivos de imagen",
                code=400
            )
        
        # Validar tamaño (5MB máximo)
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            return error_response(
                error="FILE_TOO_LARGE",
                message="El archivo es demasiado grande (máximo 5MB)",
                code=400
            )
        
        # Generar nombre único
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"product_{product_id}_{uuid.uuid4().hex}{file_extension}"
        
        # Crear directorio si no existe
        upload_dir = Path("static/images/products")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Guardar archivo
        file_path = upload_dir / unique_filename
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Actualizar URL en producto

        url_foto = f"/static/images/products/{unique_filename}"
       
        from server.models.productos import ProductoUpdate
        update_data = ProductoUpdate(url_foto_producto=url_foto)
        
        await actualizar_producto(
            product_id,
            update_data,
            updated_by=current_user["user"]["id_usuario"],
            updated_by_name=current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data={"url_foto": url_foto},
            message="Imagen subida exitosamente"
        )
       
    except HTTPException as e:
        return error_response(
            error="IMAGE_UPLOAD_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error subiendo imagen: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/validate/codigo/{codigo}", summary="Validar código único")
async def validate_codigo_producto(
   codigo: str,
   exclude_id: Optional[int] = Query(None, description="ID a excluir de la validación"),
   current_user = Depends(get_current_user)
):
   """
   Validar si un código de producto es único
   
   - **codigo**: Código a validar
   - **exclude_id**: ID de producto a excluir (para edición)
   
   Requiere permisos de lectura de productos
   """
   try:
       # Verificar permisos
       user_type = current_user["user"]["tipo_usuario"]
       check_product_permission(user_type, "read")
       
       is_unique = await verificar_codigo_producto_unico(codigo, exclude_id)
       
       return success_response(
           data={
               "codigo": codigo,
               "is_unique": is_unique,
               "available": is_unique
           },
           message="Validación completada"
       )
       
   except Exception as e:
       logger.error(f"Error validando código: {e}")
       return error_response(
           error="VALIDATION_ERROR",
           message="Error validando código",
           code=500
       )

        