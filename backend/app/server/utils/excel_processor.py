# backend/app/server/utils/excel_processor.py
import pandas as pd
import io
from typing import List, Dict, Any
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)

def validar_excel_ingresos(file_content: bytes) -> Dict[str, Any]:
    """Validar estructura y contenido del Excel de ingresos"""
    try:
        df = pd.read_excel(io.BytesIO(file_content))
        
        # Columnas requeridas
        columnas_requeridas = [
            'codigo_producto', 'cantidad_solicitada', 'costo_unitario',
            'proveedor_ingreso', 'factura_ingreso'
        ]
        
        # Columnas opcionales
        columnas_opcionales = [
            'orden_compra', 'lote_serie', 'fecha_vencimiento',
            'ubicacion_asignada', 'documento_ingreso', 'observaciones'
        ]
        
        errores = []
        warnings = []
        
        # Validar que el DataFrame no esté vacío
        if df.empty:
            errores.append("El archivo Excel está vacío")
            return {
                "valido": False,
                "errores": errores,
                "warnings": warnings,
                "filas_validas": 0,
                "total_filas": 0
            }
        
        # Validar columnas requeridas
        columnas_faltantes = [col for col in columnas_requeridas if col not in df.columns]
        if columnas_faltantes:
            errores.append(f"Columnas faltantes: {', '.join(columnas_faltantes)}")
        
        # Verificar columnas extra (no crítico, solo advertencia)
        columnas_conocidas = columnas_requeridas + columnas_opcionales
        columnas_extra = [col for col in df.columns if col not in columnas_conocidas]
        if columnas_extra:
            warnings.append(f"Columnas no reconocidas (serán ignoradas): {', '.join(columnas_extra)}")
        
        # Si faltan columnas críticas, no continuar con validaciones de datos
        if columnas_faltantes:
            return {
                "valido": False,
                "errores": errores,
                "warnings": warnings,
                "filas_validas": 0,
                "total_filas": len(df)
            }
        
        # Validar datos fila por fila
        filas_validas = 0
        
        for index, row in df.iterrows():
            fila_numero = index + 2  # +2 porque Excel empieza en 1 y tiene header
            errores_fila = []
            
            # Validar código de producto
            if pd.isna(row['codigo_producto']) or str(row['codigo_producto']).strip() == '':
                errores_fila.append("Código de producto vacío")
            else:
                codigo = str(row['codigo_producto']).strip()
                if len(codigo) < 2:
                    errores_fila.append("Código de producto muy corto (mínimo 2 caracteres)")
                elif len(codigo) > 50:
                    errores_fila.append("Código de producto muy largo (máximo 50 caracteres)")
            
            # Validar cantidad solicitada
            if pd.isna(row['cantidad_solicitada']):
                errores_fila.append("Cantidad solicitada vacía")
            else:
                try:
                    cantidad = float(row['cantidad_solicitada'])
                    if cantidad <= 0:
                        errores_fila.append("Cantidad debe ser mayor a 0")
                    elif cantidad != int(cantidad):
                        errores_fila.append("Cantidad debe ser un número entero")
                    elif cantidad > 999999:
                        errores_fila.append("Cantidad demasiado grande (máximo 999,999)")
                except (ValueError, TypeError):
                    errores_fila.append("Cantidad debe ser un número válido")
            
            # Validar costo unitario
            if pd.isna(row['costo_unitario']):
                errores_fila.append("Costo unitario vacío")
            else:
                try:
                    costo = float(row['costo_unitario'])
                    if costo < 0:
                        errores_fila.append("Costo unitario no puede ser negativo")
                    elif costo == 0:
                        warnings.append(f"Fila {fila_numero}: Costo unitario es cero")
                    elif costo > 999999:
                        errores_fila.append("Costo unitario demasiado alto (máximo 999,999)")
                except (ValueError, TypeError):
                    errores_fila.append("Costo unitario debe ser un número válido")
            
            # Validar proveedor
            if pd.isna(row['proveedor_ingreso']) or str(row['proveedor_ingreso']).strip() == '':
                errores_fila.append("Proveedor es requerido")
            else:
                proveedor = str(row['proveedor_ingreso']).strip()
                if len(proveedor) < 2:
                    errores_fila.append("Nombre de proveedor muy corto (mínimo 2 caracteres)")
                elif len(proveedor) > 100:
                    errores_fila.append("Nombre de proveedor muy largo (máximo 100 caracteres)")
            
            # Validar factura
            if pd.isna(row['factura_ingreso']) or str(row['factura_ingreso']).strip() == '':
                errores_fila.append("Factura es requerida")
            else:
                factura = str(row['factura_ingreso']).strip()
                if len(factura) > 50:
                    errores_fila.append("Número de factura muy largo (máximo 50 caracteres)")
            
            # Validar campos opcionales si están presentes
            if 'orden_compra' in df.columns and pd.notna(row['orden_compra']):
                orden = str(row['orden_compra']).strip()
                if len(orden) > 50:
                    errores_fila.append("Orden de compra muy larga (máximo 50 caracteres)")
            
            if 'lote_serie' in df.columns and pd.notna(row['lote_serie']):
                lote = str(row['lote_serie']).strip()
                if len(lote) > 50:
                    errores_fila.append("Lote/serie muy largo (máximo 50 caracteres)")
            
            if 'fecha_vencimiento' in df.columns and pd.notna(row['fecha_vencimiento']):
                try:
                    if isinstance(row['fecha_vencimiento'], str):
                        fecha_venc = pd.to_datetime(row['fecha_vencimiento']).date()
                    else:
                        fecha_venc = row['fecha_vencimiento']
                    
                    if fecha_venc <= date.today():
                        errores_fila.append("Fecha de vencimiento debe ser futura")
                except (ValueError, TypeError):
                    errores_fila.append("Fecha de vencimiento inválida")
            
            if 'ubicacion_asignada' in df.columns and pd.notna(row['ubicacion_asignada']):
                ubicacion = str(row['ubicacion_asignada']).strip()
                if len(ubicacion) > 50:
                    errores_fila.append("Ubicación muy larga (máximo 50 caracteres)")
            
            if 'documento_ingreso' in df.columns and pd.notna(row['documento_ingreso']):
                documento = str(row['documento_ingreso']).strip()
                if len(documento) > 100:
                    errores_fila.append("Documento muy largo (máximo 100 caracteres)")
            
            if 'observaciones' in df.columns and pd.notna(row['observaciones']):
                observaciones = str(row['observaciones']).strip()
                if len(observaciones) > 500:
                    errores_fila.append("Observaciones muy largas (máximo 500 caracteres)")
            
            # Si hay errores en esta fila, agregarlos al listado general
            if errores_fila:
                for error in errores_fila:
                    errores.append(f"Fila {fila_numero}: {error}")
            else:
                filas_validas += 1
        
        return {
            "valido": len(errores) == 0,
            "errores": errores,
            "warnings": warnings,
            "filas_validas": filas_validas,
            "total_filas": len(df)
        }
        
    except Exception as e:
        logger.error(f"Error validando Excel de ingresos: {e}")
        return {
            "valido": False,
            "errores": [f"Error procesando archivo: {str(e)}"],
            "warnings": [],
            "filas_validas": 0,
            "total_filas": 0
        }

