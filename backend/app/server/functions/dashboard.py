# backend/app/server/functions/dashboard.py
from server.config.database import (
    productos_collection, 
    stock_collection, 
    usuarios_collection,
    log_collection
)
from server.functions.productos import obtener_estadisticas_productos
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

async def obtener_estadisticas_generales():
    """Obtener estadísticas generales del dashboard"""
    try:
        # Obtener estadísticas de productos (incluye valor_total_inventario correcto)
        stats_productos = await obtener_estadisticas_productos()
        
        # Usuarios activos
        usuarios_activos = await usuarios_collection().count_documents({"estado_usuario": 1})
        total_usuarios = await usuarios_collection().count_documents({})
        
        # Movimientos del día (logs de hoy)
        hoy_inicio = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        hoy_fin = datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)
        
        movimientos_hoy = await log_collection().count_documents({
            "timestamp": {"$gte": hoy_inicio, "$lte": hoy_fin}
        })
        
        # Actividad reciente (últimos 7 días)
        hace_7_dias = datetime.now() - timedelta(days=7)
        actividad_reciente = await log_collection().count_documents({
            "timestamp": {"$gte": hace_7_dias}
        })
        
        # TODO: Cuando se implementen solicitudes y OT, reemplazar estos valores
        solicitudes_pendientes = 0  # Placeholder hasta implementar solicitudes
        ot_activas = 0  # Placeholder hasta implementar OT
        
        estadisticas = {
            # Métricas principales - usando estadísticas de productos
            "productos": stats_productos["total_productos"],
            "productos_activos": stats_productos["productos_activos"],
            "stock_bajo": stats_productos["productos_stock_bajo"],
            "productos_sin_stock": stats_productos["productos_sin_stock"],
            "solicitudes_pendientes": solicitudes_pendientes,  # Mock por ahora
            "ot_activas": ot_activas,  # Mock por ahora
            "movimientos_hoy": movimientos_hoy,
            "usuarios_activos": usuarios_activos,
            "total_usuarios": total_usuarios,
            "valor_total_inventario": float(stats_productos["valor_total_inventario"]),
            "actividad_reciente": actividad_reciente,
            
            # Alertas y estado
            "alertas": {
                "stock_bajo": stats_productos["productos_stock_bajo"] > 0,
                "sin_stock": stats_productos["productos_sin_stock"] > 0,
                "solicitudes_pendientes": solicitudes_pendientes > 0,
                "ot_vencidas": False  # Mock por ahora
            },
            
            # Metadata
            "ultima_actualizacion": datetime.now().isoformat()
        }
        
        logger.info("Estadísticas del dashboard obtenidas exitosamente")
        return estadisticas
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas generales: {e}")
        # Retornar estadísticas por defecto en caso de error
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
            "alertas": {
                "stock_bajo": False,
                "sin_stock": False,
                "solicitudes_pendientes": False,
                "ot_vencidas": False
            },
            "ultima_actualizacion": datetime.now().isoformat()
        }

