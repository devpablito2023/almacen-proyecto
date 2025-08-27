#!/usr/bin/env python3
# init_mongo.py
import pymongo
from datetime import datetime
import sys

def init_mongodb():
    try:
        # Conectar a MongoDB
        client = pymongo.MongoClient("mongodb://localhost:27017")
        db = client["almacen_control"]
        
        print("🔗 Conectando a MongoDB local...")
        
        # Verificar si ya existe el usuario admin
        existing_user = db.usuarios.find_one({"email_usuario": "admin@almacen.com"})
        if existing_user:
            print("✅ El usuario admin ya existe")
            return
        
        # Limpiar colecciones existentes
        db.usuarios.delete_many({})
        db.productos.delete_many({})
        db.stock.delete_many({})
        db.contador_general.delete_many({})
        
        # Insertar usuario administrador
        admin_user = {
            "id_usuario": 1,
            "codigo_usuario": "ADMIN001",
            "nombre_usuario": "Administrador",
            "email_usuario": "admin@almacen.com",
            "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmhndCD2ZjKneXa",  # admin123
            "tipo_usuario": 0,  # Superusuario
            "area_usuario": "Sistemas",
            "estado_usuario": 1,  # Activo
            "created_at": datetime.now(),
            "created_by": 0,
            "created_by_name": "Sistema"
        }
        
        db.usuarios.insert_one(admin_user)
        print("✅ Usuario admin creado exitosamente")
        
        # Insertar productos de ejemplo
        productos = [
            {
                "id_producto": 1,
                "codigo_producto": "PROD001",
                "nombre_producto": "Tornillo Hexagonal 1/4",
                "tipo_producto": "repuesto",
                "descripcion_producto": "Tornillo hexagonal de acero inoxidable",
                "magnitud_producto": "UND",
                "estado_producto": 1,
                "created_at": datetime.now()
            },
            {
                "id_producto": 2,
                "codigo_producto": "PROD002",
                "nombre_producto": "Aceite Motor 10W40",
                "tipo_producto": "insumo",
                "descripcion_producto": "Aceite sintético para motor",
                "magnitud_producto": "LT",
                "estado_producto": 1,
                "created_at": datetime.now()
            },
            {
                "id_producto": 3,
                "codigo_producto": "PROD003",
                "nombre_producto": "Martillo de Goma",
                "tipo_producto": "herramienta",
                "descripcion_producto": "Martillo de goma anti-rebote",
                "magnitud_producto": "UND",
                "estado_producto": 1,
                "created_at": datetime.now()
            }
        ]
        
        db.productos.insert_many(productos)
        print("✅ Productos de ejemplo creados")
        
        # Insertar stock inicial
        stock_items = [
            {
                "id_stock": 1,
                "producto_id": 1,
                "codigo_producto": "PROD001",
                "nombre_producto": "Tornillo Hexagonal 1/4",
                "cantidad_disponible": 500,
                "cantidad_reservada": 0,
                "cantidad_total": 500,
                "stock_minimo": 100,
                "stock_maximo": 1000,
                "created_at": datetime.now()
            },
            {
                "id_stock": 2,
                "producto_id": 2,
                "codigo_producto": "PROD002",
                "nombre_producto": "Aceite Motor 10W40",
                "cantidad_disponible": 50,
                "cantidad_reservada": 5,
                "cantidad_total": 55,
                "stock_minimo": 20,
                "stock_maximo": 200,
                "created_at": datetime.now()
            },
            {
                "id_stock": 3,
                "producto_id": 3,
                "codigo_producto": "PROD003",
                "nombre_producto": "Martillo de Goma",
                "cantidad_disponible": 10,
                "cantidad_reservada": 2,
                "cantidad_total": 12,
                "stock_minimo": 5,
                "stock_maximo": 50,
                "created_at": datetime.now()
            }
        ]
        
        db.stock.insert_many(stock_items)
        print("✅ Stock inicial creado")
        
        # Crear contadores
        contadores = [
            {"modulo": "usuarios", "id_usuarios": 1, "created_at": datetime.now()},
            {"modulo": "productos", "id_productos": 3, "created_at": datetime.now()},
            {"modulo": "stock", "id_stock": 3, "created_at": datetime.now()}
        ]
        
        db.contador_general.insert_many(contadores)
        print("✅ Contadores inicializados")
        
        print("\n🎉 Base de datos inicializada correctamente!")
        print("💡 Credenciales de acceso:")
        print("   Email: admin@almacen.com")
        print("   Password: admin123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_mongodb()
