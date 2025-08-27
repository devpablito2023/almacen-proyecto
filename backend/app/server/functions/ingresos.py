# backend/app/server/functions/ingresos.py
from fastapi import HTTPException, status, UploadFile, File
from server.config.database import (
    ingresos_collection,
    productos_collection,
    stock_collection,
    kardex_collection,
    get_next_id,
    save_to_history,
    log_activity,
    stats_collection
)
from server.models.ingresos import IngresoCreate, IngresoUpdate, IngresoSearch, IngresoBulk
from server.functions.kardex import registrar_movimiento_kardex
from server.functions.stock import actualizar_stock_por_ingreso
from server.utils.excel_processor import procesar_excel_ingresos, validar_excel_ingresos

from datetime import datetime
from typing import Optional, List
import logging
import math
import pandas as pd
import io

logger = logging.getLogger(__name__)

async def crear_ingreso(ingreso_data: IngresoCreate, created_by: int, created_by_name: str):
    """Crear nuevo ingreso de productos"""
    try:
        # Verificar que el producto existe
        producto = await productos_collection().find_one(
            {"id_producto": ingreso_data.producto_id, "estado_producto": 1}
        )
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado o inactivo"
            )
        
        # Generar ID autoincremental y número de ingreso
        nuevo_id = await get_next_id("ingresos")
        numero_ingreso = f"ING-{datetime.now().strftime('%Y%m')}-{nuevo_id:04d}"
        
        # Preparar datos del ingreso
        ingreso_dict = {
            "id_ingreso": nuevo_id,
            "numero_ingreso": numero_ingreso,
            "producto_id": ingreso_data.producto_id,
            "producto_codigo": producto["codigo_producto"],
            "producto_nombre": producto["nombre_producto"],
            "proveedor_ingreso": ingreso_data.proveedor_ingreso,
            "factura_ingreso": ingreso_data.factura_ingreso,
            "orden_compra": ingreso_data.orden_compra,
            "cantidad_solicitada": ingreso_data.cantidad_solicitada,
            "cantidad_recibida": 0,  # Se actualiza al validar
            "costo_unitario": float(ingreso_data.costo_unitario),
            "costo_total": float(ingreso_data.cantidad_solicitada * ingreso_data.costo_unitario),
            "lote_serie": ingreso_data.lote_serie,
            "fecha_vencimiento": ingreso_data.fecha_vencimiento,
            "ubicacion_asignada": ingreso_data.ubicacion_asignada or producto["ubicacion_fisica"],
            "url_foto_ingreso": None,
            "documento_ingreso": ingreso_data.documento_ingreso,
            "observaciones_ingreso": ingreso_data.observaciones_ingreso,
            "condicion_ingreso": 1,  # Creado
            "estado_ingreso": 1,     # Activo
            "fecha_recepcion": None,
            "recibido_por": None,
            "recibido_por_name": None,
            "validado_por": None,
            "validado_por_name": None,
            "created_at": datetime.now(),
            "updated_at": None,
            "created_by": created_by,
            "created_by_name": created_by_name,
            "updated_by": None,
            "updated_by_name": None
        }
        
        # Insertar ingreso
        result = await ingresos_collection().insert_one(ingreso_dict)
        
        # Guardar en histórico
        await save_to_history(
            "ingresos",
            ingreso_dict,
            "CREATED",
            created_by,
            created_by_name
        )
        
        # Log de actividad
        await log_activity(
            action="INGRESO_CREATED",
            module="ingresos",
            user_id=created_by,
            user_name=created_by_name,
            details={
                "ingreso_id": nuevo_id,
                "numero": numero_ingreso,
                "producto_id": ingreso_data.producto_id,
                "cantidad": ingreso_data.cantidad_solicitada
            }
        )
        
        # Obtener ingreso creado
        ingreso_creado = await ingresos_collection().find_one(
            {"_id": result.inserted_id},
            {"_id": 0}
        )
        
        # Actualizar estadísticas
        await actualizar_estadisticas_ingresos_crear(ingreso_creado)
        
        logger.info(f"Ingreso creado exitosamente: {numero_ingreso}")
        
        return ingreso_creado
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando ingreso: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def validar_ingreso(ingreso_id: int, cantidad_recibida: int, validado_por: int, validado_por_name: str, observaciones: Optional[str] = None):
    """Validar ingreso y actualizar stock"""
    try:
        # Verificar que el ingreso existe y está pendiente
        ingreso = await ingresos_collection().find_one({
            "id_ingreso": ingreso_id,
            "condicion_ingreso": 1,
            "estado_ingreso": 1
        })
        
        if not ingreso:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingreso no encontrado o ya procesado"
            )
        
        # Validar cantidad recibida
        if cantidad_recibida <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cantidad recibida debe ser mayor a 0"
            )
        
        # Determinar nueva condición
        nueva_condicion = 2  # Validado
        if cantidad_recibida != ingreso["cantidad_solicitada"]:
            nueva_condicion = 3  # Cantidad modificada
        
        # Actualizar ingreso
        update_data = {
            "cantidad_recibida": cantidad_recibida,
            "costo_total": cantidad_recibida * ingreso["costo_unitario"],
            "condicion_ingreso": nueva_condicion,
            "fecha_recepcion": datetime.now(),
            "validado_por": validado_por,
            "validado_por_name": validado_por_name,
            "recibido_por": validado_por,
            "recibido_por_name": validado_por_name,
            "updated_at": datetime.now(),
            "updated_by": validado_por,
            "updated_by_name": validado_por_name
        }
        
        if observaciones:
            update_data["observaciones_ingreso"] = observaciones
        
        # Actualizar en BD
        await ingresos_collection().update_one(
            {"id_ingreso": ingreso_id},
            {"$set": update_data}
        )
        
        # Actualizar stock
        await actualizar_stock_por_ingreso(
            producto_id=ingreso["producto_id"],
            cantidad=cantidad_recibida,
            costo_unitario=ingreso["costo_unitario"],
            lote_serie=ingreso["lote_serie"],
            fecha_vencimiento=ingreso["fecha_vencimiento"],
            ubicacion=ingreso["ubicacion_asignada"]
        )
        
        # Registrar en kardex
        await registrar_movimiento_kardex(
            producto_id=ingreso["producto_id"],
            operacion="INGRESO",
            tipo_movimiento="COMPRA",
            cantidad=cantidad_recibida,
            costo_unitario=ingreso["costo_unitario"],
            documento_referencia=ingreso["numero_ingreso"],
            numero_documento=ingreso["factura_ingreso"],
            motivo=f"Ingreso validado - {ingreso['proveedor_ingreso']}",
            ingreso_id=ingreso_id,
            realizado_por=validado_por,
            realizado_por_name=validado_por_name,
            lote_serie=ingreso["lote_serie"]
        )
        
        # Obtener ingreso actualizado
        ingreso_actualizado = await ingresos_collection().find_one(
            {"id_ingreso": ingreso_id},
            {"_id": 0}
        )
        
        # Guardar en histórico
        await save_to_history(
            "ingresos",
            ingreso_actualizado,
            "VALIDATED",
            validado_por,
            validado_por_name
        )
        
        # Log de actividad
        await log_activity(
            action="INGRESO_VALIDATED",
            module="ingresos",
            user_id=validado_por,
            user_name=validado_por_name,
            details={
                "ingreso_id": ingreso_id,
                "cantidad_recibida": cantidad_recibida,
                "diferencia": cantidad_recibida - ingreso["cantidad_solicitada"]
            }
        )
        
        logger.info(f"Ingreso validado: {ingreso['numero_ingreso']} - Cantidad: {cantidad_recibida}")
        
        return ingreso_actualizado
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validando ingreso: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def cancelar_ingreso(ingreso_id: int, cancelado_por: int, cancelado_por_name: str, motivo: str):
    """Cancelar ingreso"""
    try:
        # Verificar que el ingreso existe y se puede cancelar
        ingreso = await ingresos_collection().find_one({
            "id_ingreso": ingreso_id,
            "condicion_ingreso": 1,  # Solo se pueden cancelar los creados
            "estado_ingreso": 1
        })
        
        if not ingreso:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingreso no encontrado o no se puede cancelar"
            )
        
        # Actualizar estado
        await ingresos_collection().update_one(
            {"id_ingreso": ingreso_id},
            {
                "$set": {
                    "condicion_ingreso": 0,  # Cancelado
                    "observaciones_ingreso": f"{ingreso.get('observaciones_ingreso', '')} | CANCELADO: {motivo}",
                    "updated_at": datetime.now(),
                    "updated_by": cancelado_por,
                    "updated_by_name": cancelado_por_name
                }
            }
        )
        
        # Obtener ingreso actualizado
        ingreso_cancelado = await ingresos_collection().find_one(
            {"id_ingreso": ingreso_id},
            {"_id": 0}
        )
        
        # Guardar en histórico
        await save_to_history(
            "ingresos",
            ingreso_cancelado,
            "CANCELLED",
            cancelado_por,
            cancelado_por_name
        )
        
        # Log de actividad
        await log_activity(
            action="INGRESO_CANCELLED",
            module="ingresos",
            user_id=cancelado_por,
            user_name=cancelado_por_name,
            details={
                "ingreso_id": ingreso_id,
                "motivo": motivo
            }
        )
        
        logger.info(f"Ingreso cancelado: {ingreso['numero_ingreso']}")
        
        return ingreso_cancelado
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelando ingreso: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_ingresos(page: int = 1, limit: int = 20, condicion: Optional[int] = None, producto_id: Optional[int] = None):
    """Obtener lista de ingresos con paginación"""
    try:
        # Construir filtros
        filtros = {"estado_ingreso": 1}
        if condicion is not None:
            filtros["condicion_ingreso"] = condicion
        if producto_id:
            filtros["producto_id"] = producto_id
        
        # Calcular skip
        skip = (page - 1) * limit
        
        # Obtener total de registros
        total = await ingresos_collection().count_documents(filtros)
        
        # Obtener ingresos
        cursor = ingresos_collection().find(
            filtros, 
            {"_id": 0}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        ingresos = await cursor.to_list(length=limit)
        
        # Calcular paginación
        pages = math.ceil(total / limit) if total > 0 else 0
        
        # Obtener estadísticas
        stats = await obtener_estadisticas_ingresos()
        
        return {
            "data": {
                "ingresos": ingresos,
                "stats": stats
            },
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo ingresos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_ingreso_por_id(ingreso_id: int):
    """Obtener ingreso por ID"""
    try:
        ingreso = await ingresos_collection().find_one(
            {"id_ingreso": ingreso_id},
            {"_id": 0}
        )
        
        if not ingreso:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingreso no encontrado"
            )
        
        return ingreso
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo ingreso: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_ingresos_pendientes():
    """Obtener ingresos pendientes de validación"""
    try:
        cursor = ingresos_collection().find(
            {
                "condicion_ingreso": 1,  # Creado
                "estado_ingreso": 1      # Activo
            },
            {"_id": 0}
        ).sort("created_at", 1)  # Los más antiguos primero
        
        ingresos_pendientes = await cursor.to_list(length=None)
        
        return ingresos_pendientes
        
    except Exception as e:
        logger.error(f"Error obteniendo ingresos pendientes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def buscar_ingresos(search_params: IngresoSearch, limit: int = 50):
    """Buscar ingresos con filtros"""
    try:
        filtros = {"estado_ingreso": 1}
        
        if search_params.numero_ingreso:
            filtros["numero_ingreso"] = {"$regex": search_params.numero_ingreso, "$options": "i"}
        
        if search_params.producto_codigo:
            filtros["producto_codigo"] = {"$regex": search_params.producto_codigo, "$options": "i"}
        
        if search_params.proveedor:
            filtros["proveedor_ingreso"] = {"$regex": search_params.proveedor, "$options": "i"}
        
        if search_params.factura:
            filtros["factura_ingreso"] = {"$regex": search_params.factura, "$options": "i"}
        
        if search_params.condicion is not None:
            filtros["condicion_ingreso"] = search_params.condicion
        
        if search_params.fecha_inicio:
            if "created_at" not in filtros:
                filtros["created_at"] = {}
            filtros["created_at"]["$gte"] = search_params.fecha_inicio
        
        if search_params.fecha_fin:
            if "created_at" not in filtros:
                filtros["created_at"] = {}
            filtros["created_at"]["$lte"] = search_params.fecha_fin
        
        cursor = ingresos_collection().find(
            filtros,
            {"_id": 0}
        ).sort("created_at", -1).limit(limit)
        
        ingresos = await cursor.to_list(length=limit)
        
        return ingresos
        
    except Exception as e:
        logger.error(f"Error buscando ingresos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def procesar_ingreso_masivo(file: UploadFile, created_by: int, created_by_name: str):
    """Procesar ingreso masivo desde archivo Excel"""
    try:
        # Validar archivo
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solo se permiten archivos Excel (.xlsx, .xls)"
            )
        
        # Leer archivo
        contents = await file.read()
        
        try:
            df = pd.read_excel(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error leyendo archivo Excel. Verifique el formato."
            )
        
        # Validar estructura del Excel
        columnas_requeridas = [
            'codigo_producto', 'cantidad_solicitada', 'costo_unitario',
            'proveedor_ingreso', 'factura_ingreso'
        ]
        
        columnas_faltantes = [col for col in columnas_requeridas if col not in df.columns]
        if columnas_faltantes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Columnas faltantes en Excel: {', '.join(columnas_faltantes)}"
            )
        
        # Procesar filas
        ingresos_creados = []
        errores = []
        
        for index, row in df.iterrows():
            try:
                # Buscar producto por código
                producto = await productos_collection().find_one({
                    "codigo_producto": str(row['codigo_producto']).strip(),
                    "estado_producto": 1
                })
                
                if not producto:
                    errores.append(f"Fila {index + 2}: Producto con código '{row['codigo_producto']}' no encontrado")
                    continue
                
                # Crear datos del ingreso
                ingreso_data = IngresoCreate(
                    producto_id=producto["id_producto"],
                    cantidad_solicitada=int(row['cantidad_solicitada']),
                    costo_unitario=float(row['costo_unitario']),
                    proveedor_ingreso=str(row['proveedor_ingreso']).strip(),
                    factura_ingreso=str(row['factura_ingreso']).strip(),
                    orden_compra=str(row.get('orden_compra', '')).strip() if pd.notna(row.get('orden_compra')) else None,
                    lote_serie=str(row.get('lote_serie', '')).strip() if pd.notna(row.get('lote_serie')) else None,
                    fecha_vencimiento=row.get('fecha_vencimiento') if pd.notna(row.get('fecha_vencimiento')) else None,
                    ubicacion_asignada=str(row.get('ubicacion_asignada', '')).strip() if pd.notna(row.get('ubicacion_asignada')) else None,
                    documento_ingreso=str(row.get('documento_ingreso', '')).strip() if pd.notna(row.get('documento_ingreso')) else None,
                    observaciones_ingreso=str(row.get('observaciones', '')).strip() if pd.notna(row.get('observaciones')) else None
                )
                
                # Crear ingreso
                ingreso_creado = await crear_ingreso(ingreso_data, created_by, created_by_name)
                ingresos_creados.append(ingreso_creado)
                
            except Exception as e:
                errores.append(f"Fila {index + 2}: {str(e)}")
                continue
        
        # Log de actividad para proceso masivo
        await log_activity(
            action="INGRESO_BULK_PROCESSED",
            module="ingresos",
            user_id=created_by,
            user_name=created_by_name,
            details={
                "archivo": file.filename,
                "total_filas": len(df),
                "creados": len(ingresos_creados),
                "errores": len(errores)
            }
        )
        
        logger.info(f"Proceso masivo completado: {len(ingresos_creados)} creados, {len(errores)} errores")
        
        return {
            "ingresos_creados": len(ingresos_creados),
            "total_filas": len(df),
            "errores": errores,
            "ingresos": ingresos_creados
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error procesando ingreso masivo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_estadisticas_ingresos():
    """Obtener estadísticas de ingresos"""
    try:
        # Total ingresos
        total_ingresos = await ingresos_collection().count_documents({"estado_ingreso": 1})
        
        # Ingresos pendientes
        pendientes = await ingresos_collection().count_documents({
            "condicion_ingreso": 1,
            "estado_ingreso": 1
        })
        
        # Ingresos validados
        validados = await ingresos_collection().count_documents({
            "condicion_ingreso": 2,
            "estado_ingreso": 1
        })
        
        # Valor total de ingresos del mes
        inicio_mes = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        valor_mes = await ingresos_collection().aggregate([
            {
                "$match": {
                    "created_at": {"$gte": inicio_mes},
                    "estado_ingreso": 1
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$costo_total"}
                }
            }
        ]).to_list(length=1)
        
        valor_total_mes = valor_mes[0]["total"] if valor_mes else 0.0
        
        # Ingresos por proveedor (top 5)
        top_proveedores = await ingresos_collection().aggregate([
            {
                "$match": {
                    "estado_ingreso": 1,
                    "condicion_ingreso": {"$in": [2, 3]}  # Validados
                }
            },
            {
                "$group": {
                    "_id": "$proveedor_ingreso",
                    "cantidad": {"$sum": "$cantidad_recibida"},
                    "valor": {"$sum": "$costo_total"}
                }
            },
            {"$sort": {"valor": -1}},
            {"$limit": 5}
        ]).to_list(length=5)
        
        return {
            "total_ingresos": total_ingresos,
            "pendientes": pendientes,
            "validados": validados,
            "cancelados": total_ingresos - pendientes - validados,
            "valor_total_mes": valor_total_mes,
            "top_proveedores": top_proveedores
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas de ingresos: {e}")
        return {
            "total_ingresos": 0,
            "pendientes": 0,
            "validados": 0,
            "cancelados": 0,
            "valor_total_mes": 0.0,
            "top_proveedores": []
        }

async def actualizar_estadisticas_ingresos_crear(ingreso):
    """Actualizar estadísticas al crear ingreso"""
    await stats_collection().update_one(
        {"_id": "ingresos_stats"},
        {
            "$inc": {
                "total_ingresos": 1,
                "pendientes": 1,
                f"por_proveedor.{ingreso['proveedor_ingreso']}": 1,
            },
            "$set": {"last_updated": datetime.now()}
        },
        upsert=True
    )

async def actualizar_estadisticas_ingresos_validar(ingreso):
    """Actualizar estadísticas al validar ingreso"""
    await stats_collection().update_one(
        {"_id": "ingresos_stats"},
        {
            "$inc": {
                "pendientes": -1,
                "validados": 1,
                "valor_total": ingreso["costo_total"]
            },
            "$set": {"last_updated": datetime.now()}
        },
        upsert=True
    )

async def actualizar_estadisticas_ingresos():
    """Actualizar estadísticas de ingresos en colección stats"""
    try:
        # Calcular estadísticas del último mes
        fecha_fin = datetime.now()
        fecha_inicio = fecha_fin - timedelta(days=30)
        
        stats = await obtener_estadisticas_ingresos(
            fecha_inicio.date(),
            fecha_fin.date()
        )
        
        # Obtener ingresos pendientes
        ingresos_pendientes = await obtener_ingresos_pendientes(10)
        
        # Top proveedores del último mes
        pipeline_proveedores = [
            {
                "$match": {
                    "estado_ingreso": 1,
                    "created_at": {
                        "$gte": fecha_inicio,
                        "$lte": fecha_fin
                    }
                }
            },
            {
                "$group": {
                    "_id": "$proveedor_ingreso",
                    "total_ingresos": {"$sum": 1},
                    "valor_total": {"$sum": "$costo_total"}
                }
            },
            {"$sort": {"total_ingresos": -1}},
            {"$limit": 10}
        ]
        
        cursor = ingresos_collection().aggregate(pipeline_proveedores)
        top_proveedores = await cursor.to_list(length=10)
        
        # Productos más ingresados del mes
        pipeline_productos = [
            {
                "$match": {
                    "estado_ingreso": 1,
                    "condicion_ingreso": 2,  # Solo validados
                    "created_at": {
                        "$gte": fecha_inicio,
                        "$lte": fecha_fin
                    }
                }
            },
            {
                "$lookup": {
                    "from": "productos",
                    "localField": "producto_id", 
                    "foreignField": "id_producto",
                    "as": "producto_info"
                }
            },
            {"$unwind": "$producto_info"},
            {
                "$group": {
                    "_id": "$producto_id",
                    "codigo_producto": {"$first": "$producto_info.codigo_producto"},
                    "nombre_producto": {"$first": "$producto_info.nombre_producto"},
                    "total_ingresos": {"$sum": 1},
                    "cantidad_total": {"$sum": "$cantidad_recibida"}
                }
            },
            {"$sort": {"cantidad_total": -1}},
            {"$limit": 10}
        ]
        
        cursor = ingresos_collection().aggregate(pipeline_productos)
        productos_mas_ingresados = await cursor.to_list(length=10)
        
        # Usar las funciones existentes para estadísticas específicas
        await actualizar_estadisticas_ingresos_crear()
        await actualizar_estadisticas_ingresos_validar()
        
        # Crear documento de estadísticas
        stats_doc = {
            "_id": "ingresos_stats",
            "estadisticas_periodo": stats.dict(),
            "ingresos_pendientes": ingresos_pendientes,
            "top_proveedores": top_proveedores,
            "productos_mas_ingresados": productos_mas_ingresados,
            "last_updated": datetime.now()
        }
        
        # Guardar en colección de estadísticas
        await stats_collection().update_one(
            {"_id": "ingresos_stats"},
            {"$set": stats_doc},
            upsert=True
        )
        
        return stats_doc
        
    except Exception as e:
        logger.error(f"Error actualizando estadísticas de ingresos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error actualizando estadísticas"
        )


async def procesar_ingresos_masivos(bulk_data: IngresoBulk, created_by: int, created_by_name: str):
    """Procesar múltiples ingresos"""
    try:
        resultados = []
        errores = []
        
        for i, ingreso_data in enumerate(bulk_data.ingresos):
            try:
                resultado = await crear_ingreso(ingreso_data, created_by, created_by_name)
                resultados.append({
                    "indice": i + 1,
                    "exito": True,
                    "numero_ingreso": resultado["numero_ingreso"],
                    "producto_nombre": resultado.get("producto_nombre", "N/A"),
                    "cantidad": ingreso_data.cantidad_recibida,
                    "costo_total": float(ingreso_data.cantidad_recibida * ingreso_data.costo_unitario),
                    "mensaje": "Ingreso creado exitosamente"
                })
            except HTTPException as he:
                errores.append({
                    "indice": i + 1,
                    "exito": False,
                    "error": he.detail,
                    "codigo_error": he.status_code,
                    "datos": {
                        "producto_id": ingreso_data.producto_id,
                        "proveedor": ingreso_data.proveedor_ingreso,
                        "cantidad": ingreso_data.cantidad_recibida
                    }
                })
                logger.error(f"Error HTTP procesando ingreso {i + 1}: {he.detail}")
            except Exception as e:
                errores.append({
                    "indice": i + 1,
                    "exito": False,
                    "error": str(e),
                    "codigo_error": 500,
                    "datos": {
                        "producto_id": ingreso_data.producto_id,
                        "proveedor": ingreso_data.proveedor_ingreso,
                        "cantidad": ingreso_data.cantidad_recibida
                    }
                })
                logger.error(f"Error procesando ingreso {i + 1}: {e}")
        
        # Calcular estadísticas del procesamiento
        total_procesados = len(bulk_data.ingresos)
        exitosos = len(resultados)
        con_errores = len(errores)
        
        # Calcular valores totales de los exitosos
        valor_total_procesado = sum([r["costo_total"] for r in resultados])
        cantidad_total_procesada = sum([r["cantidad"] for r in resultados])
        
        # Log de actividad para el lote
        await log_activity(
            action="INGRESOS_BULK_PROCESSED",
            module="ingresos",
            user_id=created_by,
            user_name=created_by_name,
            details={
                "total_procesados": total_procesados,
                "exitosos": exitosos,
                "errores": con_errores,
                "valor_total": valor_total_procesado,
                "cantidad_total": cantidad_total_procesada
            }
        )
        
        # Actualizar estadísticas después del procesamiento masivo
        await actualizar_estadisticas_ingresos_crear()
        
        return {
            "total_procesados": total_procesados,
            "exitosos": exitosos,
            "errores": con_errores,
            "porcentaje_exito": round((exitosos / total_procesados * 100), 2) if total_procesados > 0 else 0,
            "valor_total_procesado": valor_total_procesado,
            "cantidad_total_procesada": cantidad_total_procesada,
            "resultados": resultados,
            "errores_detalle": errores,
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Error procesando ingresos masivos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor procesando lote de ingresos"
        )


async def actualizar_ingreso(
    ingreso_id: int, 
    update_data: IngresoUpdate, 
    updated_by: int, 
    updated_by_name: str
):
    """Actualizar ingreso existente"""
    try:
        # Verificar que el ingreso existe y está en estado editable
        ingreso_actual = await ingresos_collection().find_one({
            "id_ingreso": ingreso_id,
            "estado_ingreso": 1
        })
        
        if not ingreso_actual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ingreso no encontrado"
            )
        
        if ingreso_actual["condicion_ingreso"] == 2:  # Validado
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede editar un ingreso ya validado"
            )
        
        # Preparar datos de actualización
        update_fields = {}
        
        # Solo actualizar campos que no sean None
        for field, value in update_data.dict(exclude_unset=True).items():
            if value is not None:
                update_fields[field] = value
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay campos para actualizar"
            )
        
        # Recalcular costo total si cambió cantidad o costo unitario
        if "cantidad_recibida" in update_fields or "costo_unitario" in update_fields:
            nueva_cantidad = update_fields.get("cantidad_recibida", ingreso_actual["cantidad_recibida"])
            nuevo_costo = update_fields.get("costo_unitario", ingreso_actual["costo_unitario"])
            update_fields["costo_total"] = float(nueva_cantidad * Decimal(str(nuevo_costo)))
        
        # Agregar metadatos de actualización
        update_fields["updated_at"] = datetime.now()
        update_fields["updated_by"] = updated_by
        update_fields["updated_by_name"] = updated_by_name
        
        if "cantidad_recibida" in update_fields or "costo_unitario" in update_fields:
            update_fields["condicion_ingreso"] = 3  # Cantidad modificada
        
        # Actualizar en base de datos
        await ingresos_collection().update_one(
            {"id_ingreso": ingreso_id},
            {"$set": update_fields}
        )
        
        # Obtener documento actualizado
        ingreso_actualizado = await ingresos_collection().find_one({"id_ingreso": ingreso_id})
        
        # Registrar en histórico
        await registrar_historico_ingreso(
            ingreso_actualizado,
            "ACTUALIZADO",
            updated_by,
            updated_by_name,
            detalles_cambio=update_fields
        )
        
        # Log de actividad
        await log_activity(
            action="INGRESO_UPDATED",
            module="ingresos",
            user_id=updated_by,
            user_name=updated_by_name,
            details={
                "numero_ingreso": ingreso_actualizado["numero_ingreso"],
                "campos_actualizados": list(update_fields.keys())
            }
        )
        
        logger.info(f"Ingreso actualizado: {ingreso_actualizado['numero_ingreso']}")
        
        # Obtener ingreso completo
        return await obtener_ingreso_por_id(ingreso_id)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando ingreso: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


