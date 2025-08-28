# backend/app/server/functions/kardex.py
from fastapi import HTTPException, status
from server.config.database import (
    kardex_collection,
    productos_collection,
    stock_collection,
    stats_collection,
    ids_collection,
    log_activity
)
from server.models.kardex import KardexCreate, KardexQuery, KardexSummary, KardexBalance
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from decimal import Decimal
import logging
import math

logger = logging.getLogger(__name__)

async def generar_numero_movimiento() -> str:
    """Generar número único para movimiento de kardex"""
    try:
        # Obtener contador de kardex
        contador = await ids_collection().find_one({"_id": "kardex_counter"})
        
        if not contador:
            # Crear contador inicial
            nuevo_numero = 1
            await ids_collection().insert_one({
                "_id": "kardex_counter",
                "sequence_value": nuevo_numero,
                "created_at": datetime.now()
            })
        else:
            # Incrementar contador
            nuevo_numero = contador["sequence_value"] + 1
            await ids_collection().update_one(
                {"_id": "kardex_counter"},
                {
                    "$set": {
                        "sequence_value": nuevo_numero,
                        "updated_at": datetime.now()
                    }
                }
            )
        
        # Formatear número con fecha
        fecha_str = datetime.now().strftime("%Y%m%d")
        numero_movimiento = f"KDX-{fecha_str}-{nuevo_numero:06d}"
        
        return numero_movimiento
        
    except Exception as e:
        logger.error(f"Error generando número de movimiento: {e}")
        raise

