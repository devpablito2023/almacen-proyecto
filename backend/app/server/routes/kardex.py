# backend/app/server/routes/kardex.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from server.functions.kardex import (
    obtener_kardex,
    obtener_movimientos_por_producto,
    calcular_resumen_kardex,
    calcular_balance_kardex,
    obtener_estadisticas_kardex,
    actualizar_estadisticas_kardex
)
from server.models.kardex import KardexQuery
from server.models.responses import success_response, error_response, paginated_response
from server.routes.auth import get_current_user
from server.config.security import check_permission
from datetime import datetime, date, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def check_kardex_permission(user_type: int, action: str): 
    """Verificar permisos de usuario para módulo kardex"""
    if not check_permission(user_type, "kardex", action):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para esta operación"
        )

@router.get("/", summary="Consultar movimientos del kardex")
async def get_kardex(
    producto_id: Optional[int] = Query(None, description="Filtrar por producto"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha inicio del período"),
    fecha_fin: Optional[date] = Query(None, description="Fecha fin del período"),
    operacion_kardex: Optional[str] = Query(None, description="Tipo de operación"),
    tipo_movimiento: Optional[str] = Query(None, description="Tipo de movimiento"),
    solicitud_id: Optional[int] = Query(None, description="ID de solicitud"),
    ot_numero: Optional[str] = Query(None, description="Número de OT"),
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(20, ge=1, le=100, description="Elementos por página"),
    current_user = Depends(get_current_user)
):
    """
    Obtener movimientos del kardex con filtros
    
    - **producto_id**: Filtrar por producto específico
    - **fecha_inicio**: Fecha inicio del período
    - **fecha_fin**: Fecha fin del período
    - **operacion_kardex**: INGRESO/SALIDA/DEVOLUCION/AJUSTE_POSITIVO/AJUSTE_NEGATIVO
    - **tipo_movimiento**: COMPRA/DESPACHO/DEVOLUCION/AJUSTE/TRANSFERENCIA
    - **solicitud_id**: ID de solicitud relacionada
    - **ot_numero**: Número de OT relacionada
    
    Requiere permisos de lectura de kardex
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_kardex_permission(user_type, "read")
        
        # Crear query object
        query = KardexQuery(
            producto_id=producto_id,
            fecha_inicio=datetime.combine(fecha_inicio, datetime.min.time()) if fecha_inicio else None,
            fecha_fin=datetime.combine(fecha_fin, datetime.max.time()) if fecha_fin else None,
            operacion_kardex=operacion_kardex,
            tipo_movimiento=tipo_movimiento,
            solicitud_id=solicitud_id,
            ot_numero=ot_numero,
            page=page,
            limit=limit
        )
        
        result = await obtener_kardex(query)
        
        return paginated_response(
            data=result["data"],
            total=result["total"],
            page=result["page"],
            limit=result["limit"],
            message="Movimientos kardex obtenidos exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="KARDEX_QUERY_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error consultando kardex: {e}")
        return error_response(
            message="Error interno del servidor",
            code=500
        )

@router.get("/stats", summary="Obtener estadísticas del kardex")
async def get_estadisticas_kardex(
    current_user = Depends(get_current_user)
):
    """
    Obtener estadísticas del kardex desde caché
    
    Incluye:
    - Total de movimientos
    - Movimientos del día
    - Resumen del último mes
    - Productos más movidos
    
    Requiere permisos de lectura de kardex
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_kardex_permission(user_type, "read")
        
        stats = await obtener_estadisticas_kardex()
        
        if not stats:
            return success_response(
                data={"message": "No hay estadísticas disponibles"},
                message="Estadísticas no encontradas"
            )
        
        return success_response(
            data=stats,
            message="Estadísticas del kardex obtenidas exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="KARDEX_STATS_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas kardex: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.post("/stats/actualizar", summary="Actualizar estadísticas del kardex")
async def update_estadisticas_kardex(
    current_user = Depends(get_current_user)
):
    """
    Recalcular y actualizar estadísticas del kardex
    
    Proceso intensivo que recalcula todas las métricas
    y las guarda en caché para consulta rápida
    
    Requiere permisos de administración
    """
    try:
        # Verificar permisos de administración
        user_type = current_user["user"]["tipo_usuario"]
        if user_type not in [0, 1]:  # Solo superusuario y jefatura
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para actualizar estadísticas"
            )
        
        stats = await actualizar_estadisticas_kardex()
        
        return success_response(
            data=stats,
            message="Estadísticas del kardex actualizadas exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="KARDEX_STATS_UPDATE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error actualizando estadísticas kardex: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/operaciones", summary="Obtener tipos de operaciones disponibles")
async def get_tipos_operaciones(
    current_user = Depends(get_current_user)
):
    """
    Obtener lista de tipos de operaciones y movimientos disponibles
    
    Para uso en formularios y filtros
    
    Requiere permisos de lectura de kardex
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_kardex_permission(user_type, "read")
        
        operaciones = {
            "operaciones_kardex": [
                {"codigo": "INGRESO", "nombre": "Ingreso", "descripcion": "Entrada de productos al inventario"},
                {"codigo": "SALIDA", "nombre": "Salida", "descripcion": "Salida de productos del inventario"},
                {"codigo": "DEVOLUCION", "nombre": "Devolución", "descripcion": "Devolución de productos al inventario"},
                {"codigo": "AJUSTE_POSITIVO", "nombre": "Ajuste Positivo", "descripcion": "Incremento por ajuste de inventario"},
                {"codigo": "AJUSTE_NEGATIVO", "nombre": "Ajuste Negativo", "descripcion": "Decremento por ajuste de inventario"},
                {"codigo": "TRANSFERENCIA", "nombre": "Transferencia", "descripcion": "Transferencia entre ubicaciones"}
            ],
            "tipos_movimiento": [
                {"codigo": "COMPRA", "nombre": "Compra", "descripcion": "Compra a proveedor"},
                {"codigo": "DESPACHO", "nombre": "Despacho", "descripcion": "Despacho por solicitud"},
                {"codigo": "DEVOLUCION", "nombre": "Devolución", "descripcion": "Devolución de productos"},
                {"codigo": "AJUSTE", "nombre": "Ajuste", "descripcion": "Ajuste de inventario"},
                {"codigo": "TRANSFERENCIA", "nombre": "Transferencia", "descripcion": "Transferencia interna"}
            ]
        }
        
        return success_response(
            data=operaciones,
            message="Tipos de operaciones obtenidos exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="OPERATIONS_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error obteniendo tipos de operaciones: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/trazabilidad/{numero_movimiento}", summary="Obtener trazabilidad de movimiento")
async def get_trazabilidad_movimiento(
    numero_movimiento: str,
    current_user = Depends(get_current_user)
):
    """
    Obtener trazabilidad completa de un movimiento específico
    
    - **numero_movimiento**: Número único del movimiento
    
    Incluye información detallada del movimiento y sus relaciones
    
    Requiere permisos de lectura de kardex
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_kardex_permission(user_type, "read")
        
        # Buscar el movimiento
        from server.config.database import kardex_collection
        
        pipeline = [
            {"$match": {"numero_movimiento": numero_movimiento, "estado_kardex": 1}},
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
                    "_id": 0,
                    "movimiento": {
                        "id_kardex": 1,
                        "numero_movimiento": 1,
                        "operacion_kardex": 1,
                        "tipo_movimiento": 1,
                        "cantidad_anterior": 1,
                        "cantidad_movimiento": 1,
                        "cantidad_actual": 1,
                        "costo_unitario": 1,
                        "costo_total": 1,
                        "fecha_movimiento": 1,
                        "realizado_por_name": 1,
                        "autorizado_por_name": 1,
                        "motivo_movimiento": 1,
                        "documento_referencia": 1,
                        "numero_documento": 1,
                        "lote_serie": 1,
                        "ubicacion": 1
                    },
                    "producto": {
                        "id_producto": "$producto_info.id_producto",
                        "codigo_producto": "$producto_info.codigo_producto",
                        "nombre_producto": "$producto_info.nombre_producto",
                        "tipo_producto": "$producto_info.tipo_producto",
                        "magnitud_producto": "$producto_info.magnitud_producto"
                    },
                    "relaciones": {
                        "solicitud_id": 1,
                        "ot_numero": 1,
                        "ingreso_id": 1
                    }
                }
            }
        ]
        
        cursor = kardex_collection().aggregate(pipeline)
        result = await cursor.to_list(length=1)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Movimiento no encontrado"
            )
        
        movimiento_data = result[0]
        
        # Buscar movimientos relacionados del mismo producto
        movimientos_relacionados = await obtener_movimientos_por_producto(
            movimiento_data["producto"]["id_producto"],
            10
        )
        
        # Filtrar el movimiento actual de los relacionados
        movimientos_relacionados = [
            m for m in movimientos_relacionados 
            if m["numero_movimiento"] != numero_movimiento
        ]
        
        trazabilidad = {
            "movimiento_principal": movimiento_data,
            "movimientos_relacionados": movimientos_relacionados[:5],  # Solo los 5 más recientes
            "fecha_consulta": datetime.now()
        }
        
        return success_response(
            data=trazabilidad,
            message="Trazabilidad obtenida exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="TRACEABILITY_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error obteniendo trazabilidad: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )


@router.get("/producto/{product_id}", summary="Obtener movimientos de un producto")
async def get_movimientos_producto(
    product_id: int,
    limit: int = Query(50, ge=1, le=200, description="Límite de movimientos"),
    current_user = Depends(get_current_user)
):
    """
    Obtener últimos movimientos de un producto específico
    
    - **product_id**: ID del producto
    - **limit**: Límite de movimientos (default: 50, max: 200)
    
    Requiere permisos de lectura de kardex
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_kardex_permission(user_type, "read")
        
        movimientos = await obtener_movimientos_por_producto(product_id, limit)
        
        return success_response(
            data=movimientos,
            message=f"Movimientos del producto {product_id} obtenidos exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="PRODUCT_MOVEMENTS_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error obteniendo movimientos del producto {product_id}: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/resumen", summary="Obtener resumen de kardex")
async def get_resumen_kardex(
    fecha_inicio: Optional[date] = Query(None, description="Fecha inicio del período"),
    fecha_fin: Optional[date] = Query(None, description="Fecha fin del período"),
    current_user = Depends(get_current_user)
):
    """
    Obtener resumen de movimientos del kardex
    
    - **fecha_inicio**: Fecha inicio del período (default: hace 30 días)
    - **fecha_fin**: Fecha fin del período (default: hoy)
    
    Incluye:
    - Total de movimientos por tipo
    - Valor total de movimientos
    - Productos con movimiento
    
    Requiere permisos de lectura de kardex
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_kardex_permission(user_type, "read")
        
        # Convertir fechas si se proporcionan
        fecha_inicio_dt = datetime.combine(fecha_inicio, datetime.min.time()) if fecha_inicio else None
        fecha_fin_dt = datetime.combine(fecha_fin, datetime.max.time()) if fecha_fin else None
        
        resumen = await calcular_resumen_kardex(fecha_inicio_dt, fecha_fin_dt)
        
        return success_response(
            data=resumen.dict(),
            message="Resumen de kardex calculado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="KARDEX_SUMMARY_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error calculando resumen kardex: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/balance", summary="Obtener balance kardex vs stock")
async def get_balance_kardex(
    producto_id: Optional[int] = Query(None, description="Filtrar por producto específico"),
    current_user = Depends(get_current_user)
):
    """
    Calcular balance entre kardex y stock del sistema
    
    - **producto_id**: Filtrar por producto específico (opcional)
    
    Compara el stock calculado según movimientos kardex
    vs el stock registrado en el sistema
    
    Requiere permisos de lectura de kardex
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_kardex_permission(user_type, "read")
        
        balances = await calcular_balance_kardex(producto_id)
        
        # Calcular resumen del balance
        total_productos = len(balances)
        productos_con_diferencia = len([b for b in balances if b.diferencia != 0])
        diferencia_total = sum([float(b.diferencia) for b in balances])
        
        resultado = {
            "balances": [balance.dict() for balance in balances],
            "resumen": {
                "total_productos": total_productos,
                "productos_con_diferencia": productos_con_diferencia,
                "diferencia_total": diferencia_total,
                "porcentaje_productos_ok": (
                    ((total_productos - productos_con_diferencia) / total_productos * 100)
                    if total_productos > 0 else 0
                )
            }
        }
        
        return success_response(
            data=resultado,
            message="Balance kardex vs stock calculado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="KARDEX_BALANCE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error calculando balance kardex: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )