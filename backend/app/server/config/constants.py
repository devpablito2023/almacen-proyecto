# Constantes del Sistema de Control de Almacén

# === TIPOS DE USUARIO ===
TIPOS_USUARIO = {
    0: "SUPERUSUARIO",
    1: "JEFATURA", 
    2: "GENERA_OT",
    3: "VALIDA_SOLICITUDES",
    4: "ALMACEN_DESPACHO",
    5: "REALIZA_INGRESOS"
}

PERMISOS_POR_TIPO = {
    0: ["*"],  # Superusuario tiene todos los permisos
    1: ["consultar", "reportes", "dashboard", "configurar"],
    2: ["consultar", "crear_ot", "crear_solicitud", "dashboard"],
    3: ["consultar", "validar_solicitud", "dashboard"],
    4: ["consultar", "despachar", "recibir_devolucion", "dashboard"],
    5: ["consultar", "ingresar_productos", "dashboard"]
}

# === OPERACIONES KARDEX ===
OPERACIONES_KARDEX = {
    "INGRESO": {
        "descripcion": "Entrada de productos al almacén",
        "afecta_stock": "SUMA",
        "requiere_documento": True,
        "usuarios_permitidos": [0, 4, 5]
    },
    "SALIDA": {
        "descripcion": "Salida de productos del almacén",
        "afecta_stock": "RESTA",
        "requiere_documento": True,
        "usuarios_permitidos": [0, 4]
    },
    "DEVOLUCION": {
        "descripcion": "Devolución de productos al almacén",
        "afecta_stock": "SUMA",
        "requiere_documento": True,
        "usuarios_permitidos": [0, 4]
    },
    "AJUSTE_POSITIVO": {
        "descripcion": "Ajuste positivo de inventario",
        "afecta_stock": "SUMA",
        "requiere_documento": False,
        "usuarios_permitidos": [0, 1, 4]
    },
    "AJUSTE_NEGATIVO": {
        "descripcion": "Ajuste negativo de inventario",
        "afecta_stock": "RESTA",
        "requiere_documento": False,
        "usuarios_permitidos": [0, 1, 4]
    },
    "TRANSFERENCIA": {
        "descripcion": "Transferencia entre ubicaciones",
        "afecta_stock": "NEUTRAL",
        "requiere_documento": True,
        "usuarios_permitidos": [0, 4]
    }
}

# === TIPOS DE MOVIMIENTO ===
TIPOS_MOVIMIENTO = {
    "COMPRA": "Compra a proveedor",
    "DESPACHO": "Despacho a solicitud/OT", 
    "DEVOLUCION": "Devolución de materiales",
    "AJUSTE": "Ajuste de inventario",
    "TRANSFERENCIA": "Transferencia interna"
}

# === ESTADOS GENERALES ===
ESTADOS = {
    0: "INACTIVO/ELIMINADO",
    1: "ACTIVO"
}

# === CONDICIONES DE INGRESO ===
CONDICIONES_INGRESO = {
    0: "CANCELADO",
    1: "CREADO",
    2: "VALIDADO",
    3: "CANTIDAD_MODIFICADA"
}

# === CONDICIONES DE SOLICITUD ===
CONDICIONES_SOLICITUD = {
    0: "CANCELADA",
    1: "SOLICITADA",
    2: "ASIGNADA", 
    3: "DESPACHADA",
    4: "FINALIZADA"
}

# === CONDICIONES DE ASIGNACION ===
CONDICIONES_ASIGNACION = {
    1: "SOLICITADO",
    2: "VALIDADO",
    3: "DESPACHO_PARCIAL",
    4: "DESPACHO_TOTAL",
    5: "REAPERTURA"
}

# === ESTADOS DE DEVOLUCION ===
ESTADOS_DEVOLUCION = {
    0: "INACTIVO",
    1: "ACTIVO",
    2: "DEVOLUCION_PARCIAL", 
    3: "DEVOLUCION_TOTAL"
}

# === TIPOS DE PRODUCTO ===
TIPOS_PRODUCTO = [
    "INSUMO",
    "REPUESTO", 
    "HERRAMIENTA",
    "MATERIA_PRIMA",
    "PRODUCTO_TERMINADO",
    "CONSUMIBLE",
    "OTRO"
]