async def procesar_ingresos_masivos(bulk_data: IngresoBulk, created_by: int, created_by_name: str):
    """Procesar múltiples ingresos"""
    try:
        resultados = []
        errores = []
        
        for i, ingreso_data in enumerate(bulk_data.ingresos):
            try:
                resultado = await crear_ingreso(ingreso_data, created_by, created_by_name)
                resultados.append({
                    "indice": i + 1,
                    "exito": True,
                    "numero_ingreso": resultado["numero_ingreso"],
                    "producto_nombre": resultado.get("producto_nombre", "N/A"),
                    "cantidad": ingreso_data.cantidad_recibida,
                    "costo_total": float(ingreso_data.cantidad_recibida * ingreso_data.costo_unitario),
                    "mensaje": "Ingreso creado exitosamente"
                })
            except HTTPException as he:
                errores.append({
                    "indice": i + 1,
                    "exito": False,
                    "error": he.detail,
                    "codigo_error": he.status_code,
                    "datos": {
                        "producto_id": ingreso_data.producto_id,
                        "proveedor": ingreso_data.proveedor_ingreso,
                        "cantidad": ingreso_data.cantidad_recibida
                    }
                })
                logger.error(f"Error HTTP procesando ingreso {i + 1}: {he.detail}")
            except Exception as e:
                errores.append({
                    "indice": i + 1,
                    "exito": False,
                    "error": str(e),
                    "codigo_error": 500,
                    "datos": {
                        "producto_id": ingreso_data.producto_id,
                        "proveedor": ingreso_data.proveedor_ingreso,
                        "cantidad": ingreso_data.cantidad_recibida
                    }
                })
                logger.error(f"Error procesando ingreso {i + 1}: {e}")
        
        # Calcular estadísticas del procesamiento
        total_procesados = len(bulk_data.ingresos)
        exitosos = len(resultados)
        con_errores = len(errores)
        
        # Calcular valores totales de los exitosos
        valor_total_procesado = sum([r["costo_total"] for r in resultados])
        cantidad_total_procesada = sum([r["cantidad"] for r in resultados])
        
        # Log de actividad para el lote
        await log_activity(
            action="INGRESOS_BULK_PROCESSED",
            module="ingresos",
            user_id=created_by,
            user_name=created_by_name,
            details={
                "total_procesados": total_procesados,
                "exitosos": exitosos,
                "errores": con_errores,
                "valor_total": valor_total_procesado,
                "cantidad_total": cantidad_total_procesada
            }
        )
        
        # Actualizar contador de operaciones masivas
        await contador_general("ingresos", 7)  # 7 = procesado masivo
        
        return {
            "total_procesados": total_procesados,
            "exitosos": exitosos,
            "errores": con_errores,
            "porcentaje_exito": round((exitosos / total_procesados * 100), 2) if total_procesados > 0 else 0,
            "valor_total_procesado": valor_total_procesado,
            "cantidad_total_procesada": cantidad_total_procesada,
            "resultados": resultados,
            "errores_detalle": errores,
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        logger.error(f"Error procesando ingresos masivos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor procesando lote de ingresos"
        )


async def generar_template_excel():
    """Generar template Excel para carga masiva"""
    try:
        # Estructura del template
        template_data = {
            'codigo_producto': ['PRD-001', 'PRD-002'],
            'cantidad_solicitada': [10, 25],
            'costo_unitario': [15.50, 8.75],
            'proveedor_ingreso': ['Proveedor A', 'Proveedor B'],
            'factura_ingreso': ['FAC-001', 'FAC-002'],
            'orden_compra': ['OC-001', 'OC-002'],
            'lote_serie': ['LOTE001', ''],
            'fecha_vencimiento': ['2025-12-31', ''],
            'ubicacion_asignada': ['A1-B2', 'C1-D2'],
            'documento_ingreso': ['DOC001', ''],
            'observaciones': ['Ingreso normal', 'Revisar calidad']
        }
        
        df = pd.DataFrame(template_data)
        
        # Crear Excel en memoria
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Ingresos', index=False)
            
            # Obtener worksheet para formato
            worksheet = writer.sheets['Ingresos']
            
            # Ajustar ancho de columnas
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)
                worksheet.column_dimensions[column_letter].width = adjusted_width
        
        output.seek(0)
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"Error generando template Excel: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generando template Excel"
        )