# backend/app/server/routes/dashboard.py
from fastapi import APIRouter, Depends, HTTPException, status
from server.functions.dashboard import (
    obtener_estadisticas_generales,
    obtener_actividad_reciente,
    obtener_alertas_dashboard,
    obtener_resumen_por_tipo
)
from server.models.responses import success_response, error_response
from server.routes.auth import get_current_user
from server.config.security import check_permission
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def check_dashboard_permission(user_type: int, action: str):
    """Verificar permisos de usuario para dashboard"""
    # Todos los usuarios autenticados pueden ver el dashboard
    allowed_types = [0, 1, 2, 3, 4, 5]
    
    if user_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para acceder al dashboard"
        )
    
    return True

@router.get("/dashboard/stats", summary="Obtener estadísticas del dashboard")
async def get_dashboard_stats(current_user = Depends(get_current_user)):
    """
    Obtener estadísticas generales para el dashboard
    
    Retorna métricas principales del sistema:
    - Total de productos
    - Productos con stock bajo
    - Valor del inventario
    - Movimientos del día
    - Solicitudes pendientes
    - OT activas
    """
    try:
        user_type = current_user["user"]["tipo_usuario"]
        check_dashboard_permission(user_type, "view")
        
        stats = await obtener_estadisticas_generales()
        
        return success_response(
            data=stats,
            message="Estadísticas obtenidas exitosamente"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas del dashboard: {e}")
        return error_response(
            message="Error interno al obtener estadísticas",
            details=str(e)
        )

@router.get("/dashboard/activity", summary="Obtener actividad reciente")
async def get_dashboard_activity(current_user = Depends(get_current_user)):
    """
    Obtener actividad reciente del sistema
    
    Retorna:
    - Últimos productos creados
    - Últimos movimientos de stock
    - Últimos usuarios registrados
    """
    try:
        user_type = current_user["user"]["tipo_usuario"]
        check_dashboard_permission(user_type, "view")
        
        activity = await obtener_actividad_reciente()
        
        return success_response(
            data=activity,
            message="Actividad reciente obtenida exitosamente"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo actividad reciente: {e}")
        return error_response(
            message="Error interno al obtener actividad",
            details=str(e)
        )

@router.get("/dashboard/alerts", summary="Obtener alertas del dashboard")
async def get_dashboard_alerts(current_user = Depends(get_current_user)):
    """
    Obtener alertas importantes del sistema
    
    Retorna alertas sobre:
    - Stock crítico
    - Productos próximos a vencer
    - Solicitudes pendientes por mucho tiempo
    """
    try:
        user_type = current_user["user"]["tipo_usuario"]
        check_dashboard_permission(user_type, "view")
        
        alerts = await obtener_alertas_dashboard()
        
        return success_response(
            data=alerts,
            message="Alertas obtenidas exitosamente"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo alertas: {e}")
        return error_response(
            message="Error interno al obtener alertas",
            details=str(e)
        )

@router.get("/dashboard/summary", summary="Obtener resumen por categorías")
async def get_dashboard_summary(current_user = Depends(get_current_user)):
    """
    Obtener resumen de productos por tipo y otras métricas
    
    Retorna distribución de productos por tipo
    """
    try:
        user_type = current_user["user"]["tipo_usuario"]
        check_dashboard_permission(user_type, "view")
        
        summary = await obtener_resumen_por_tipo()
        
        return success_response(
            data=summary,
            message="Resumen obtenido exitosamente"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo resumen: {e}")
        return error_response(
            message="Error interno al obtener resumen",
            details=str(e)
        )

@router.get("/dashboard", summary="Obtener datos completos del dashboard")
async def get_complete_dashboard(current_user = Depends(get_current_user)):
    """
    Obtener todos los datos del dashboard en una sola llamada
    
    Retorna:
    - Estadísticas generales
    - Actividad reciente
    - Alertas
    - Resumen por categorías
    """
    try:
        user_type = current_user["user"]["tipo_usuario"]
        check_dashboard_permission(user_type, "view")
        
        # Obtener todos los datos en paralelo sería más eficiente,
        # pero por simplicidad los obtenemos secuencialmente
        stats = await obtener_estadisticas_generales()
        activity = await obtener_actividad_reciente()
        alerts = await obtener_alertas_dashboard()
        summary = await obtener_resumen_por_tipo()
        
        dashboard_data = {
            "stats": stats,
            "activity": activity,
            "alerts": alerts,
            "summary": summary
        }
        
        return success_response(
            data=dashboard_data,
            message="Dashboard obtenido exitosamente"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo dashboard completo: {e}")
        return error_response(
            message="Error interno al obtener dashboard",
            details=str(e)
        )

logger.info("✅ Rutas de dashboard configuradas exitosamente")