# === MAGNITUDES/UNIDADES ===
MAGNITUDES = [
    "UND",     # Unidad
    "KG",      # Kilogramo
    "LT",      # Litro
    "MT",      # Metro
    "M2",      # Metro cuadrado
    "M3",      # Metro cúbico
    "GL",      # Galón
    "LB",      # Libra
    "TON",     # Tonelada
    "DOC",     # Docena
    "CEN",     # Centena
    "MIL",     # Millar
    "PAR",     # Par
    "JGO",     # Juego
    "KIT",     # Kit
    "ROLL",    # Rollo
    "BOLS"     # Bolsa
]

# === PRIORIDADES ===
PRIORIDADES = {
    "BAJA": 1,
    "NORMAL": 2,
    "MEDIA": 3, 
    "ALTA": 4,
    "CRITICA": 5,
    "URGENTE": 6
}

# === TIPOS DE TRABAJO OT ===
TIPOS_TRABAJO_OT = [
    "MANTENIMIENTO_PREVENTIVO",
    "MANTENIMIENTO_CORRECTIVO",
    "INSTALACION",
    "PROYECTO",
    "EMERGENCIA",
    "MEJORA",
    "INSPECCION",
    "REPARACION"
]

# === ESTADOS DE OT ===
ESTADOS_OT = {
    0: "CANCELADA",
    1: "CREADA",
    2: "EN_PROCESO", 
    3: "PAUSADA",
    4: "FINALIZADA",
    5: "CERRADA"
}

# === CONFIGURACIÓN DE ARCHIVOS ===
CONFIGURACION_ARCHIVOS = {
    "EXCEL": {
        "extensiones_permitidas": [".xlsx", ".xls"],
        "tamaño_maximo": 10485760,  # 10MB
        "hojas_maximas": 5,
        "filas_maximas": 10000
    },
    "IMAGENES": {
        "extensiones_permitidas": [".jpg", ".jpeg", ".png", ".gif"],
        "tamaño_maximo": 5242880,  # 5MB
        "dimensiones_maximas": {"ancho": 2048, "alto": 2048}
    },
    "DOCUMENTOS": {
        "extensiones_permitidas": [".pdf", ".doc", ".docx"],
        "tamaño_maximo": 20971520  # 20MB
    }
}

# === CONFIGURACIÓN DE ALERTAS ===
CONFIGURACION_ALERTAS = {
    "STOCK_BAJO": {
        "umbral_porcentaje": 20,
        "nivel": "WARNING",
        "notificar": True
    },
    "STOCK_CRITICO": {
        "umbral_porcentaje": 10,
        "nivel": "CRITICAL", 
        "notificar": True
    },
    "STOCK_AGOTADO": {
        "umbral_cantidad": 0,
        "nivel": "CRITICAL",
        "notificar": True
    },
    "VENCIMIENTO_PROXIMO": {
        "dias_anticipacion": 30,
        "nivel": "WARNING",
        "notificar": True
    },
    "PRODUCTO_VENCIDO": {
        "nivel": "CRITICAL",
        "notificar": True
    },
    "SOLICITUD_VENCIDA": {
        "dias_vencimiento": 7,
        "nivel": "HIGH",
        "notificar": True
    },
    "OT_ATRASADA": {
        "dias_retraso": 1,
        "nivel": "HIGH", 
        "notificar": True
    }
}

# === CONFIGURACIÓN DE REPORTES ===
TIPOS_REPORTE = {
    "KARDEX_PRODUCTO": "Movimientos por producto",
    "KARDEX_GENERAL": "Todos los movimientos",
    "STOCK_ACTUAL": "Estado actual del stock",
    "STOCK_VALORIZADO": "Valorización del inventario",
    "INGRESOS_PERIODO": "Ingresos por período",
    "SALIDAS_PERIODO": "Salidas por período",
    "ROTACION_INVENTARIO": "Análisis de rotación",
    "PRODUCTOS_SIN_MOVIMIENTO": "Productos sin rotación",
    "OT_CONSUMOS": "Consumos por OT",
    "EFICIENCIA_ALMACEN": "Métricas de eficiencia"
}

FORMATOS_REPORTE = ["PDF", "EXCEL", "CSV", "JSON"]

# === CONFIGURACIÓN DE PAGINACIÓN ===
PAGINACION = {
    "limite_default": 50,
    "limite_maximo": 1000,
    "limite_minimo": 1
}

# === CONFIGURACIÓN DE CACHE ===
CONFIGURACION_CACHE = {
    "stock_ttl": 300,          # 5 minutos
    "productos_ttl": 3600,     # 1 hora
    "usuarios_ttl": 1800,      # 30 minutos
    "reportes_ttl": 900,       # 15 minutos
    "estadisticas_ttl": 600    # 10 minutos
}