def procesar_excel_ingresos(file_content: bytes) -> List[Dict[str, Any]]:
    """Procesar Excel y retornar lista de datos para ingresos"""
    try:
        df = pd.read_excel(io.BytesIO(file_content))
        
        if df.empty:
            raise ValueError("El archivo Excel está vacío")
        
        ingresos_data = []
        
        for index, row in df.iterrows():
            try:
                # Procesar campos requeridos
                ingreso = {
                    "codigo_producto": str(row['codigo_producto']).strip(),
                    "cantidad_solicitada": int(float(row['cantidad_solicitada'])),
                    "costo_unitario": float(row['costo_unitario']),
                    "proveedor_ingreso": str(row['proveedor_ingreso']).strip(),
                    "factura_ingreso": str(row['factura_ingreso']).strip()
                }
                
                # Procesar campos opcionales
                if 'orden_compra' in df.columns and pd.notna(row['orden_compra']):
                    valor = str(row['orden_compra']).strip()
                    ingreso["orden_compra"] = valor if valor else None
                else:
                    ingreso["orden_compra"] = None
                
                if 'lote_serie' in df.columns and pd.notna(row['lote_serie']):
                    valor = str(row['lote_serie']).strip()
                    ingreso["lote_serie"] = valor if valor else None
                else:
                    ingreso["lote_serie"] = None
                
                if 'fecha_vencimiento' in df.columns and pd.notna(row['fecha_vencimiento']):
                    try:
                        if isinstance(row['fecha_vencimiento'], str):
                            ingreso["fecha_vencimiento"] = pd.to_datetime(row['fecha_vencimiento']).date()
                        else:
                            ingreso["fecha_vencimiento"] = row['fecha_vencimiento']
                    except:
                        ingreso["fecha_vencimiento"] = None
                else:
                    ingreso["fecha_vencimiento"] = None
                
                if 'ubicacion_asignada' in df.columns and pd.notna(row['ubicacion_asignada']):
                    valor = str(row['ubicacion_asignada']).strip()
                    ingreso["ubicacion_asignada"] = valor if valor else None
                else:
                    ingreso["ubicacion_asignada"] = None
                
                if 'documento_ingreso' in df.columns and pd.notna(row['documento_ingreso']):
                    valor = str(row['documento_ingreso']).strip()
                    ingreso["documento_ingreso"] = valor if valor else None
                else:
                    ingreso["documento_ingreso"] = None
                
                if 'observaciones' in df.columns and pd.notna(row['observaciones']):
                    valor = str(row['observaciones']).strip()
                    ingreso["observaciones_ingreso"] = valor if valor else None
                else:
                    ingreso["observaciones_ingreso"] = None
                
                ingresos_data.append(ingreso)
                
            except Exception as e:
                logger.error(f"Error procesando fila {index + 2}: {e}")
                # Continuar con la siguiente fila en caso de error
                continue
        
        return ingresos_data
        
    except Exception as e:
        logger.error(f"Error procesando Excel de ingresos: {e}")
        raise ValueError(f"Error procesando archivo Excel: {str(e)}")