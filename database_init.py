#!/usr/bin/env python3
# database_init.py - Inicialización completa de la base de datos
import pymongo
from datetime import datetime
import sys

def init_database():
    try:
        # Conectar a MongoDB
        client = pymongo.MongoClient("mongodb://localhost:27017")
        db = client["almacen_control"]
        
        print("🔗 Conectando a MongoDB local...")
        
        # ===== PASO 1: CREAR COLECCIONES =====
        print("\n📁 Paso 1: Creando colecciones...")
        
        # Eliminar colecciones existentes si existen
        collections_to_drop = ['usuarios', 'productos', 'stock', 'h_productos', 'h_usuarios', 'contador_general', 'log_general']
        for collection_name in collections_to_drop:
            if collection_name in db.list_collection_names():
                db[collection_name].drop()
                print(f"   🗑️  Colección '{collection_name}' eliminada")
        
        # Crear colección usuarios con validación
        usuarios_validator = {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["codigo_usuario", "email_usuario", "password_hash", "tipo_usuario"],
                "properties": {
                    "codigo_usuario": {"bsonType": "string"},
                    "email_usuario": {"bsonType": "string"},
                    "tipo_usuario": {"bsonType": "int", "minimum": 0, "maximum": 5}
                }
            }
        }
        db.create_collection("usuarios", validator=usuarios_validator)
        print("   ✅ Colección 'usuarios' creada con validación")
        
        # Crear colección productos con validación
        productos_validator = {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["codigo_producto", "nombre_producto", "tipo_producto"],
                "properties": {
                    "codigo_producto": {"bsonType": "string"},
                    "nombre_producto": {"bsonType": "string"},
                    "tipo_producto": {"enum": ["insumo", "repuesto", "herramienta", "otro"]}
                }
            }
        }
        db.create_collection("productos", validator=productos_validator)
        print("   ✅ Colección 'productos' creada con validación")
        
        # Crear otras colecciones
        other_collections = ['stock', 'h_productos', 'h_usuarios', 'contador_general', 'log_general']
        for collection_name in other_collections:
            db.create_collection(collection_name)
            print(f"   ✅ Colección '{collection_name}' creada")
        
        # ===== PASO 2: CREAR ÍNDICES =====
        print("\n🔍 Paso 2: Creando índices...")
        
        # Índices para usuarios
        db.usuarios.create_index([("codigo_usuario", 1)], unique=True)
        db.usuarios.create_index([("email_usuario", 1)], unique=True)
        db.usuarios.create_index([("tipo_usuario", 1)])
        print("   ✅ Índices de 'usuarios' creados")
        
        # Índices para productos
        db.productos.create_index([("codigo_producto", 1)], unique=True)
        db.productos.create_index([("nombre_producto", "text")])
        db.productos.create_index([("tipo_producto", 1)])
        db.productos.create_index([("estado_producto", 1)])
        print("   ✅ Índices de 'productos' creados")
        
        # Índices para stock
        db.stock.create_index([("producto_id", 1)], unique=True)
        db.stock.create_index([("cantidad_disponible", 1)])
        print("   ✅ Índices de 'stock' creados")
        
        # Índices para históricos
        db.h_productos.create_index([("created_at", -1)])
        db.h_usuarios.create_index([("created_at", -1)])
        print("   ✅ Índices de históricos creados")
        
        # Índices para logs y contadores
        db.log_general.create_index([("created_at", -1)])
        db.contador_general.create_index([("modulo", 1)])
        print("   ✅ Índices de logs y contadores creados")
        
        # ===== PASO 3: INSERTAR DATOS INICIALES =====
        print("\n📊 Paso 3: Insertando datos iniciales...")
        
        # Usuario administrador por defecto
        admin_password = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmhndCD2ZjKneXa'  # admin123
        
        admin_user = {
            "id_usuario": 1,
            "codigo_usuario": "ADMIN001",
            "nombre_usuario": "Administrador",
            "email_usuario": "admin@almacen.com",
            "password_hash": admin_password,
            "tipo_usuario": 0,
            "area_usuario": "Sistemas",
            "estado_usuario": 1,
            "created_at": datetime.now(),
            "created_by": 0,
            "created_by_name": "Sistema"
        }
        
        db.usuarios.insert_one(admin_user)
        print("   ✅ Usuario administrador creado")
        
        # Contadores para IDs autoincrementales
        contadores = [
            {
                "modulo": "usuarios",
                "id_usuarios": 1,
                "created_at": datetime.now()
            },
            {
                "modulo": "productos", 
                "id_productos": 0,
                "created_at": datetime.now()
            },
            {
                "modulo": "stock",
                "id_stock": 0,
                "created_at": datetime.now()
            }
        ]
        
        db.contador_general.insert_many(contadores)
        print("   ✅ Contadores inicializados")
        
        print("\n🎉 ¡Base de datos inicializada exitosamente!")
        print("💡 Credenciales de acceso:")
        print("   Email: admin@almacen.com")
        print("   Password: admin123")
        print("   Rol: Superusuario (acceso completo)")
        
        # Mostrar estadísticas finales
        print(f"\n📈 Estadísticas:")
        print(f"   👥 Usuarios: {db.usuarios.count_documents({})}")
        print(f"   📦 Productos: {db.productos.count_documents({})}")
        print(f"   📊 Stock: {db.stock.count_documents({})}")
        print(f"   🔢 Contadores: {db.contador_general.count_documents({})}")
        
    except Exception as e:
        print(f"❌ Error durante la inicialización: {e}")
        sys.exit(1)
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    init_database()
