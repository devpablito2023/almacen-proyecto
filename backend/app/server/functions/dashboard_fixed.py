# backend/app/server/functions/dashboard.py
from server.config.database import (
    productos_collection, 
    stock_collection, 
    usuarios_collection,
    log_collection,
    get_collection
)
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

async def obtener_total_productos():
    """Obtener total de productos en el sistema"""
    try:
        total = await productos_collection().count_documents({})
        return total
        
    except Exception as e:
        logger.error(f"Error obteniendo total de productos: {e}")
        return 0

async def obtener_productos_activos():
    """Obtener cantidad de productos activos"""
    try:
        activos = await productos_collection().count_documents({
            "estado_producto": 1
        })
        return activos
        
    except Exception as e:
        logger.error(f"Error obteniendo productos activos: {e}")
        return 0

async def obtener_productos_stock_bajo():
    """Obtener cantidad de productos con stock bajo"""
    try:
        # Pipeline para obtener productos con stock por debajo del mínimo
        pipeline = [
            {
                "$lookup": {
                    "from": "productos",
                    "localField": "producto_id",
                    "foreignField": "id_producto",
                    "as": "producto_info"
                }
            },
            {
                "$unwind": "$producto_info"
            },
            {
                "$match": {
                    "$expr": {
                        "$lte": ["$cantidad_total", "$producto_info.stock_minimo"]
                    }
                }
            }
        ]
        
        resultado = await stock_collection().aggregate(pipeline).to_list(length=None)
        return len(resultado)
        
    except Exception as e:
        logger.error(f"Error obteniendo productos con stock bajo: {e}")
        return 0

async def obtener_productos_sin_stock():
    """Obtener cantidad de productos sin stock"""
    try:
        sin_stock = await stock_collection().count_documents({
            "cantidad_total": 0
        })
        return sin_stock
        
    except Exception as e:
        logger.error(f"Error obteniendo productos sin stock: {e}")
        return 0

async def obtener_valor_total_inventario():
    """Obtener valor total del inventario"""
    try:
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": {"$ifNull": ["$valor_inventario", 0]}}
                }
            }
        ]
        
        resultado = await stock_collection().aggregate(pipeline).to_list(length=1)
        total = resultado[0]["total"] if resultado else 0.0
        
        return total
        
    except Exception as e:
        logger.error(f"Error obteniendo valor total del inventario: {e}")
        return 0.0

async def obtener_movimientos_hoy():
    """Obtener cantidad de movimientos del día actual"""
    try:
        # Fecha de hoy (inicio del día)
        hoy = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Contar movimientos en logs del día (stock y productos)
        movimientos = await log_collection().count_documents({
            "timestamp": {"$gte": hoy},
            "module": {"$in": ["stock", "productos"]}
        })
        
        return movimientos
        
    except Exception as e:
        logger.error(f"Error obteniendo movimientos del día: {e}")
        return 0

async def obtener_solicitudes_pendientes():
    """Obtener cantidad de solicitudes pendientes"""
    try:
        # Por ahora devolvemos 0 hasta que se implemente el módulo de solicitudes
        # TODO: Implementar cuando exista solicitudes_collection
        pendientes = 0
        
        return pendientes
        
    except Exception as e:
        logger.error(f"Error obteniendo solicitudes pendientes: {e}")
        return 0

async def obtener_ot_activas():
    """Obtener cantidad de OT activas"""
    try:
        # Por ahora devolvemos 0 hasta que se implemente el módulo de OT
        # TODO: Implementar cuando exista ot_collection
        activas = 0
        
        return activas
        
    except Exception as e:
        logger.error(f"Error obteniendo OT activas: {e}")
        return 0

async def obtener_usuarios_activos():
    """Obtener cantidad de usuarios activos"""
    try:
        activos = await usuarios_collection().count_documents({
            "estado_usuario": 1
        })
        return activos
        
    except Exception as e:
        logger.error(f"Error obteniendo usuarios activos: {e}")
        return 0

