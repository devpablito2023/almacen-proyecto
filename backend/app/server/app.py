# backend/app/server/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from server.routes.auth import router as AuthRouter
from server.routes.usuarios import router as UsuariosRouter
from server.routes.productos import router as ProductosRouter
from server.routes.stock import router as StockRouter
from server.routes.ingresos import router as IngresosRouter  # NUEVO
from server.routes.kardex import router as KardexRouter      # NUEVO
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sistema Control de Almacén - API",
    summary="API completa para control de inventario y almacén",
    description="""
    Sistema integral de control de almacén que incluye:
    
    **FASE 1 (Completada):**
    - 🔐 **Autenticación y Autorización**: Login seguro con JWT
    - 👥 **Gestión de Usuarios**: CRUD completo con tipos de usuario
    - 📦 **Gestión de Productos**: Catálogo completo de productos
    - 📊 **Consulta de Stock**: Visualización y alertas de inventario
    
    **FASE 2 (Actual):**
    - 📥 **Módulo de Ingresos**: Registro y validación de ingresos
    - 📋 **Kardex Digital**: Trazabilidad completa de movimientos
    - 📈 **Analytics Avanzados**: Estadísticas y reportes
    - 📁 **Carga Masiva**: Procesamiento de archivos Excel
    
    **Próximas Fases:**
    - 📝 Órdenes de Trabajo y Solicitudes
    - 🚚 Despacho y Devoluciones
    - 📊 Dashboard Ejecutivo
    - 🔧 Optimizaciones y Producción
    
    ## Tipos de Usuario
    - **0**: Superusuario (acceso total)
    - **1**: Jefatura (supervisión y reportes)
    - **2**: Genera OT (crea órdenes de trabajo)
    - **3**: Valida solicitudes (aprueba solicitudes)
    - **4**: Almacén/Despacho (recibe y despacha)
    - **5**: Realiza ingresos (registra ingresos)
    
    ## Tecnologías
    - **Backend**: FastAPI + Python 3.9+
    - **Base de Datos**: MongoDB
    - **Autenticación**: JWT + bcrypt
    - **Documentación**: OpenAPI 3.0
    """,
    version="2.0.0",
    contact={
        "name": "Sistema Control de Almacén",
        "email": "soporte@controlalmacen.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para logging de requests
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = datetime.now()
    
    # Procesar request
    response = await call_next(request)
    
    # Calcular tiempo de procesamiento
    process_time = datetime.now() - start_time
    
    # Log básico (en producción usar structured logging)
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time.total_seconds():.3f}s"
    )
    
    return response

# Handler global para errores no capturados
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Error no capturado: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "Error interno del servidor",
            "code": 500
        }
    )

# Incluir rutas de los módulos
app.include_router(
    AuthRouter, 
    tags=["🔐 Autenticación"], 
    prefix="/auth"
)

app.include_router(
    UsuariosRouter, 
    tags=["👥 Usuarios"], 
    prefix="/usuarios"
)

app.include_router(
    ProductosRouter, 
    tags=["📦 Productos"], 
    prefix="/productos"
)

app.include_router(
    StockRouter, 
    tags=["📊 Stock"], 
    prefix="/stock"
)

# NUEVAS RUTAS FASE 2
app.include_router(
    IngresosRouter, 
    tags=["📥 Ingresos"], 
    prefix="/ingresos"
)

app.include_router(
    KardexRouter, 
    tags=["📋 Kardex"], 
    prefix="/kardex"
)

# Montar archivos estáticos
#app.mount("/static", StaticFiles(directory="server/static"), name="static")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Endpoints de utilidad
@app.get("/", summary="Información de la API")
async def root():
    """
    Endpoint raíz con información básica de la API
    """
    return {
        "message": "Sistema Control de Almacén - API",
        "version": "2.0.0",
        "status": "active",
        "fase_actual": "FASE 2 - Gestión de Ingresos",
        "documentation": "/docs",
        "timestamp": datetime.now(),
        "modules": {
            "fase_1": [
                "🔐 Autenticación y Autorización",
                "👥 Gestión de Usuarios", 
                "📦 Gestión de Productos",
                "📊 Consulta de Stock"
            ],
            "fase_2": [
                "📥 Módulo de Ingresos",
                "📋 Kardex Digital",
                "📈 Analytics Avanzados",
                "📁 Carga Masiva Excel"
            ],
            "proximas_fases": [
                "📝 Órdenes de Trabajo",
                "🚚 Despacho y Devoluciones", 
                "📊 Dashboard Ejecutivo",
                "🔧 Optimización y Producción"
            ]
        }
    }

