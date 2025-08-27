# backend/app/server/config/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId
from decouple import config
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import logging

# Cargar variables de entorno
load_dotenv()

# Configurar logging
logger = logging.getLogger(__name__)

# Variables de entorno para MongoDB
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:28000")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "almacen_db")

# Cliente de MongoDB
try:
    client = AsyncIOMotorClient(MONGO_URL)
    database_mongo = client[MONGO_DB_NAME]
    logger.info(f"✅ Configuración MongoDB: {MONGO_DB_NAME}")
except Exception as e:
    logger.error(f"❌ Error configurando MongoDB: {e}")
    raise

# Funciones para obtener colecciones
def collection(collection_name: str):
    """Obtener referencia a una colección"""
    return database_mongo.get_collection(collection_name)

# Colecciones principales - FASE 1
usuarios_collection = lambda: collection("usuarios")
productos_collection = lambda: collection("productos")
stock_collection = lambda: collection("stock")

# Colecciones principales - FASE 2 (NUEVAS)
ingresos_collection = lambda: collection("ingresos")
kardex_collection = lambda: collection("kardex")

# Colecciones de historial
h_usuarios_collection = lambda: collection("h_usuarios")
h_productos_collection = lambda: collection("h_productos")
h_ingresos_collection = lambda: collection("h_ingresos")  # NUEVA

# Colecciones de sistema
log_general_collection = lambda: collection("log_general")
stats_collection = lambda: collection("stats")
ids_collection = lambda: collection("ids")
contador_general_collection = lambda: collection("contador_general")

# Diccionario de tipos de operación para logs
TIPO_OPERACION = {
    1: "creado",
    2: "eliminado", 
    3: "reestablecido",
    4: "editado",
    5: "validado",      # NUEVO - Para validaciones
    6: "cancelado",     # NUEVO - Para cancelaciones
    7: "procesado",     # NUEVO - Para procesamientos masivos
    8: "importado"      # NUEVO - Para importaciones Excel
}

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



async def contador_general(modulo: str = "SIN_MODULO", tipo: int = 1):
    """
    Contador general de operaciones por módulo y fecha
    Actualizado para soportar nuevas operaciones de Fase 2
    """
    hoy = datetime.now().strftime("%d_%m_%Y")
    operacion = TIPO_OPERACION.get(tipo, "desconocido")
    
    if not operacion or operacion == "desconocido":
        logger.warning(f"Tipo de operación desconocido: {tipo}")
        return None

    campos_inc = {
        f"general.{operacion}": 1,
        f"{hoy}.{operacion}": 1
    }
    campos_set = {}

    try:
        # Verificar si el documento existe
        coincidencia = await contador_general_collection().find_one(
            {"modulo": str(modulo)}, 
            {"_id": 1, "created_at": 1}
        )

        if coincidencia:
            campos_set["updated_at"] = datetime.now()
            result = await contador_general_collection().update_one(
                {"modulo": modulo},
                {
                    "$inc": campos_inc,
                    "$set": campos_set
                },
                upsert=True
            )
        else:
            # Crear nuevo documento
            nuevo_documento = {
                "modulo": modulo,
                "general": {operacion: 1},
                hoy: {operacion: 1},
                "created_at": datetime.now()
            }
            result = await contador_general_collection().insert_one(nuevo_documento)

        return "ok"
    except Exception as e:
        logger.error(f"Error en contador_general: {e}")
        return None

async def estadistica_general(modulo: str = "SIN_MODULO"):
    """Obtener estadísticas generales de un módulo"""
    try:
        coincidencia = await contador_general_collection().find_one(
            {"modulo": str(modulo)}, 
            {"_id": 0}
        )
        return coincidencia if coincidencia else {}
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        return {}

async def log_activity(action: str, module: str, user_id: int, user_name: str, details: dict = None):
    """
    Registrar actividad en el log general
    Función mejorada para Fase 2
    """
    try:
        log_entry = {
            "timestamp": datetime.now(),
            "action": action,
            "module": module,
            "user_id": user_id,
            "user_name": user_name,
            "details": details or {},
            "ip_address": None,  # Se puede agregar desde el middleware
            "user_agent": None,  # Se puede agregar desde el middleware
            "session_id": None   # Se puede agregar desde el contexto de autenticación
        }
        
        await log_general_collection().insert_one(log_entry)
        
    except Exception as e:
        logger.error(f"Error registrando actividad: {e}")

