# backend/app/server/routes/ingresos.py
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from server.functions.ingresos import (
    crear_ingreso,
    obtener_ingresos,
    obtener_ingreso_por_id,
    actualizar_ingreso,
    validar_ingreso,
    cancelar_ingreso,
    procesar_ingresos_masivos,
    procesar_excel_ingresos,
    obtener_estadisticas_ingresos,
    obtener_ingresos_pendientes,
    actualizar_estadisticas_ingresos
)
from server.models.ingresos import (
    IngresoCreate, IngresoUpdate, IngresoValidate, 
    IngresoBulk, IngresoQuery
)
from server.models.responses import success_response, error_response, paginated_response
from server.routes.auth import get_current_user
from server.config.security import check_permission
from datetime import date, datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def check_ingresos_permission(user_type: int, action: str): 
    """Verificar permisos de usuario para módulo ingresos"""
    if not check_permission(user_type, "ingresos", action):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para esta operación"
        )

@router.get("/", summary="Listar ingresos")
async def get_ingresos(
    producto_id: Optional[int] = Query(None, description="Filtrar por producto"),
    proveedor: Optional[str] = Query(None, description="Filtrar por proveedor"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha inicio del período"),
    fecha_fin: Optional[date] = Query(None, description="Fecha fin del período"),
    condicion_ingreso: Optional[int] = Query(None, description="Condición del ingreso"),
    pendiente_validacion: Optional[bool] = Query(None, description="Solo pendientes de validación"),
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(20, ge=1, le=100, description="Elementos por página"),
    current_user = Depends(get_current_user)
):
    """
    Obtener lista de ingresos con filtros
    
    - **producto_id**: Filtrar por producto específico
    - **proveedor**: Filtrar por nombre de proveedor (búsqueda parcial)
    - **fecha_inicio**: Fecha inicio del período
    - **fecha_fin**: Fecha fin del período
    - **condicion_ingreso**: 0=Cancelado, 1=Creado, 2=Validado, 3=Modificado
    - **pendiente_validacion**: Solo ingresos pendientes de validación
    
    Requiere permisos de lectura de ingresos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "read")
        
        # Crear query object
        query = IngresoQuery(
            producto_id=producto_id,
            proveedor=proveedor,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            condicion_ingreso=condicion_ingreso,
            pendiente_validacion=pendiente_validacion,
            page=page,
            limit=limit
        )
        
        result = await obtener_ingresos(query)
        
        return paginated_response(
            data=result["data"],
            total=result["total"],
            page=result["page"],
            limit=result["limit"],
            message="Ingresos obtenidos exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="INGRESOS_QUERY_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error consultando ingresos: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/{ingreso_id}", summary="Obtener ingreso por ID")
async def get_ingreso(
    ingreso_id: int,
    current_user = Depends(get_current_user)
):
    """
    Obtener ingreso específico por ID
    
    - **ingreso_id**: ID del ingreso a consultar
    
    Requiere permisos de lectura de ingresos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "read")
        
        ingreso = await obtener_ingreso_por_id(ingreso_id)
        
        return success_response(
            data=ingreso,
            message="Ingreso obtenido exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="INGRESO_NOT_FOUND",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error obteniendo ingreso {ingreso_id}: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.post("/", summary="Crear nuevo ingreso")
async def create_ingreso(
    ingreso_data: IngresoCreate,
    current_user = Depends(get_current_user)
):
    """
    Crear nuevo ingreso de productos
    
    - **producto_id**: ID del producto (requerido)
    - **proveedor_ingreso**: Nombre del proveedor (requerido)
    - **cantidad_solicitada**: Cantidad solicitada (requerido)
    - **cantidad_recibida**: Cantidad recibida (requerido)
    - **costo_unitario**: Costo unitario del producto (requerido)
    - **factura_ingreso**: Número de factura (opcional)
    - **lote_serie**: Lote o serie (opcional)
    - **fecha_vencimiento**: Fecha de vencimiento (opcional)
    - **ubicacion_asignada**: Ubicación asignada (opcional)
    
    Requiere permisos de creación de ingresos (Usuario tipo 5)
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "create")
        
        # Solo usuarios tipo 5 pueden crear ingresos
        if user_type not in [0, 5]:  # Superusuario o realiza ingresos
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo usuarios autorizados pueden crear ingresos"
            )
        
        ingreso = await crear_ingreso(
            ingreso_data,
            current_user["user"]["id_usuario"],
            current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data=ingreso,
            message="Ingreso creado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="INGRESO_CREATE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error creando ingreso: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.put("/{ingreso_id}", summary="Actualizar ingreso")
async def update_ingreso(
    ingreso_id: int,
    update_data: IngresoUpdate,
    current_user = Depends(get_current_user)
):
    """
    Actualizar ingreso existente
    
    Solo se pueden actualizar ingresos no validados
    
    - **ingreso_id**: ID del ingreso a actualizar
    
    Requiere permisos de actualización de ingresos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "update")
        
        ingreso = await actualizar_ingreso(
            ingreso_id,
            update_data,
            current_user["user"]["id_usuario"],
            current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data=ingreso,
            message="Ingreso actualizado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="INGRESO_UPDATE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error actualizando ingreso {ingreso_id}: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.post("/{ingreso_id}/validar", summary="Validar ingreso")
async def validate_ingreso(
    ingreso_id: int,
    validacion_data: IngresoValidate,
    current_user = Depends(get_current_user)
):
    """
    Validar ingreso y actualizar stock
    
    Esta operación:
    - Valida la cantidad recibida
    - Actualiza el stock del producto
    - Registra el movimiento en kardex
    - Genera alertas si es necesario
    
    - **ingreso_id**: ID del ingreso a validar
    - **cantidad_validada**: Cantidad validada por almacén
    - **ubicacion_final**: Ubicación final del producto
    - **observaciones_validacion**: Observaciones de la validación
    
    Requiere permisos de validación (Usuario tipo 4 - Almacén)
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "validate")
        
        # Solo usuarios tipo 4 y 0 pueden validar ingresos
        if user_type not in [0, 4]:  # Superusuario o almacén
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo usuarios de almacén pueden validar ingresos"
            )
        
        ingreso = await validar_ingreso(
            ingreso_id,
            validacion_data,
            current_user["user"]["id_usuario"],
            current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data=ingreso,
            message="Ingreso validado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="INGRESO_VALIDATE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error validando ingreso {ingreso_id}: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.post("/{ingreso_id}/cancelar", summary="Cancelar ingreso")
async def cancel_ingreso(
    ingreso_id: int,
    motivo: str = Form(..., min_length=10, max_length=500, description="Motivo de cancelación"),
    current_user = Depends(get_current_user)
):
    """
    Cancelar ingreso
    
    Solo se pueden cancelar ingresos no validados
    
    - **ingreso_id**: ID del ingreso a cancelar
    - **motivo**: Motivo de la cancelación (requerido)
    
    Requiere permisos de cancelación de ingresos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "delete")
        
        ingreso = await cancelar_ingreso(
            ingreso_id,
            current_user["user"]["id_usuario"],
            current_user["user"]["nombre_usuario"],
            motivo
        )
        
        return success_response(
            data=ingreso,
            message="Ingreso cancelado exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="INGRESO_CANCEL_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error cancelando ingreso {ingreso_id}: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.post("/masivo", summary="Crear ingresos masivos")
async def create_ingresos_masivos(
    bulk_data: IngresoBulk,
    current_user = Depends(get_current_user)
):
    """
    Procesar múltiples ingresos en una sola operación
    
    - **ingresos**: Lista de ingresos a crear (máximo 1000)
    
    Retorna resumen con éxitos y errores
    
    Requiere permisos de creación de ingresos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "create")
        
        # Solo usuarios tipo 5 pueden crear ingresos masivos
        if user_type not in [0, 5]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo usuarios autorizados pueden crear ingresos masivos"
            )
        
        resultado = await procesar_ingresos_masivos(
            bulk_data,
            current_user["user"]["id_usuario"],
            current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data=resultado,
            message=f"Procesamiento completado: {resultado['exitosos']} éxitos, {resultado['errores']} errores"
        )
        
    except HTTPException as e:
        return error_response(
            error="BULK_INGRESOS_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error procesando ingresos masivos: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.post("/excel", summary="Procesar archivo Excel de ingresos")
async def upload_excel_ingresos(
    file: UploadFile = File(..., description="Archivo Excel con ingresos"),
    current_user = Depends(get_current_user)
):
    """
    Procesar archivo Excel para crear ingresos masivos
    
    El archivo debe contener las siguientes columnas:
    - **codigo_producto**: Código del producto (requerido)
    - **proveedor**: Nombre del proveedor (requerido)
    - **cantidad_solicitada**: Cantidad solicitada (requerido)
    - **cantidad_recibida**: Cantidad recibida (requerido)
    - **costo_unitario**: Costo unitario (requerido)
    - **factura**: Número de factura (opcional)
    - **orden_compra**: Número de orden de compra (opcional)
    - **lote_serie**: Lote o serie (opcional)
    - **fecha_vencimiento**: Fecha de vencimiento YYYY-MM-DD (opcional)
    - **ubicacion**: Ubicación asignada (opcional)
    - **observaciones**: Observaciones (opcional)
    
    Requiere permisos de creación de ingresos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "create")
        
        # Solo usuarios tipo 5 pueden procesar Excel
        if user_type not in [0, 5]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo usuarios autorizados pueden procesar archivos Excel"
            )
        
        resultado = await procesar_excel_ingresos(
            file,
            current_user["user"]["id_usuario"],
            current_user["user"]["nombre_usuario"]
        )
        
        return success_response(
            data=resultado,
            message=f"Archivo procesado: {resultado['procesados_exitosamente']} ingresos creados, {resultado['errores']} errores"
        )
        
    except HTTPException as e:
        return error_response(
            error="EXCEL_PROCESSING_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error procesando Excel: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/pendientes/validacion", summary="Obtener ingresos pendientes de validación")
