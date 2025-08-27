#!/usr/bin/env python3
# check_db.py - Verificar el contenido de la base de datos
import pymongo
from datetime import datetime
import sys

def check_database():
    try:
        # Conectar a MongoDB
        client = pymongo.MongoClient("mongodb://localhost:27017")
        
        print("🔗 Conectando a MongoDB local...")
        print(f"📋 Bases de datos disponibles: {client.list_database_names()}")
        
        # Verificar base de datos almacen_control
        db = client["almacen_control"]
        print(f"\n📁 Colecciones en 'almacen_control': {db.list_collection_names()}")
        
        # Verificar usuarios
        usuarios_count = db.usuarios.count_documents({})
        print(f"\n👥 Total usuarios: {usuarios_count}")
        
        if usuarios_count > 0:
            usuarios = list(db.usuarios.find({}, {"password_hash": 0}))  # Sin mostrar password
            for usuario in usuarios:
                print(f"   - {usuario}")
        
        # Verificar email específico
        admin_user = db.usuarios.find_one({"email_usuario": "admin@almacen.com"})
        if admin_user:
            print(f"\n✅ Usuario admin encontrado:")
            print(f"   Email: {admin_user['email_usuario']}")
            print(f"   Código: {admin_user['codigo_usuario']}")
            print(f"   Tipo: {admin_user['tipo_usuario']}")
            print(f"   Estado: {admin_user['estado_usuario']}")
        else:
            print(f"\n❌ Usuario admin@almacen.com NO encontrado")
            
        # Verificar contadores
        contadores = list(db.contador_general.find({}))
        print(f"\n🔢 Contadores ({len(contadores)}):")
        for contador in contadores:
            print(f"   - {contador}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    check_database()