async def crear_indices_basicos():
    """
    Crear índices básicos para optimizar consultas - FASE 1
    """
    try:
        # Índices para usuarios
        await usuarios_collection().create_index("email_usuario", unique=True)
        await usuarios_collection().create_index("codigo_usuario", unique=True)
        await usuarios_collection().create_index("tipo_usuario")
        await usuarios_collection().create_index("estado_usuario")
        
        # Índices para productos
        await productos_collection().create_index("codigo_producto", unique=True)
        await productos_collection().create_index("nombre_producto")
        await productos_collection().create_index("tipo_producto")
        await productos_collection().create_index("estado_producto")
        await productos_collection().create_index([("nombre_producto", "text"), ("descripcion_producto", "text")])
        
        # Índices para stock
        await stock_collection().create_index("producto_id", unique=True)
        await stock_collection().create_index("cantidad_total")
        await stock_collection().create_index("fecha_ultimo_movimiento")
        await stock_collection().create_index("estado_stock")
        await stock_collection().create_index("alerta_generada")
        
        # Índices para logs y sistema
        await log_general_collection().create_index([("timestamp", -1)])
        await log_general_collection().create_index("module")
        await log_general_collection().create_index("user_id")
        await log_general_collection().create_index("action")
        
        # Índices para contadores
        await contador_general_collection().create_index("modulo", unique=True)
        
        # Índices para estadísticas
        await stats_collection().create_index("_id", unique=True)
        
        logger.info("✅ Índices básicos (Fase 1) creados exitosamente")
        
    except Exception as e:
        logger.error(f"❌ Error creando índices básicos: {e}")

async def crear_indices_fase2():
    """
    Crear índices para las nuevas colecciones de FASE 2
    """
    try:
        # Ejecutar índices básicos primero
        await crear_indices_basicos()
        
        # Índices para ingresos
        await ingresos_collection().create_index("numero_ingreso", unique=True)
        await ingresos_collection().create_index("producto_id")
        await ingresos_collection().create_index("proveedor_ingreso")
        await ingresos_collection().create_index("condicion_ingreso")
        await ingresos_collection().create_index("estado_ingreso")
        await ingresos_collection().create_index("created_at")
        await ingresos_collection().create_index("fecha_vencimiento")
        await ingresos_collection().create_index([("proveedor_ingreso", "text")])
        await ingresos_collection().create_index([
            ("condicion_ingreso", 1),
            ("estado_ingreso", 1),
            ("created_at", -1)
        ])
        
        # Índices para kardex
        await kardex_collection().create_index("numero_movimiento", unique=True)
        await kardex_collection().create_index("producto_id")
        await kardex_collection().create_index("operacion_kardex")
        await kardex_collection().create_index("tipo_movimiento")
        await kardex_collection().create_index("fecha_movimiento")
        await kardex_collection().create_index("estado_kardex")
        await kardex_collection().create_index("solicitud_id")
        await kardex_collection().create_index("ot_numero")
        await kardex_collection().create_index("ingreso_id")
        await kardex_collection().create_index("realizado_por")
        await kardex_collection().create_index([
            ("producto_id", 1),
            ("fecha_movimiento", -1)
        ])
        await kardex_collection().create_index([
            ("operacion_kardex", 1),
            ("fecha_movimiento", -1)
        ])
        await kardex_collection().create_index([
            ("estado_kardex", 1),
            ("fecha_movimiento", -1)
        ])
        
        # Índices para histórico de ingresos
        await h_ingresos_collection().create_index("ingreso_id")
        await h_ingresos_collection().create_index("numero_ingreso")
        await h_ingresos_collection().create_index("fecha_accion")
        await h_ingresos_collection().create_index("accion")
        await h_ingresos_collection().create_index("realizado_por")
        
        # Índices para IDs (contadores)
        await ids_collection().create_index("_id", unique=True)
        
        # Índices compuestos para optimizar consultas frecuentes
        
        # Para reportes de ingresos por proveedor y fecha
        await ingresos_collection().create_index([
            ("proveedor_ingreso", 1),
            ("created_at", -1),
            ("estado_ingreso", 1)
        ])
        
        # Para consultas de kardex por producto y período
        await kardex_collection().create_index([
            ("producto_id", 1),
            ("fecha_movimiento", -1),
            ("estado_kardex", 1)
        ])
        
        # Para trazabilidad y auditoría
        await kardex_collection().create_index([
            ("documento_referencia", 1),
            ("numero_documento", 1)
        ])
        
        # Índice TTL para logs (opcional - eliminar logs antiguos después de 1 año)
        await log_general_collection().create_index(
            "timestamp", 
            expireAfterSeconds=31536000  # 365 días
        )
        
        logger.info("✅ Índices Fase 2 creados exitosamente")
        
    except Exception as e:
        logger.error(f"❌ Error creando índices Fase 2: {e}")

async def verificar_conexion():
    """Verificar conectividad con MongoDB"""
    try:
        await database_mongo.command("ping")
        return True
    except Exception as e:
        logger.error(f"Error de conexión MongoDB: {e}")
        return False

