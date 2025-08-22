# backend/app/server/app.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import logging
from datetime import datetime

# Importar rutas
from server.routes.auth import router as AuthRouter
from server.routes.usuarios import router as UsuariosRouter
from server.routes.productos import router as ProductosRouter
from server.routes.stock import router as StockRouter


from server.config import database
#from server.config.database import startup_db_client, shutdown_db_client ,connect_to_mongo
# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
print("aqui activa bd")
#pasa =  startup_db_client()
#ok = database.connect_to_mongo()


logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema Control de Almacén - API",
    description="API REST para el sistema de control de almacén",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


@app.on_event("startup")
async def startup():
    await database.startup_db_client()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Middleware para logging de requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    
    # Procesar request
    response = await call_next(request)
    
    # Calcular tiempo de procesamiento
    process_time = datetime.now() - start_time
    
    # Log de la request
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time.total_seconds():.3f}s"
    )
    
    return response

# Handler global de errores
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error global: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Error interno del servidor",
            "message": "Por favor contacte al administrador",
            "code": 500
        }
    )

# Incluir routers
app.include_router(
    AuthRouter, 
    prefix="/api/auth", 
    tags=["Autenticación"]
)

app.include_router(
    UsuariosRouter, 
    prefix="/api/usuarios", 
    tags=["Usuarios"]
)

app.include_router(
    ProductosRouter, 
    prefix="/api/productos", 
    tags=["Productos"]
)

app.include_router(
    StockRouter, 
    prefix="/api/stock", 
    tags=["Stock"]
)

# Endpoint de salud
@app.get("/health", tags=["Sistema"])
async def health_check():
    return {
        "status": "OK",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "version": "1.0.0"
    }

# Endpoint raíz
@app.get("/", tags=["Sistema"])
async def read_root():
    return {
        "message": "Sistema Control de Almacén - API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

logger.info("✅ Aplicación FastAPI configurada exitosamente")