async def obtener_actividad_reciente(limite: int = 10):
    """Obtener actividad reciente del sistema"""
    try:
        # Obtener logs recientes
        logs_cursor = log_collection().find(
            {},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limite)
        
        logs_recientes = await logs_cursor.to_list(length=limite)
        
        # Formatear actividad para el frontend
        actividad_formateada = []
        for log in logs_recientes:
            actividad_formateada.append({
                "timestamp": log.get("timestamp", datetime.now()).isoformat() if isinstance(log.get("timestamp"), datetime) else str(log.get("timestamp", "")),
                "action": log.get("action", "Acción desconocida"),
                "user_id": log.get("user_id", 0),
                "user_name": log.get("user_name", "Usuario desconocido"),
                "details": log.get("details", "Sin detalles"),
                "ip_address": log.get("ip_address", ""),
                "user_agent": log.get("user_agent", "")
            })
        
        return {
            "actividad": actividad_formateada,
            "total": len(actividad_formateada)
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo actividad reciente: {e}")
        return {
            "actividad": [],
            "total": 0
        }

async def obtener_alertas_dashboard():
    """Obtener alertas importantes del sistema"""
    try:
        alertas = []
        
        # Alertas de stock crítico
        pipeline_stock_critico = [
            {"$lookup": {
                "from": "productos",
                "localField": "producto_id",
                "foreignField": "id_producto",
                "as": "producto_info"
            }},
            {"$unwind": "$producto_info"},
            {"$match": {"$expr": {"$lte": ["$cantidad_total", "$producto_info.stock_minimo"]}}},
            {"$project": {
                "producto_id": 1,
                "cantidad_total": 1,
                "producto_info.nombre_producto": 1,
                "producto_info.stock_minimo": 1
            }}
        ]
        
        stock_critico_cursor = stock_collection().aggregate(pipeline_stock_critico)
        productos_stock_critico = await stock_critico_cursor.to_list(length=None)
        
        for producto in productos_stock_critico:
            alertas.append({
                "id": f"stock_critico_{producto['producto_id']}",
                "tipo": "stock_critico",
                "titulo": "Stock Crítico",
                "mensaje": f"Producto '{producto['producto_info']['nombre_producto']}' tiene stock bajo ({producto['cantidad_total']} unidades)",
                "prioridad": "alta" if producto['cantidad_total'] == 0 else "media",
                "timestamp": datetime.now().isoformat(),
                "producto_id": producto['producto_id'],
                "cantidad": producto['cantidad_total']
            })
        
        # Productos sin stock
        productos_sin_stock_cursor = stock_collection().find({"cantidad_total": 0})
        productos_sin_stock = await productos_sin_stock_cursor.to_list(length=None)
        
        for producto in productos_sin_stock:
            # Obtener info del producto
            producto_info = await productos_collection().find_one({"id_producto": producto["producto_id"]})
            if producto_info:
                alertas.append({
                    "id": f"sin_stock_{producto['producto_id']}",
                    "tipo": "sin_stock",
                    "titulo": "Sin Stock",
                    "mensaje": f"Producto '{producto_info['nombre_producto']}' agotado",
                    "prioridad": "alta",
                    "timestamp": datetime.now().isoformat(),
                    "producto_id": producto['producto_id'],
                    "cantidad": 0
                })
        
        # TODO: Agregar alertas de productos próximos a vencer cuando se implemente fecha de vencimiento
        # TODO: Agregar alertas de solicitudes pendientes cuando se implemente el módulo
        
        return alertas
        
    except Exception as e:
        logger.error(f"Error obteniendo alertas del dashboard: {e}")
        return []

async def obtener_resumen_por_tipo():
    """Obtener resumen de productos por tipo y categorías"""
    try:
        # Resumen por tipo de productos
        pipeline_tipos = [
            {"$group": {"_id": "$tipo_producto", "cantidad": {"$sum": 1}}},
            {"$sort": {"cantidad": -1}}
        ]
        tipos_cursor = productos_collection().aggregate(pipeline_tipos)
        tipos_results = await tipos_cursor.to_list(length=None)
        
        total_productos_tipos = sum(item["cantidad"] for item in tipos_results)
        
        productos_por_tipo = []
        for item in tipos_results:
            porcentaje = (item["cantidad"] / total_productos_tipos * 100) if total_productos_tipos > 0 else 0
            productos_por_tipo.append({
                "tipo": item["_id"] or "Sin tipo",
                "cantidad": item["cantidad"],
                "porcentaje": round(porcentaje, 1)
            })
        
        # Resumen por categoría de productos
        pipeline_categorias = [
            {"$group": {"_id": "$categoria_producto", "cantidad": {"$sum": 1}}},
            {"$sort": {"cantidad": -1}}
        ]
        categorias_cursor = productos_collection().aggregate(pipeline_categorias)
        categorias_results = await categorias_cursor.to_list(length=None)
        
        total_productos_categorias = sum(item["cantidad"] for item in categorias_results)
        
        productos_por_categoria = []
        for item in categorias_results:
            porcentaje = (item["cantidad"] / total_productos_categorias * 100) if total_productos_categorias > 0 else 0
            productos_por_categoria.append({
                "categoria": item["_id"] or "Sin categoría",
                "cantidad": item["cantidad"],
                "porcentaje": round(porcentaje, 1)
            })
        
        return {
            "productos_por_tipo": productos_por_tipo,
            "productos_por_categoria": productos_por_categoria,
            "total_productos": await productos_collection().count_documents({})
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo resumen por tipo: {e}")
        return {
            "productos_por_tipo": [],
            "productos_por_categoria": [],
            "total_productos": 0
        }

logger.info("✅ Funciones de dashboard configuradas exitosamente")