# === CONFIGURACIÓN DE BACKUP ===
CONFIGURACION_BACKUP = {
    "frecuencia_horas": 24,
    "retencion_dias": 30,
    "incluir_historicos": True,
    "comprimir": True,
    "verificar_integridad": True
}

# === VALIDACIONES DE NEGOCIO ===
VALIDACIONES = {
    "CODIGO_PRODUCTO": {
        "longitud_minima": 3,
        "longitud_maxima": 20,
        "patron": r"^[A-Z0-9\-_]+$"
    },
    "NOMBRE_PRODUCTO": {
        "longitud_minima": 2,
        "longitud_maxima": 100
    },
    "CANTIDAD_MINIMA": 0.01,
    "PRECIO_MINIMO": 0.01,
    "STOCK_MINIMO_PERMITIDO": 0,
    "DIAS_VIDA_UTIL_MINIMOS": 1
}

# === MENSAJES DEL SISTEMA ===
MENSAJES = {
    "SUCCESS": {
        "CREADO": "Registro creado exitosamente",
        "ACTUALIZADO": "Registro actualizado exitosamente", 
        "ELIMINADO": "Registro eliminado exitosamente",
        "PROCESADO": "Operación procesada exitosamente"
    },
    "ERROR": {
        "NO_ENCONTRADO": "Registro no encontrado",
        "DUPLICADO": "Ya existe un registro con estos datos",
        "SIN_PERMISOS": "No tiene permisos para esta operación",
        "DATOS_INVALIDOS": "Los datos proporcionados son inválidos",
        "STOCK_INSUFICIENTE": "Stock insuficiente para la operación",
        "PRODUCTO_INACTIVO": "El producto está inactivo",
        "USUARIO_INACTIVO": "El usuario está inactivo"
    },
    "WARNING": {
        "STOCK_BAJO": "Stock por debajo del mínimo",
        "VENCIMIENTO_PROXIMO": "Producto próximo a vencer",
        "SOLICITUD_PENDIENTE": "Solicitud pendiente de procesamiento"
    }
}

# === CONFIGURACIÓN DE SEGURIDAD ===
CONFIGURACION_SEGURIDAD = {
    "JWT": {
        "algorithm": "HS256",
        "expiration_hours": 8,
        "refresh_expiration_days": 30
    },
    "PASSWORD": {
        "longitud_minima": 8,
        "requiere_mayuscula": True,
        "requiere_minuscula": True,
        "requiere_numero": True,
        "requiere_especial": False,
        "max_intentos_fallidos": 3,
        "tiempo_bloqueo_minutos": 30
    },
    "RATE_LIMITING": {
        "requests_per_minute": 100,
        "requests_per_hour": 1000
    }
}

# === CONFIGURACIÓN DE NOTIFICACIONES ===
CONFIGURACION_NOTIFICACIONES = {
    "EMAIL": {
        "servidor_smtp": "smtp.gmail.com",
        "puerto": 587,
        "usar_tls": True,
        "templates_path": "templates/email/"
    },
    "SISTEMA": {
        "mantener_dias": 30,
        "max_notificaciones_usuario": 100
    }
}

# === CONFIGURACIÓN DE LOGS ===
CONFIGURACION_LOGS = {
    "NIVEL": "INFO",
    "FORMATO": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "ARCHIVO_APP": "logs/app.log",
    "ARCHIVO_ERROR": "logs/error.log",
    "ARCHIVO_AUDIT": "logs/audit.log",
    "ROTACION_MB": 100,
    "BACKUP_COUNT": 10
}

# === CÓDIGOS DE ESTADO HTTP PERSONALIZADOS ===
CODIGOS_ESTADO = {
    200: "OK",
    201: "CREADO", 
    400: "SOLICITUD_INCORRECTA",
    401: "NO_AUTORIZADO",
    403: "PROHIBIDO",
    404: "NO_ENCONTRADO",
    409: "CONFLICTO",
    422: "ENTIDAD_NO_PROCESABLE",
    500: "ERROR_INTERNO_SERVIDOR"
}

