# backend/app/server/functions/stock.py
from fastapi import HTTPException, status
from server.config.database import (
    stock_collection,
    productos_collection,
    log_activity
)
from server.models.stock import StockAdjust, StockAlert, StockValuation
from datetime import datetime, date, timedelta
from typing import List, Optional
import logging
import math
from server.config.database import stats_collection


logger = logging.getLogger(__name__)

async def obtener_stock(page: int = 1, limit: int = 20, stock_bajo: bool = False, stock_critico: bool = False):
    """Obtener stock con paginación y filtros"""
    try:
        # Construir pipeline de agregación
        pipeline = [
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
                "$match": {
                    "estado_stock": 1,
                    "producto_info.estado_producto": 1
                }
            }
        ]
        
        # Agregar filtros específicos
        if stock_bajo:
            pipeline.append({
                "$match": {
                    "$expr": {
                        "$lte": ["$cantidad_total", "$producto_info.stock_minimo"]
                    }
                }
            })
        
        if stock_critico:
            pipeline.append({
                "$match": {
                    "$expr": {
                        "$lte": ["$cantidad_total", "$producto_info.stock_critico"]
                    }
                }
            })
        
        # Proyección final
        pipeline.extend([
            {
                "$project": {
                    "id_stock": 1,
                    "producto_id": 1,
                    "producto_codigo": 1,
                    "producto_nombre": 1,
                    "cantidad_disponible": 1,
                    "cantidad_reservada": 1,
                    "cantidad_total": 1,
                    "ubicacion_fisica": 1,
                    "lote_serie": 1,
                    "fecha_vencimiento": 1,
                    "costo_promedio": 1,
                    "valor_inventario": 1,
                    "fecha_ultimo_movimiento": 1,
                    "alerta_generada": 1,
                    "stock_minimo": "$producto_info.stock_minimo",
                    "stock_critico": "$producto_info.stock_critico",
                    "magnitud": "$producto_info.magnitud_producto",
                    "_id": 0
                }
            },
            {"$sort": {"producto_nombre": 1}}
        ])
        
        # Obtener total de registros
        count_pipeline = pipeline.copy()
        count_pipeline.append({"$count": "total"})
        
        count_result = await stock_collection().aggregate(count_pipeline).to_list(length=1)
        total = count_result[0]["total"] if count_result else 0
        
        # Agregar paginación
        skip = (page - 1) * limit
        pipeline.extend([
            {"$skip": skip},
            {"$limit": limit}
        ])
        
        # Ejecutar consulta
        cursor = stock_collection().aggregate(pipeline)
        stock_data = await cursor.to_list(length=limit)
        
        # Calcular paginación
        pages = math.ceil(total / limit) if total > 0 else 0


        stats = await obtener_stats_stock()

        return {
            "data": {
                "stock" : stock_data,
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
        logger.error(f"Error obteniendo stock: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_stock_por_producto(product_id: int):
    """Obtener stock específico de un producto"""
    try:
        pipeline = [
            {"$match": {"producto_id": product_id, "estado_stock": 1}},
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
                "$project": {
                    "id_stock": 1,
                    "producto_id": 1,
                    "producto_codigo": 1,
                    "producto_nombre": 1,
                    "cantidad_disponible": 1,
                    "cantidad_reservada": 1,
                    "cantidad_total": 1,
                    "ubicacion_fisica": 1,
                    "lote_serie": 1,
                    "fecha_vencimiento": 1,
                    "costo_promedio": 1,
                    "valor_inventario": 1,
                    "fecha_ultimo_movimiento": 1,
                    "alerta_generada": 1,
                    "stock_minimo": "$producto_info.stock_minimo",
                    "stock_critico": "$producto_info.stock_critico",
                    "magnitud": "$producto_info.magnitud_producto",
                    "_id": 0
                }
            }
        ]
        
        cursor = stock_collection().aggregate(pipeline)
        stock_data = await cursor.to_list(length=1)
        
        if not stock_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stock no encontrado para el producto"
            )
        
        return stock_data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo stock por producto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def ajustar_stock(adjustment_data: StockAdjust, adjusted_by: int, adjusted_by_name: str):
    """Realizar ajuste de stock"""
    try:
        # Verificar que producto existe
        producto = await productos_collection().find_one({
            "id_producto": adjustment_data.producto_id,
            "estado_producto": 1
        })
        
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        # Obtener stock actual
        stock_actual = await stock_collection().find_one({
            "producto_id": adjustment_data.producto_id,
            "estado_stock": 1
        })
        
        if not stock_actual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stock no encontrado para el producto"
            )
        
        # Calcular nuevas cantidades
        cantidad_anterior = stock_actual["cantidad_total"]
        nueva_cantidad = cantidad_anterior + adjustment_data.cantidad_ajuste
        
        # Validar que no quede negativo
        if nueva_cantidad < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El ajuste resultaría en stock negativo"
            )
        
        # Actualizar stock
        update_data = {
            "cantidad_total": nueva_cantidad,
            "cantidad_disponible": nueva_cantidad - stock_actual["cantidad_reservada"],
            "fecha_ultimo_movimiento": datetime.now(),
            "updated_at": datetime.now(),
            "updated_by": adjusted_by,
            "updated_by_name": adjusted_by_name
        }
        
        # Actualizar ubicación si se proporciona
        if adjustment_data.ubicacion:
            update_data["ubicacion_fisica"] = adjustment_data.ubicacion
        
        # Actualizar lote/serie si se proporciona
        if adjustment_data.lote_serie:
            update_data["lote_serie"] = adjustment_data.lote_serie
        
        # Calcular valor de inventario
        costo_promedio = stock_actual.get("costo_promedio", 0)
        update_data["valor_inventario"] = nueva_cantidad * costo_promedio
        
        await stock_collection().update_one(
            {"producto_id": adjustment_data.producto_id},
            {"$set": update_data}
        )
        
        # TODO: Registrar en kardex (se implementará en Fase 2)
        
        # Log de actividad
        await log_activity(
            action="STOCK_ADJUSTED",
            module="stock",
            user_id=adjusted_by,
            user_name=adjusted_by_name,
            details={
                "producto_id": adjustment_data.producto_id,
                "cantidad_anterior": cantidad_anterior,
                "cantidad_ajuste": adjustment_data.cantidad_ajuste,
                "cantidad_nueva": nueva_cantidad,
                "motivo": adjustment_data.motivo
            }
        )
        
        # Verificar si necesita generar alertas
        await verificar_alertas_stock(adjustment_data.producto_id, producto)
        
        logger.info(f"Stock ajustado para producto {adjustment_data.producto_id}: {adjustment_data.cantidad_ajuste}")
        
        # Obtener stock actualizado
        stock_actualizado = await obtener_stock_por_producto(adjustment_data.producto_id)
        
        return stock_actualizado
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ajustando stock: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_alertas_stock() -> List[StockAlert]:
    """Obtener alertas de stock bajo/crítico"""
    try:
        pipeline = [
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
                "$match": {
                    "estado_stock": 1,
                    "producto_info.estado_producto": 1,
                    "$or": [
                        {
                            "$expr": {
                                "$lte": ["$cantidad_total", "$producto_info.stock_critico"]
                            }
                        },
                        {
                            "$expr": {
                                "$lte": ["$cantidad_total", "$producto_info.stock_minimo"]
                            }
                        }
                    ]
                }
            },
            {
                "$project": {
                    "producto_id": 1,
                    "producto_codigo": 1,
                    "producto_nombre": 1,
                    "cantidad_actual": "$cantidad_total",
                    "stock_minimo": "$producto_info.stock_minimo",
                    "stock_critico": "$producto_info.stock_critico",
                    "fecha_vencimiento": 1,
                    "_id": 0
                }
            }
        ]
        
        cursor = stock_collection().aggregate(pipeline)
        stock_data = await cursor.to_list(length=None)
        
        alertas = []
        fecha_actual = datetime.now()
        
        for item in stock_data:
            # Determinar tipo de alerta
            if item["cantidad_actual"] <= item["stock_critico"]:
                tipo_alerta = "critico"
                urgencia = "critica"
            elif item["cantidad_actual"] <= item["stock_minimo"]:
                tipo_alerta = "bajo"
                urgencia = "alta"
            else:
                continue
            
            # Verificar vencimiento próximo
            if item.get("fecha_vencimiento"):
                dias_para_vencer = (item["fecha_vencimiento"] - fecha_actual.date()).days
                if dias_para_vencer <= 30:
                    tipo_alerta = "vencimiento"
                    urgencia = "media" if dias_para_vencer > 7 else "alta"
            
            alerta = StockAlert(
                producto_id=item["producto_id"],
                producto_codigo=item["producto_codigo"],
                producto_nombre=item["producto_nombre"],
                cantidad_actual=item["cantidad_actual"],
                stock_minimo=item["stock_minimo"],
                stock_critico=item["stock_critico"],
                tipo_alerta=tipo_alerta,
                urgencia=urgencia,
                fecha_alerta=fecha_actual
            )
            
            alertas.append(alerta)
        
        return alertas
        
    except Exception as e:
        logger.error(f"Error obteniendo alertas de stock: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def calcular_valoracion_inventario() -> StockValuation:
    """Calcular valorización total del inventario"""
    try:
        pipeline = [
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
                "$match": {
                    "estado_stock": 1,
                    "producto_info.estado_producto": 1
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_productos": {"$sum": 1},
                    "valor_total_inventario": {"$sum": "$valor_inventario"},
                    "productos_stock_bajo": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$lte": ["$cantidad_total", "$producto_info.stock_minimo"]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    "productos_stock_critico": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$lte": ["$cantidad_total", "$producto_info.stock_critico"]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    "productos_sin_stock": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$cantidad_total", 0]},
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]
        
        cursor = stock_collection().aggregate(pipeline)
        result = await cursor.to_list(length=1)
        
        if not result:
            return StockValuation(
                total_productos=0,
                valor_total_inventario=0.0,
                productos_stock_bajo=0,
                productos_stock_critico=0,
                productos_sin_stock=0,
                productos_vencidos=0,
                productos_por_vencer=0,
                fecha_calculo=datetime.now()
            )
        
        data = result[0]
        
        # Calcular productos vencidos y por vencer
        fecha_actual = date.today()
        fecha_limite = fecha_actual + timedelta(days=30)
        
        vencimientos = await stock_collection().aggregate([
            {
                "$match": {
                    "estado_stock": 1,
                    "fecha_vencimiento": {"$ne": None}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "productos_vencidos": {
                        "$sum": {
                            "$cond": [
                                {"$lt": ["$fecha_vencimiento", fecha_actual]},
                                1,
                                0
                            ]
                        }
                    },
                    "productos_por_vencer": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$and": [
                                        {"$gte": ["$fecha_vencimiento", fecha_actual]},
                                        {"$lte": ["$fecha_vencimiento", fecha_limite]}
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]).to_list(length=1)
        
        vencimientos_data = vencimientos[0] if vencimientos else {}
        
        return StockValuation(
            total_productos=data["total_productos"],
            valor_total_inventario=data["valor_total_inventario"],
            productos_stock_bajo=data["productos_stock_bajo"],
            productos_stock_critico=data["productos_stock_critico"],
            productos_sin_stock=data["productos_sin_stock"],
            productos_vencidos=vencimientos_data.get("productos_vencidos", 0),
            productos_por_vencer=vencimientos_data.get("productos_por_vencer", 0),
            fecha_calculo=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error calculando valorización: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def verificar_alertas_stock(producto_id: int, producto_info: dict):
    """Verificar y actualizar alertas para un producto específico"""
    try:
        stock = await stock_collection().find_one({
            "producto_id": producto_id,
            "estado_stock": 1
        })
        
        if not stock:
            return
        
        # Determinar si necesita alerta
        necesita_alerta = (
            stock["cantidad_total"] <= producto_info["stock_critico"] or
            stock["cantidad_total"] <= producto_info["stock_minimo"]
        )
        
        # Actualizar flag de alerta si cambió
        if stock["alerta_generada"] != necesita_alerta:
            await stock_collection().update_one(
                {"producto_id": producto_id},
                {"$set": {"alerta_generada": necesita_alerta}}
            )
            
            logger.info(f"Alerta {'activada' if necesita_alerta else 'desactivada'} para producto {producto_id}")
        
    except Exception as e:
        logger.error(f"Error verificando alertas: {e}")

async def obtener_movimientos_stock(producto_id: Optional[int] = None, limit: int = 50):
    """Obtener histórico de movimientos de stock"""
    # TODO: Implementar cuando se tenga el módulo kardex en Fase 2
    # Por ahora retorna lista vacía
    return []


async def obtener_estadistica_stock():
    stats = await stats_collection().find_one({"_id": "stock_stats"}, {"_id": 0})
    return stats


async def actualizar_stock_stats():
    """Recalcular estadísticas completas y guardarlas en DB"""
    stats = await obtener_stats_stock()  # tu función actual con agregaciones
    await stats_collection().update_one(
        {"_id": "stock_stats"},
        {"$set": {**stats, "last_updated": datetime.now()}},
        upsert=True
    )
    return stats

async def obtener_stats_stock():
    """Recalcular todas las estadísticas y guardarlas en la colección stats"""
    try:
        total_productos = await productos_collection().count_documents({"estado_producto": 1})
        productos_con_stock = await stock_collection().count_documents({"estado_stock": 1, "cantidad_total": {"$gt": 0}})
        productos_stock_bajo = await stock_collection().count_documents({"estado_stock": 1, "cantidad_total": {"$gt": 0, "$lte": 5}})
        productos_stock_critico = await stock_collection().count_documents({"estado_stock": 1, "cantidad_total": {"$lte": 2}})
        productos_sin_stock = await stock_collection().count_documents({"estado_stock": 1, "cantidad_total": 0})

        # Valor inventario total
        pipeline_valor = [
            {"$match": {"estado_stock": 1}},
            {"$group": {"_id": None, "total": {"$sum": "$valor_inventario"}}}
        ]
        valor_data = await stock_collection().aggregate(pipeline_valor).to_list(length=1)
        valor_total_inventario = valor_data[0]["total"] if valor_data else 0.0

        # Productos con movimiento hoy
        hoy = datetime.combine(datetime.today(), datetime.min.time())  # ✅ datetime, no date
        productos_con_movimiento_hoy = await stock_collection().count_documents({
            "estado_stock": 1,
            "fecha_ultimo_movimiento": {"$gte": hoy}
        })

        # Vencimientos
        fecha_actual = datetime.combine(datetime.today(), datetime.min.time())   # ✅ datetime
        fecha_limite = fecha_actual + timedelta(days=30)
        proximos_vencer = await stock_collection().count_documents({
            "estado_stock": 1,
            "fecha_vencimiento": {"$gte": fecha_actual, "$lte": fecha_limite}
        })

        stats_doc = {
            "_id": "stock_stats",
            "total_productos": total_productos,
            "productos_con_stock": productos_con_stock,
            "productos_stock_bajo": productos_stock_bajo,
            "productos_stock_critico": productos_stock_critico,
            "productos_sin_stock": productos_sin_stock,
            "valor_total_inventario": valor_total_inventario,
            "productos_con_movimiento_hoy": productos_con_movimiento_hoy,
            "productos_vencimiento_proximo": proximos_vencer,
            "rotacion_promedio": 0,  # ⚠️ pendiente kardex
            "last_updated": datetime.now()
        }

        await stats_collection().update_one({"_id": "stock_stats"}, {"$set": stats_doc}, upsert=True)
        return stats_doc
    except Exception as e:
        logger.error(f"Error recalculando stats: {e}")
        raise HTTPException(status_code=500, detail="Error recalculando estadísticas")