async def registrar_movimiento_kardex(
    kardex_data: KardexCreate,
    realizado_por: int,
    realizado_por_name: str,
    autorizado_por: Optional[int] = None,
    autorizado_por_name: Optional[str] = None
) -> Dict[str, Any]:
    """Registrar movimiento en el kardex"""
    try:
        # Verificar que el producto existe
        producto = await productos_collection().find_one({
            "id_producto": kardex_data.producto_id,
            "estado_producto": 1
        })
        
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        # Obtener stock actual
        stock_actual = await stock_collection().find_one({
            "producto_id": kardex_data.producto_id,
            "estado_stock": 1
        })
        
        if not stock_actual:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stock no encontrado para el producto"
            )
        
        cantidad_anterior = Decimal(str(stock_actual["cantidad_total"]))
        cantidad_movimiento = kardex_data.cantidad_movimiento
        
        # Calcular nueva cantidad según tipo de operación
        if kardex_data.operacion_kardex in ["INGRESO", "DEVOLUCION", "AJUSTE_POSITIVO"]:
            cantidad_actual = cantidad_anterior + cantidad_movimiento
        elif kardex_data.operacion_kardex in ["SALIDA", "AJUSTE_NEGATIVO"]:
            cantidad_actual = cantidad_anterior - cantidad_movimiento
            # Validar que no quede negativo para salidas normales
            if cantidad_actual < 0 and kardex_data.operacion_kardex == "SALIDA":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Stock insuficiente para la operación"
                )
        else:  # TRANSFERENCIA
            cantidad_actual = cantidad_anterior  # Para transferencias no cambia el total
        
        # Generar ID y número de movimiento
        contador_kardex = await ids_collection().find_one({"id_kardex": {"$exists": True}})
        id_kardex = (contador_kardex["id_kardex"] + 1) if contador_kardex else 1
        numero_movimiento = await generar_numero_movimiento()
        
        # Calcular costos
        costo_unitario = kardex_data.costo_unitario or stock_actual.get("costo_promedio", Decimal("0"))
        costo_total = cantidad_movimiento * costo_unitario
        
        # Crear registro de kardex
        kardex_documento = {
            "id_kardex": id_kardex,
            "numero_movimiento": numero_movimiento,
            "producto_id": kardex_data.producto_id,
            "producto_codigo": producto["codigo_producto"],
            "producto_nombre": producto["nombre_producto"],
            "lote_serie": kardex_data.lote_serie,
            "ubicacion": kardex_data.ubicacion,
            "operacion_kardex": kardex_data.operacion_kardex,
            "tipo_movimiento": kardex_data.tipo_movimiento,
            "documento_referencia": kardex_data.documento_referencia,
            "numero_documento": kardex_data.numero_documento,
            "cantidad_anterior": float(cantidad_anterior),
            "cantidad_movimiento": float(cantidad_movimiento),
            "cantidad_actual": float(cantidad_actual),
            "costo_unitario": float(costo_unitario),
            "costo_total": float(costo_total),
            "motivo_movimiento": kardex_data.motivo_movimiento,
            "solicitud_id": kardex_data.solicitud_id,
            "ot_numero": kardex_data.ot_numero,
            "ingreso_id": kardex_data.ingreso_id,
            "estado_kardex": 1,
            "fecha_movimiento": datetime.now(),
            "realizado_por": realizado_por,
            "realizado_por_name": realizado_por_name,
            "autorizado_por": autorizado_por,
            "autorizado_por_name": autorizado_por_name,
            "created_at": datetime.now(),
            "created_by": realizado_por,
            "created_by_name": realizado_por_name
        }
        
        # Insertar en kardex
        await kardex_collection().insert_one(kardex_documento)
        
        # Actualizar contador de IDs
        await ids_collection().update_one(
            {"_id": contador_kardex["_id"] if contador_kardex else None},
            {
                "$set": {
                    "id_kardex": id_kardex,
                    "fecha": datetime.now()
                }
            },
            upsert=True
        )
        
        # Log de actividad
        await log_activity(
            action=f"KARDEX_{kardex_data.operacion_kardex}",
            module="kardex",
            user_id=realizado_por,
            user_name=realizado_por_name,
            details={
                "numero_movimiento": numero_movimiento,
                "producto_id": kardex_data.producto_id,
                "cantidad_movimiento": float(cantidad_movimiento),
                "operacion": kardex_data.operacion_kardex
            }
        )
        
        logger.info(f"Movimiento kardex registrado: {numero_movimiento}")
        
        return {
            "id_kardex": id_kardex,
            "numero_movimiento": numero_movimiento,
            "cantidad_anterior": float(cantidad_anterior),
            "cantidad_actual": float(cantidad_actual),
            "cantidad_movimiento": float(cantidad_movimiento)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registrando movimiento kardex: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_kardex(query: KardexQuery):
    """Obtener movimientos del kardex con filtros"""
    try:
        # Construir filtros
        match_conditions = {"estado_kardex": 1}
        
        if query.producto_id:
            match_conditions["producto_id"] = query.producto_id
        
        if query.operacion_kardex:
            match_conditions["operacion_kardex"] = query.operacion_kardex
        
        if query.tipo_movimiento:
            match_conditions["tipo_movimiento"] = query.tipo_movimiento
        
        if query.solicitud_id:
            match_conditions["solicitud_id"] = query.solicitud_id
        
        if query.ot_numero:
            match_conditions["ot_numero"] = query.ot_numero
        
        # Filtro de fechas
        if query.fecha_inicio or query.fecha_fin:
            date_filter = {}
            if query.fecha_inicio:
                date_filter["$gte"] = query.fecha_inicio
            if query.fecha_fin:
                # Agregar un día para incluir todo el día final
                fecha_fin_completa = datetime.combine(query.fecha_fin.date(), datetime.max.time())
                date_filter["$lte"] = fecha_fin_completa
            match_conditions["fecha_movimiento"] = date_filter
        
        # Pipeline de agregación
        pipeline = [
            {"$match": match_conditions},
            {"$sort": {"fecha_movimiento": -1, "id_kardex": -1}}
        ]
        
        # Obtener total de registros
        count_pipeline = pipeline.copy()
        count_pipeline.append({"$count": "total"})
        
        count_result = await kardex_collection().aggregate(count_pipeline).to_list(length=1)
        total = count_result[0]["total"] if count_result else 0
        
        # Agregar paginación
        skip = (query.page - 1) * query.limit
        pipeline.extend([
            {"$skip": skip},
            {"$limit": query.limit},
            {
                "$project": {
                    "_id": 0,
                    "id_kardex": 1,
                    "numero_movimiento": 1,
                    "producto_id": 1,
                    "producto_codigo": 1,
                    "producto_nombre": 1,
                    "lote_serie": 1,
                    "ubicacion": 1,
                    "operacion_kardex": 1,
                    "tipo_movimiento": 1,
                    "documento_referencia": 1,
                    "numero_documento": 1,
                    "cantidad_anterior": 1,
                    "cantidad_movimiento": 1,
                    "cantidad_actual": 1,
                    "costo_unitario": 1,
                    "costo_total": 1,
                    "motivo_movimiento": 1,
                    "solicitud_id": 1,
                    "ot_numero": 1,
                    "ingreso_id": 1,
                    "fecha_movimiento": 1,
                    "realizado_por_name": 1,
                    "autorizado_por_name": 1
                }
            }
        ])
        
        # Ejecutar consulta
        cursor = kardex_collection().aggregate(pipeline)
        movimientos = await cursor.to_list(length=query.limit)
        
        # Calcular paginación
        pages = math.ceil(total / query.limit) if total > 0 else 0
        
        return {
            "data": movimientos,
            "total": total,
            "page": query.page,
            "limit": query.limit,
            "pages": pages,
            "has_next": query.page < pages,
            "has_prev": query.page > 1
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo kardex: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_movimientos_por_producto(producto_id: int, limit: int = 50):
    """Obtener últimos movimientos de un producto específico"""
    try:
        pipeline = [
            {
                "$match": {
                    "producto_id": producto_id,
                    "estado_kardex": 1
                }
            },
            {"$sort": {"fecha_movimiento": -1}},
            {"$limit": limit},
            {
                "$project": {
                    "_id": 0,
                    "numero_movimiento": 1,
                    "operacion_kardex": 1,
                    "tipo_movimiento": 1,
                    "cantidad_anterior": 1,
                    "cantidad_movimiento": 1,
                    "cantidad_actual": 1,
                    "costo_unitario": 1,
                    "costo_total": 1,
                    "motivo_movimiento": 1,
                    "fecha_movimiento": 1,
                    "realizado_por_name": 1,
                    "documento_referencia": 1,
                    "numero_documento": 1
                }
            }
        ]
        
        cursor = kardex_collection().aggregate(pipeline)
        movimientos = await cursor.to_list(length=limit)
        
        return movimientos
        
    except Exception as e:
        logger.error(f"Error obteniendo movimientos del producto {producto_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def calcular_resumen_kardex(fecha_inicio: Optional[datetime] = None, fecha_fin: Optional[datetime] = None) -> KardexSummary:
    """Calcular resumen de movimientos del kardex"""
    try:
        # Definir período por defecto (último mes)
        if not fecha_inicio:
            fecha_inicio = datetime.now() - timedelta(days=30)
        if not fecha_fin:
            fecha_fin = datetime.now()
        
        # Pipeline de agregación
        pipeline = [
            {
                "$match": {
                    "estado_kardex": 1,
                    "fecha_movimiento": {
                        "$gte": fecha_inicio,
                        "$lte": fecha_fin
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_movimientos": {"$sum": 1},
                    "total_ingresos": {
                        "$sum": {
                            "$cond": [
                                {"$in": ["$operacion_kardex", ["INGRESO", "DEVOLUCION", "AJUSTE_POSITIVO"]]},
                                1,
                                0
                            ]
                        }
                    },
                    "total_salidas": {
                        "$sum": {
                            "$cond": [
                                {"$in": ["$operacion_kardex", ["SALIDA", "AJUSTE_NEGATIVO"]]},
                                1,
                                0
                            ]
                        }
                    },
                    "total_devoluciones": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$operacion_kardex", "DEVOLUCION"]},
                                1,
                                0
                            ]
                        }
                    },
                    "valor_total_movimientos": {"$sum": "$costo_total"},
                    "productos_con_movimiento": {"$addToSet": "$producto_id"}
                }
            },
            {
                "$project": {
                    "total_movimientos": 1,
                    "total_ingresos": 1,
                    "total_salidas": 1,
                    "total_devoluciones": 1,
                    "valor_total_movimientos": 1,
                    "productos_con_movimiento": {"$size": "$productos_con_movimiento"}
                }
            }
        ]
        
        cursor = kardex_collection().aggregate(pipeline)
        result = await cursor.to_list(length=1)
        
        if not result:
            return KardexSummary(
                total_movimientos=0,
                total_ingresos=0,
                total_salidas=0,
                total_devoluciones=0,
                valor_total_movimientos=Decimal("0"),
                productos_con_movimiento=0,
                periodo_inicio=fecha_inicio,
                periodo_fin=fecha_fin
            )
        
        data = result[0]
        
        return KardexSummary(
            total_movimientos=data["total_movimientos"],
            total_ingresos=data["total_ingresos"],
            total_salidas=data["total_salidas"],
            total_devoluciones=data["total_devoluciones"],
            valor_total_movimientos=Decimal(str(data["valor_total_movimientos"])),
            productos_con_movimiento=data["productos_con_movimiento"],
            periodo_inicio=fecha_inicio,
            periodo_fin=fecha_fin
        )
        
    except Exception as e:
        logger.error(f"Error calculando resumen kardex: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def calcular_balance_kardex(producto_id: Optional[int] = None) -> List[KardexBalance]:
    """Calcular balance de kardex vs stock del sistema"""
    try:
        # Definir filtro de producto
        match_filter = {"estado_kardex": 1}
        if producto_id:
            match_filter["producto_id"] = producto_id
        
        # Pipeline para calcular movimientos por producto
        pipeline = [
            {"$match": match_filter},
            {
                "$group": {
                    "_id": "$producto_id",
                    "producto_codigo": {"$first": "$producto_codigo"},
                    "producto_nombre": {"$first": "$producto_nombre"},
                    "movimientos": {"$push": "$ROOT"}
                }
            },
            {
                "$lookup": {
                    "from": "stock",
                    "localField": "_id",
                    "foreignField": "producto_id",
                    "as": "stock_info"
                }
            },
            {"$unwind": {"path": "$stock_info", "preserveNullAndEmptyArrays": True}}
        ]
        
        cursor = kardex_collection().aggregate(pipeline)
        productos_data = await cursor.to_list(length=None)
        
        balances = []
        
        for producto_data in productos_data:
            producto_id_actual = producto_data["_id"]
            movimientos = producto_data["movimientos"]
            stock_info = producto_data.get("stock_info", {})
            
            # Calcular totales por tipo de operación
            total_ingresos = Decimal("0")
            total_salidas = Decimal("0")
            total_ajustes = Decimal("0")
            stock_inicial = Decimal("0")  # TODO: Implementar cálculo de stock inicial
            
            for mov in movimientos:
                cantidad = Decimal(str(mov["cantidad_movimiento"]))
                
                if mov["operacion_kardex"] in ["INGRESO", "DEVOLUCION"]:
                    total_ingresos += cantidad
                elif mov["operacion_kardex"] == "SALIDA":
                    total_salidas += cantidad
                elif mov["operacion_kardex"] in ["AJUSTE_POSITIVO", "AJUSTE_NEGATIVO"]:
                    if mov["operacion_kardex"] == "AJUSTE_POSITIVO":
                        total_ajustes += cantidad
                    else:
                        total_ajustes -= cantidad
            
            # Calcular stock según kardex
            stock_calculado = stock_inicial + total_ingresos - total_salidas + total_ajustes
            
            # Stock del sistema
            stock_sistema = Decimal(str(stock_info.get("cantidad_total", 0)))
            
            # Calcular diferencia
            diferencia = stock_sistema - stock_calculado
            
            balance = KardexBalance(
                producto_id=producto_id_actual,
                producto_codigo=producto_data["producto_codigo"],
                producto_nombre=producto_data["producto_nombre"],
                stock_inicial=stock_inicial,
                total_ingresos=total_ingresos,
                total_salidas=total_salidas,
                total_ajustes=total_ajustes,
                stock_calculado=stock_calculado,
                stock_sistema=stock_sistema,
                diferencia=diferencia,
                fecha_calculo=datetime.now()
            )
            
            balances.append(balance)
        
        return balances
        
    except Exception as e:
        logger.error(f"Error calculando balance kardex: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

async def obtener_estadisticas_kardex():
    """Obtener estadísticas del kardex desde la colección stats"""
    try:
        stats = await stats_collection().find_one({"_id": "kardex_stats"}, {"_id": 0})
        return stats
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas kardex: {e}")
        return None

async def actualizar_estadisticas_kardex():
    """Recalcular y actualizar estadísticas del kardex"""
    try:
        # Obtener fecha actual y hace 30 días
        fecha_actual = datetime.now()
        hace_30_dias = fecha_actual - timedelta(days=30)
        
        # Calcular estadísticas generales
        total_movimientos = await kardex_collection().count_documents({"estado_kardex": 1})
        movimientos_hoy = await kardex_collection().count_documents({
            "estado_kardex": 1,
            "fecha_movimiento": {
                "$gte": datetime.combine(fecha_actual.date(), datetime.min.time()),
                "$lt": fecha_actual
            }
        })
        
        # Calcular resumen del último mes
        resumen_mes = await calcular_resumen_kardex(hace_30_dias, fecha_actual)
        
        # Pipeline para productos más movidos
        pipeline_productos_movidos = [
            {"$match": {"estado_kardex": 1}},
            {
                "$group": {
                    "_id": "$producto_id",
                    "producto_codigo": {"$first": "$producto_codigo"},
                    "producto_nombre": {"$first": "$producto_nombre"},
                    "total_movimientos": {"$sum": 1}
                }
            },
            {"$sort": {"total_movimientos": -1}},
            {"$limit": 10}
        ]
        
        cursor = kardex_collection().aggregate(pipeline_productos_movidos)
        productos_mas_movidos = await cursor.to_list(length=10)
        
        # Crear documento de estadísticas
        stats_doc = {
            "_id": "kardex_stats",
            "total_movimientos": total_movimientos,
            "movimientos_hoy": movimientos_hoy,
            "resumen_ultimo_mes": resumen_mes.dict(),
            "productos_mas_movidos": productos_mas_movidos,
            "last_updated": fecha_actual
        }
        
        # Guardar en colección de estadísticas
        await stats_collection().update_one(
            {"_id": "kardex_stats"},
            {"$set": stats_doc},
            upsert=True
        )
        
        return stats_doc
        
    except Exception as e:
        logger.error(f"Error actualizando estadísticas kardex: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error actualizando estadísticas"
        )