# === CONFIGURACIÓN DE EXCEL TEMPLATES ===
EXCEL_TEMPLATES = {
    "PRODUCTOS": {
        "columnas_requeridas": [
            "codigo_producto",
            "nombre_producto", 
            "tipo_producto",
            "categoria_producto",
            "magnitud_producto"
        ],
        "columnas_opcionales": [
            "descripcion_producto",
            "proveedor_producto",
            "costo_unitario",
            "ubicacion_fisica",
            "stock_minimo",
            "stock_maximo"
        ]
    },
    "INGRESOS": {
        "columnas_requeridas": [
            "codigo_producto",
            "cantidad_ingreso",
            "costo_unitario"
        ],
        "columnas_opcionales": [
            "lote_serie",
            "fecha_vencimiento",
            "proveedor_ingreso",
            "documento_ingreso",
            "observaciones_ingreso"
        ]
    },
    "STOCK": {
        "columnas_requeridas": [
            "codigo_producto",
            "cantidad_ajuste",
            "motivo_ajuste"
        ],
        "columnas_opcionales": [
            "ubicacion_fisica",
            "lote_serie",
            "observaciones"
        ]
    }
}

# === MÉTRICAS Y KPIs ===
KPIS = {
    "ROTACION_INVENTARIO": {
        "formula": "costo_ventas_anual / stock_promedio",
        "objetivo_minimo": 6,
        "unidad": "veces/año"
    },
    "EXACTITUD_INVENTARIO": {
        "formula": "(stock_sistema / stock_fisico) * 100",
        "objetivo_minimo": 95,
        "unidad": "porcentaje"
    },
    "NIVEL_SERVICIO": {
        "formula": "(solicitudes_completas / total_solicitudes) * 100",
        "objetivo_minimo": 90,
        "unidad": "porcentaje"
    },
    "TIEMPO_DESPACHO": {
        "formula": "promedio(fecha_despacho - fecha_solicitud)",
        "objetivo_maximo": 24,
        "unidad": "horas"
    },
    "COSTO_ALMACENAMIENTO": {
        "formula": "gastos_almacen / valor_inventario_promedio",
        "objetivo_maximo": 15,
        "unidad": "porcentaje"
    }
}

# === CONFIGURACIÓN DE DASHBOARD ===
DASHBOARD_CONFIG = {
    "WIDGETS_DEFAULT": [
        "stock_critico",
        "movimientos_hoy", 
        "solicitudes_pendientes",
        "ot_activas",
        "valor_inventario",
        "alertas_activas"
    ],
    "GRAFICOS_DEFAULT": [
        "movimientos_mensual",
        "top_productos_solicitados",
        "rotacion_por_categoria",
        "eficiencia_despachos"
    ],
    "REFRESH_INTERVAL_SECONDS": 60,
    "DATOS_HISTORICOS_DIAS": 30
}

# === CONFIGURACIÓN DE API ===
API_CONFIG = {
    "VERSION": "2.0.0",
    "TITULO": "Sistema Control de Almacén API",
    "DESCRIPCION": "API RESTful para gestión integral de almacén",
    "CONTACTO": {
        "nombre": "Equipo de Desarrollo",
        "email": "dev@almacen.com"
    },
    "LICENCIA": {
        "nombre": "MIT"
    }
}

# === CONFIGURACIÓN DE BASE DE DATOS ===
DB_CONFIG = {
    "COLECCIONES": [
        "usuarios", "h_usuarios",
        "productos", "h_productos",
        "stock", "h_stock", 
        "ingresos", "h_ingresos",
        "kardex", "h_kardex",
        "ot", "h_ot",
        "solicitudes", "h_solicitudes",
        "asignaciones", "h_asignaciones",
        "colaboradores", "h_colaboradores",
        "ids", "contador_general", "log_general",
        "configuracion", "notificaciones"
    ],
    "INDICES": {
        "usuarios": ["codigo_usuario", "email_usuario", "tipo_usuario"],
        "productos": ["codigo_producto", "nombre_producto", "tipo_producto"],
        "stock": ["producto_id", "ubicacion_fisica"],
        "kardex": ["producto_id", "fecha_movimiento", "operacion_kardex"],
        "ingresos": ["producto_id", "fecha_recepcion", "condicion_ingreso"]
    }
}

# === CONFIGURACIÓN DE DESARROLLO ===
DEV_CONFIG = {
    "DEBUG": True,
    "LOG_LEVEL": "DEBUG",
    "RELOAD": True,
    "MOCK_DATA": True,
    "SEED_DATA": True
}

# === CONFIGURACIÓN DE PRODUCCIÓN ===
PROD_CONFIG = {
    "DEBUG": False,
    "LOG_LEVEL": "WARNING",
    "RELOAD": False,
    "MOCK_DATA": False,
    "SEED_DATA": False,
    "SSL_REQUIRED": True,
    "BACKUP_ENABLED": True
}