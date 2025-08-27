#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def clear_stats():
    try:
        # Usar la misma URL que en la configuración del backend
        client = AsyncIOMotorClient('mongodb://localhost:27017/')
        db = client.almacen_control  # Usar el nombre de la base de datos correcto
        result = await db.stats_collection.delete_one({'_id': 'productos_stats'})
        print(f'✅ Estadísticas de productos eliminadas: {result.deleted_count}')
        client.close()
    except Exception as e:
        print(f'❌ Error al conectar a MongoDB: {e}')

if __name__ == "__main__":
    asyncio.run(clear_stats())