async def obtener_actividad_reciente():
    """Obtener actividad reciente del sistema"""
    try:
        # Últimos productos creados
        productos_recientes = await productos_collection().find(
            {},
            {"_id": 0, "id_producto": 1, "nombre_producto": 1, "created_at": 1}
        ).sort("created_at", -1).limit(5).to_list(length=5)
        
        # Últimos movimientos de stock (usando logs)
        movimientos_recientes = await log_collection().find(
            {"module": {"$in": ["stock", "productos"]}},
            {"_id": 0}
        ).sort("timestamp", -1).limit(10).to_list(length=10)
        
        # Últimos usuarios registrados
        usuarios_recientes = await usuarios_collection().find(
            {},
            {"_id": 0, "id_usuario": 1, "nombre_usuario": 1, "created_at": 1}
        ).sort("created_at", -1).limit(5).to_list(length=5)
        
        return {
            "productos_recientes": productos_recientes,
            "movimientos_recientes": movimientos_recientes,
            "usuarios_recientes": usuarios_recientes
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo actividad reciente: {e}")
        return {
            "productos_recientes": [],
            "movimientos_recientes": [],
            "usuarios_recientes": []
        }

async def obtener_alertas_dashboard():
    """Obtener alertas para mostrar en el dashboard"""
    try:
        alertas = []
        
        # Alerta de stock crítico
        stock_bajo = await obtener_productos_stock_bajo()
        if stock_bajo > 0:
            alertas.append({
                "id": "stock_critico",
                "tipo": "stock_critico",
                "titulo": "Stock Crítico",
                "mensaje": f"{stock_bajo} productos con stock por debajo del mínimo",
                "prioridad": "alta",
                "timestamp": datetime.now().isoformat()
            })
        
        # Alerta de productos sin stock
        sin_stock = await obtener_productos_sin_stock()
        if sin_stock > 0:
            alertas.append({
                "id": "sin_stock",
                "tipo": "sin_stock",
                "titulo": "Sin Stock",
                "mensaje": f"{sin_stock} productos sin stock disponible",
                "prioridad": "alta",
                "timestamp": datetime.now().isoformat()
            })
        
        # Alerta de solicitudes pendientes por mucho tiempo (mock por ahora)
        # TODO: Implementar cuando exista el módulo de solicitudes
        
        return alertas
        
    except Exception as e:
        logger.error(f"Error obteniendo alertas: {e}")
        return []

async def obtener_resumen_por_tipo():
    """Obtener resumen de productos por tipo y categoría"""
    try:
        # Productos por tipo
        pipeline_tipos = [
            {
                "$group": {
                    "_id": "$tipo_producto",
                    "cantidad": {"$sum": 1}
                }
            }
        ]
        
        tipos_resultado = await productos_collection().aggregate(pipeline_tipos).to_list(length=None)
        
        # Productos por categoría
        pipeline_categorias = [
            {
                "$group": {
                    "_id": "$categoria_producto",
                    "cantidad": {"$sum": 1}
                }
            }
        ]
        
        categorias_resultado = await productos_collection().aggregate(pipeline_categorias).to_list(length=None)
        
        # Calcular totales y porcentajes
        total_productos = await obtener_total_productos()
        
        productos_por_tipo = []
        for item in tipos_resultado:
            porcentaje = (item["cantidad"] / total_productos * 100) if total_productos > 0 else 0
            productos_por_tipo.append({
                "tipo": item["_id"],
                "cantidad": item["cantidad"],
                "porcentaje": round(porcentaje, 2)
            })
        
        productos_por_categoria = []
        for item in categorias_resultado:
            porcentaje = (item["cantidad"] / total_productos * 100) if total_productos > 0 else 0
            productos_por_categoria.append({
                "categoria": item["_id"],
                "cantidad": item["cantidad"],
                "porcentaje": round(porcentaje, 2)
            })
        
        return {
            "productos_por_tipo": productos_por_tipo,
            "productos_por_categoria": productos_por_categoria,
            "total_productos": total_productos
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo resumen por tipo: {e}")
        return {
            "productos_por_tipo": [],
            "productos_por_categoria": [],
            "total_productos": 0
        }

async def obtener_estadisticas_generales():
    """Obtener todas las estadísticas generales del dashboard"""
    try:
        # Obtener todas las estadísticas en paralelo sería más eficiente
        # Por simplicidad, las obtenemos secuencialmente
        
        total_productos = await obtener_total_productos()
        productos_activos = await obtener_productos_activos()
        stock_bajo = await obtener_productos_stock_bajo()
        productos_sin_stock = await obtener_productos_sin_stock()
        solicitudes_pendientes = await obtener_solicitudes_pendientes()
        ot_activas = await obtener_ot_activas()
        movimientos_hoy = await obtener_movimientos_hoy()
        usuarios_activos = await obtener_usuarios_activos()
        valor_total_inventario = await obtener_valor_total_inventario()
        
        # Actividad reciente (últimos 7 días)
        hace_7_dias = datetime.now() - timedelta(days=7)
        actividad_reciente = await log_collection().count_documents({
            "timestamp": {"$gte": hace_7_dias}
        })
        
        # Total de usuarios
        total_usuarios = await usuarios_collection().count_documents({})
        
        # Distribuciones por categoría y tipo
        resumen = await obtener_resumen_por_tipo()
        
        estadisticas = {
            # Métricas principales
            "productos": total_productos,
            "productos_activos": productos_activos,
            "stock_bajo": stock_bajo,
            "productos_sin_stock": productos_sin_stock,
            "solicitudes_pendientes": solicitudes_pendientes,
            "ot_activas": ot_activas,
            "movimientos_hoy": movimientos_hoy,
            "usuarios_activos": usuarios_activos,
            "total_usuarios": total_usuarios,
            "valor_total_inventario": valor_total_inventario,
            "actividad_reciente": actividad_reciente,
            
            # Distribuciones
            "productos_por_categoria": {item["categoria"]: item["cantidad"] for item in resumen["productos_por_categoria"]},
            "productos_por_tipo": {item["tipo"]: item["cantidad"] for item in resumen["productos_por_tipo"]},
            
            # Alertas y estado
            "alertas": {
                "stock_bajo": stock_bajo > 0,
                "sin_stock": productos_sin_stock > 0,
                "solicitudes_pendientes": solicitudes_pendientes > 0,
                "ot_vencidas": False  # Mock por ahora
            },
            
            # Metadata
            "ultima_actualizacion": datetime.now().isoformat()
        }
        
        return estadisticas
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas generales: {e}")
        return {
            "productos": 0,
            "productos_activos": 0,
            "stock_bajo": 0,
            "productos_sin_stock": 0,
            "solicitudes_pendientes": 0,
            "ot_activas": 0,
            "movimientos_hoy": 0,
            "usuarios_activos": 0,
            "total_usuarios": 0,
            "valor_total_inventario": 0.0,
            "actividad_reciente": 0,
            "productos_por_categoria": {},
            "productos_por_tipo": {},
            "alertas": {
                "stock_bajo": False,
                "sin_stock": False,
                "solicitudes_pendientes": False,
                "ot_vencidas": False
            },
            "ultima_actualizacion": datetime.now().isoformat()
        }

logger.info("✅ Funciones de dashboard configuradas exitosamente")