async def inicializar_datos_sistema():
    """
    Inicializar datos básicos del sistema si no existen
    """
    try:
        # Verificar si existe usuario superusuario
        superuser = await usuarios_collection().find_one({"tipo_usuario": 0})
        
        if not superuser:
            logger.info("👤 Creando usuario superusuario por defecto...")
            from server.functions.usuarios import crear_usuario
            from server.models.usuarios import UsuarioCreate
            from server.config.security import hash_password
            
            # Crear superusuario por defecto
            superuser_data = {
                "codigo_usuario": "ADMIN001",
                "nombre_usuario": "Administrador Sistema",
                "email_usuario": "admin@controlalmacen.com",
                "password_hash": hash_password("admin123"),  # Cambiar en producción
                "tipo_usuario": 0,
                "area_usuario": "Sistemas",
                "estado_usuario": 1,
                "created_at": datetime.now(),
                "created_by": 0,
                "created_by_name": "SISTEMA"
            }
            
            # Obtener próximo ID
            contador_usuario = await ids_collection().find_one({"id_usuario": {"$exists": True}})
            id_usuario = (contador_usuario["id_usuario"] + 1) if contador_usuario else 1
            
            superuser_data["id_usuario"] = id_usuario
            
            await usuarios_collection().insert_one(superuser_data)
            
            # Actualizar contador
            await ids_collection().update_one(
                {"_id": contador_usuario["_id"] if contador_usuario else None},
                {"$set": {"id_usuario": id_usuario, "fecha": datetime.now()}},
                upsert=True
            )
            
            logger.info(f"✅ Usuario superusuario creado: {superuser_data['email_usuario']}")
        
        # Inicializar colección de estadísticas si no existe
        stats_count = await stats_collection().count_documents({})
        if stats_count == 0:
            logger.info("📊 Inicializando colección de estadísticas...")
            
            # Crear documentos base para estadísticas
            stats_iniciales = [
                {
                    "_id": "usuarios_stats",
                    "total_usuarios": 1,
                    "usuarios_activos": 1,
                    "last_updated": datetime.now()
                },
                {
                    "_id": "productos_stats", 
                    "total_productos": 0,
                    "productos_activos": 0,
                    "last_updated": datetime.now()
                },
                {
                    "_id": "stock_stats",
                    "total_productos": 0,
                    "valor_total_inventario": 0,
                    "last_updated": datetime.now()
                },
                {
                    "_id": "ingresos_stats",
                    "total_ingresos": 0,
                    "ingresos_pendientes": 0,
                    "last_updated": datetime.now()
                },
                {
                    "_id": "kardex_stats",
                    "total_movimientos": 0,
                    "movimientos_hoy": 0,
                    "last_updated": datetime.now()
                }
            ]
            
            await stats_collection().insert_many(stats_iniciales)
            logger.info("✅ Estadísticas inicializadas")
        
    except Exception as e:
        logger.error(f"❌ Error inicializando datos del sistema: {e}")

async def limpiar_logs_antiguos(dias: int = 90):
    """
    Limpiar logs anteriores a X días
    """
    try:
        fecha_limite = datetime.now() - timedelta(days=dias)
        
        result = await log_general_collection().delete_many({
            "timestamp": {"$lt": fecha_limite}
        })
        
        if result.deleted_count > 0:
            logger.info(f"🧹 Eliminados {result.deleted_count} logs antiguos")
        
        return result.deleted_count
        
    except Exception as e:
        logger.error(f"❌ Error limpiando logs: {e}")
        return 0

async def backup_coleccion(collection_name: str, backup_path: str = None):
    """
    Función básica de respaldo de colección
    En producción usar herramientas específicas de MongoDB
    """
    try:
        if not backup_path:
            backup_path = f"backup_{collection_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        coleccion = collection(collection_name)
        documentos = await coleccion.find({}).to_list(length=None)
        
        # Convertir ObjectId a string para serialización JSON
        for doc in documentos:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
        
        import json
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(documentos, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"📁 Backup de {collection_name} creado: {backup_path}")
        return backup_path
        
    except Exception as e:
        logger.error(f"❌ Error creando backup: {e}")
        return None

# Funciones de utilidad para fechas
def obtener_inicio_mes(fecha: datetime = None):
    """Obtener primer día del mes"""
    if not fecha:
        fecha = datetime.now()
    return fecha.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

def obtener_fin_mes(fecha: datetime = None):
    """Obtener último día del mes"""
    if not fecha:
        fecha = datetime.now()
    
    if fecha.month == 12:
        siguiente_mes = fecha.replace(year=fecha.year + 1, month=1, day=1)
    else:
        siguiente_mes = fecha.replace(month=fecha.month + 1, day=1)
    
    return siguiente_mes - timedelta(days=1)

def obtener_inicio_semana(fecha: datetime = None):
    """Obtener primer día de la semana (lunes)"""
    if not fecha:
        fecha = datetime.now()
    
    dias_desde_lunes = fecha.weekday()
    inicio_semana = fecha - timedelta(days=dias_desde_lunes)
    return inicio_semana.replace(hour=0, minute=0, second=0, microsecond=0)

# Configuración de logging para base de datos
logging.getLogger('motor').setLevel(logging.WARNING)
logging.getLogger('pymongo').setLevel(logging.WARNING)

logger.info("📊 Configuración de base de datos completada - FASE 2")
logger.info(f"🔗 MongoDB URL: {MONGO_URL}")
logger.info(f"💾 Base de datos: {MONGO_DB_NAME}")