async def get_ingresos_pendientes(
    limit: int = Query(50, ge=1, le=200, description="Límite de registros"),
    current_user = Depends(get_current_user)
):
    """
    Obtener lista de ingresos pendientes de validación
    
    Ordenados por antigüedad (más antiguos primero)
    
    - **limit**: Límite de registros (default: 50, max: 200)
    
    Requiere permisos de lectura de ingresos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "read")
        
        ingresos_pendientes = await obtener_ingresos_pendientes(limit)
        
        return success_response(
            data=ingresos_pendientes,
            message=f"Se encontraron {len(ingresos_pendientes)} ingresos pendientes"
        )
        
    except HTTPException as e:
        return error_response(
            error="PENDING_INGRESOS_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error obteniendo ingresos pendientes: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/estadisticas/resumen", summary="Obtener estadísticas de ingresos")
async def get_estadisticas_ingresos(
    fecha_inicio: Optional[date] = Query(None, description="Fecha inicio del período"),
    fecha_fin: Optional[date] = Query(None, description="Fecha fin del período"),
    current_user = Depends(get_current_user)
):
    """
    Obtener estadísticas de ingresos para un período
    
    - **fecha_inicio**: Fecha inicio del período (default: hace 30 días)
    - **fecha_fin**: Fecha fin del período (default: hoy)
    
    Incluye:
    - Total de ingresos por estado
    - Valor total de ingresos
    - Cantidad total ingresada
    - Proveedores activos
    - Productos ingresados
    
    Requiere permisos de lectura de ingresos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "read")
        
        stats = await obtener_estadisticas_ingresos(fecha_inicio, fecha_fin)
        
        return success_response(
            data=stats.dict(),
            message="Estadísticas de ingresos calculadas exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="INGRESOS_STATS_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas de ingresos: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.post("/estadisticas/actualizar", summary="Actualizar estadísticas de ingresos")
async def update_estadisticas_ingresos(
    current_user = Depends(get_current_user)
):
    """
    Recalcular y actualizar estadísticas de ingresos
    
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
        
        stats = await actualizar_estadisticas_ingresos()
        
        return success_response(
            data=stats,
            message="Estadísticas de ingresos actualizadas exitosamente"
        )
        
    except HTTPException as e:
        return error_response(
            error="INGRESOS_STATS_UPDATE_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error actualizando estadísticas de ingresos: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/template/excel", summary="Descargar template Excel para ingresos")
async def download_excel_template(
    current_user = Depends(get_current_user)
):
    """
    Descargar template de Excel para carga masiva de ingresos
    
    El template incluye:
    - Headers requeridos
    - Ejemplos de datos
    - Validaciones y comentarios
    
    Requiere permisos de lectura de ingresos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "read")
        
        import pandas as pd
        from fastapi.responses import Response
        import io
        
        # Crear DataFrame con template
        template_data = {
            'codigo_producto': ['PROD-001', 'PROD-002', 'PROD-003'],
            'proveedor': ['Proveedor ABC', 'Proveedor XYZ', 'Proveedor 123'],
            'cantidad_solicitada': [100, 50, 200],
            'cantidad_recibida': [95, 50, 180],
            'costo_unitario': [10.50, 25.00, 5.75],
            'factura': ['FAC-001', 'FAC-002', ''],
            'orden_compra': ['OC-001', '', 'OC-003'],
            'lote_serie': ['LOTE-A1', 'SERIE-B2', ''],
            'fecha_vencimiento': ['2025-12-31', '2026-06-30', ''],
            'ubicacion': ['A1-B2-C3', 'D4-E5-F6', 'G7-H8-I9'],
            'observaciones': ['Producto en buen estado', '', 'Revisar calidad']
        }
        
        df = pd.DataFrame(template_data)
        
        # Crear archivo Excel en memoria
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Escribir datos
            df.to_excel(writer, sheet_name='Ingresos', index=False)
            
            # Obtener workbook y worksheet para formateo
            workbook = writer.book
            worksheet = writer.sheets['Ingresos']
            
            # Formato para headers
            header_format = workbook.add_format({
                'bold': True,
                'text_wrap': True,
                'valign': 'top',
                'fg_color': '#D7E4BC',
                'border': 1
            })
            
            # Aplicar formato a headers
            for col_num, value in enumerate(df.columns.values):
                worksheet.write(0, col_num, value, header_format)
                worksheet.set_column(col_num, col_num, 15)  # Ancho de columna
            
            # Agregar instrucciones en una segunda hoja
            instrucciones = pd.DataFrame({
                'Campo': [
                    'codigo_producto',
                    'proveedor', 
                    'cantidad_solicitada',
                    'cantidad_recibida',
                    'costo_unitario',
                    'factura',
                    'orden_compra',
                    'lote_serie',
                    'fecha_vencimiento',
                    'ubicacion',
                    'observaciones'
                ],
                'Requerido': [
                    'SÍ', 'SÍ', 'SÍ', 'SÍ', 'SÍ',
                    'NO', 'NO', 'NO', 'NO', 'NO', 'NO'
                ],
                'Descripción': [
                    'Código único del producto (debe existir en el sistema)',
                    'Nombre del proveedor',
                    'Cantidad solicitada (número entero positivo)',
                    'Cantidad recibida (debe ser <= cantidad_solicitada)',
                    'Costo unitario del producto (decimal)',
                    'Número de factura del proveedor',
                    'Número de orden de compra',
                    'Lote o número de serie del producto',
                    'Fecha de vencimiento (formato YYYY-MM-DD)',
                    'Ubicación física asignada',
                    'Observaciones adicionales'
                ]
            })
            
            instrucciones.to_excel(writer, sheet_name='Instrucciones', index=False)
            
            # Formatear hoja de instrucciones
            worksheet_inst = writer.sheets['Instrucciones']
            for col_num, value in enumerate(instrucciones.columns.values):
                worksheet_inst.write(0, col_num, value, header_format)
            
            # Ajustar anchos de columna
            worksheet_inst.set_column(0, 0, 20)  # Campo
            worksheet_inst.set_column(1, 1, 10)  # Requerido
            worksheet_inst.set_column(2, 2, 50)  # Descripción
        
        output.seek(0)
        
        # Crear respuesta con archivo
        headers = {
            'Content-Disposition': 'attachment; filename="template_ingresos.xlsx"'
        }
        
        return Response(
            output.getvalue(),
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers=headers
        )
        
    except HTTPException as e:
        return error_response(
            error="TEMPLATE_DOWNLOAD_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error generando template Excel: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )

@router.get("/reportes/proveedor", summary="Reporte de ingresos por proveedor")
async def get_reporte_por_proveedor(
    fecha_inicio: Optional[date] = Query(None, description="Fecha inicio del período"),
    fecha_fin: Optional[date] = Query(None, description="Fecha fin del período"),
    top: int = Query(10, ge=1, le=50, description="Top N proveedores"),
    current_user = Depends(get_current_user)
):
    """
    Generar reporte de ingresos agrupados por proveedor
    
    - **fecha_inicio**: Fecha inicio del período (default: hace 30 días)
    - **fecha_fin**: Fecha fin del período (default: hoy)
    - **top**: Cantidad de proveedores a mostrar (default: 10, max: 50)
    
    Requiere permisos de lectura de ingresos
    """
    try:
        # Verificar permisos
        user_type = current_user["user"]["tipo_usuario"]
        check_ingresos_permission(user_type, "read")
        
        # Definir período por defecto
        if not fecha_inicio:
            fecha_inicio = (datetime.now() - timedelta(days=30)).date()
        if not fecha_fin:
            fecha_fin = datetime.now().date()
        
        from server.config.database import ingresos_collection
        
        # Pipeline de agregación
        pipeline = [
            {
                "$match": {
                    "estado_ingreso": 1,
                    "created_at": {
                        "$gte": datetime.combine(fecha_inicio, datetime.min.time()),
                        "$lte": datetime.combine(fecha_fin, datetime.max.time())
                    }
                }
            },
            {
                "$group": {
                    "_id": "$proveedor_ingreso",
                    "total_ingresos": {"$sum": 1},
                    "cantidad_total": {"$sum": "$cantidad_recibida"},
                    "valor_total": {"$sum": "$costo_total"},
                    "ingresos_validados": {
                        "$sum": {"$cond": [{"$eq": ["$condicion_ingreso", 2]}, 1, 0]}
                    },
                    "ingresos_pendientes": {
                        "$sum": {"$cond": [{"$eq": ["$condicion_ingreso", 1]}, 1, 0]}
                    },
                    "productos_distintos": {"$addToSet": "$producto_id"},
                    "ultimo_ingreso": {"$max": "$created_at"}
                }
            },
            {
                "$project": {
                    "proveedor": "$_id",
                    "total_ingresos": 1,
                    "cantidad_total": 1,
                    "valor_total": 1,
                    "ingresos_validados": 1,
                    "ingresos_pendientes": 1,
                    "productos_distintos": {"$size": "$productos_distintos"},
                    "ultimo_ingreso": 1,
                    "valor_promedio": {"$divide": ["$valor_total", "$total_ingresos"]},
                    "_id": 0
                }
            },
            {"$sort": {"valor_total": -1}},
            {"$limit": top}
        ]
        
        cursor = ingresos_collection().aggregate(pipeline)
        reporte_data = await cursor.to_list(length=top)
        
        # Calcular totales generales
        total_general = {
            "total_proveedores": len(reporte_data),
            "suma_ingresos": sum([item["total_ingresos"] for item in reporte_data]),
            "suma_cantidad": sum([item["cantidad_total"] for item in reporte_data]),
            "suma_valor": sum([item["valor_total"] for item in reporte_data]),
            "periodo_inicio": fecha_inicio,
            "periodo_fin": fecha_fin
        }
        
        resultado = {
            "reporte_por_proveedor": reporte_data,
            "totales": total_general,
            "parametros": {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin,
                "top_proveedores": top
            }
        }
        
        return success_response(
            data=resultado,
            message=f"Reporte generado para {len(reporte_data)} proveedores"
        )
        
    except HTTPException as e:
        return error_response(
            error="PROVIDER_REPORT_FAILED",
            message=e.detail,
            code=e.status_code
        )
    except Exception as e:
        logger.error(f"Error generando reporte por proveedor: {e}")
        return error_response(
            error="INTERNAL_ERROR",
            message="Error interno del servidor",
            code=500
        )