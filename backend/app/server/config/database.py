# backend/app/server/config/database.py
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Variables globales para la conexión
client: Optional[AsyncIOMotorClient] = None
database = None

# Configuración de la base de datos
MONGO_URL = os.getenv("MONGO_URL")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "almacen_control")

if not MONGO_URL:
    raise ValueError("MONGO_URL no está configurada en las variables de entorno")
print("jajaja")
async def connect_to_mongo():
    """Conectar a MongoDB"""
    print("jaja dentro de connect_to_mongo")
    global client, database
    
    try:
        logger.info("🔗 Conectando a MongoDB...")
        client = AsyncIOMotorClient(MONGO_URL)
        database = client[MONGO_DB_NAME]
        
        # Verificar conexión
        await client.admin.command('ping')
        logger.info("✅ Conexión a MongoDB exitosa")
        
    except Exception as e:
        logger.error(f"❌ Error conectando a MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Cerrar conexión a MongoDB"""
    global client
    
    if client:
        client.close()
        logger.info("🔐 Conexión a MongoDB cerrada")

def get_collection(collection_name: str):
    """Obtener una colección de MongoDB"""
    if database is None:
        raise RuntimeError("Base de datos no inicializada")
    
    return database[collection_name]

# Colecciones principales
usuarios_collection = lambda: get_collection("usuarios")
productos_collection = lambda: get_collection("productos")
stock_collection = lambda: get_collection("stock")
h_usuarios_collection = lambda: get_collection("h_usuarios")
h_productos_collection = lambda: get_collection("h_productos")
contador_collection = lambda: get_collection("contador_general")
log_collection = lambda: get_collection("log_general")

stats_collection = lambda: get_collection("stats")   # 👈 Nueva colección

# Función para generar ID autoincremental
async def get_next_id(modulo: str) -> int:
    """Generar próximo ID autoincremental para un módulo"""
    try:
        contador_col = contador_collection()
        
        # Buscar o crear contador para el módulo
        resultado = await contador_col.find_one_and_update(
            {"modulo": modulo},
            {
                "$inc": {f"id_{modulo}": 1},
                "$set": {"updated_at": datetime.now()}
            },
            upsert=True,
            return_document=True
        )
        
        return resultado[f"id_{modulo}"]
        
    except Exception as e:
        logger.error(f"Error generando ID para {modulo}: {e}")
        raise

# Función para registrar en histórico
async def save_to_history(
    collection_name: str,
    data: dict,
    action: str,
    user_id: int = 0,
    user_name: str = "Sistema"
):
    """Guardar registro en tabla histórica"""
    try:
        history_data = {
            **data,
            "action": action,
            "action_timestamp": datetime.now(),
            "action_by": user_id,
            "action_by_name": user_name
        }
        
        history_col = get_collection(f"h_{collection_name}")
        await history_col.insert_one(history_data)
        
        logger.debug(f"Registro guardado en histórico h_{collection_name}")
        
    except Exception as e:
        logger.error(f"Error guardando en histórico: {e}")

# Función para logging general
async def log_activity(
    action: str,
    module: str,
    user_id: int = 0,
    user_name: str = "Sistema",
    details: dict = None
):
    """Registrar actividad en log general"""
    try:
        log_data = {
            "action": action,
            "module": module,
            "user_id": user_id,
            "user_name": user_name,
            "details": details or {},
            "timestamp": datetime.now(),
            "ip_address": None,  # Se puede agregar después
            "user_agent": None   # Se puede agregar después
        }
        
        log_col = log_collection()
        await log_col.insert_one(log_data)
        
    except Exception as e:
        logger.error(f"Error registrando actividad: {e}")

# Eventos de startup y shutdown
async def startup_db_client():
    """Inicializar conexión DB al startup"""
    print("Starting up DB client... luis ")
    await connect_to_mongo()

async def shutdown_db_client():
    """Cerrar conexión DB al shutdown"""
    await close_mongo_connection()

logger.info("✅ Configuración de base de datos cargada")

#await startup_db_client()
if __name__ == "__main__":
    asyncio.run(startup_db_client())