@app.get("/health", summary="Health Check")
async def health_check():
    """
    Endpoint de verificación de salud del servicio
    """
    try:
        # Verificar conexión a base de datos
        from server.config.database import database_mongo
        await database_mongo.command("ping")
        
        return {
            "status": "healthy",
            "timestamp": datetime.now(),
            "version": "2.0.0",
            "database": "connected",
            "services": {
                "api": "active",
                "database": "connected",
                "auth": "active",
                "kardex": "active",
                "ingresos": "active"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "timestamp": datetime.now(),
                "error": str(e),
                "database": "disconnected"
            }
        )

@app.get("/stats", summary="Estadísticas Generales del Sistema")
async def system_stats():
    """
    Estadísticas generales del sistema
    Combina métricas de todos los módulos
    """
    try:
        from server.functions.usuarios import obtener_estadisticas_usuarios
        from server.functions.productos import obtener_estadistica_productos
        from server.functions.stock import obtener_estadistica_stock
        from server.functions.ingresos import actualizar_estadisticas_ingresos
        from server.functions.kardex import obtener_estadisticas_kardex
        
        # Obtener estadísticas de cada módulo
        stats = {
            "timestamp": datetime.now(),
            "sistema": {
                "version": "2.0.0",
                "fase_actual": "FASE 2",
                "uptime": "Sistema operativo"
            }
        }
        
        # Intentar obtener estadísticas de cada módulo
        try:
            stats["usuarios"] = await obtener_estadisticas_usuarios()
        except:
            stats["usuarios"] = {"error": "No disponible"}
            
        try:
            stats["productos"] = await obtener_estadistica_productos()
        except:
            stats["productos"] = {"error": "No disponible"}
            
        try:
            stats["stock"] = await obtener_estadistica_stock()
        except:
            stats["stock"] = {"error": "No disponible"}
            
        try:
            ingresos_stats = await actualizar_estadisticas_ingresos()
            stats["ingresos"] = ingresos_stats
        except:
            stats["ingresos"] = {"error": "No disponible"}
            
        try:
            stats["kardex"] = await obtener_estadisticas_kardex()
        except:
            stats["kardex"] = {"error": "No disponible"}
        
        return {
            "message": "Estadísticas del sistema obtenidas",
            "data": stats
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas del sistema: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "SYSTEM_STATS_ERROR",
                "message": "Error obteniendo estadísticas del sistema",
                "timestamp": datetime.now()
            }
        )

# Evento de inicio de aplicación
@app.on_event("startup")
async def startup_event():
    """
    Tareas a ejecutar al iniciar la aplicación
    """
    logger.info("🚀 Iniciando Sistema Control de Almacén v2.0.0")
    logger.info("📋 FASE 2: Gestión de Ingresos y Kardex")
    logger.info("🔗 API disponible en: http://localhost:7070")
    logger.info("📚 Documentación en: http://localhost:7070/docs")
    
    # Verificar conexión a base de datos
    try:
        from server.config.database import database_mongo
        await database_mongo.command("ping")
        logger.info("✅ Conexión a MongoDB establecida")
    except Exception as e:
        logger.error(f"❌ Error conectando a MongoDB: {e}")
    
    # Crear índices si no existen
    try:
        from server.config.database import crear_indices_fase2
        await crear_indices_fase2()
        logger.info("✅ Índices de base de datos verificados")
    except Exception as e:
        logger.error(f"❌ Error creando índices: {e}")

# Evento de cierre de aplicación  
@app.on_event("shutdown")
async def shutdown_event():
    """
    Tareas a ejecutar al cerrar la aplicación
    """
    logger.info("🛑 Cerrando Sistema Control de Almacén")
    logger.info("👋 Hasta la vista!")

# Metadata adicional para OpenAPI
tags_metadata = [
    {
        "name": "🔐 Autenticación",
        "description": "Operaciones de login, logout y gestión de tokens JWT",
    },
    {
        "name": "👥 Usuarios",
        "description": "CRUD completo de usuarios con diferentes tipos y permisos",
    },
    {
        "name": "📦 Productos",
        "description": "Gestión del catálogo de productos, categorías y características",
    },
    {
        "name": "📊 Stock",
        "description": "Consulta de inventario, alertas y valorización de stock",
    },
    {
        "name": "📥 Ingresos",
        "description": "**NUEVO EN FASE 2**: Registro, validación y procesamiento de ingresos de productos",
    },
    {
        "name": "📋 Kardex",
        "description": "**NUEVO EN FASE 2**: Trazabilidad completa de movimientos y operaciones de inventario",
    },
]

app.openapi_tags = tags_metadata