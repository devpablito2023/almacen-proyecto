// database/init/02_create_indexes.js
db = db.getSiblingDB('almacen_control');

// Índices para usuarios
db.usuarios.createIndex({ "codigo_usuario": 1 }, { unique: true });
db.usuarios.createIndex({ "email_usuario": 1 }, { unique: true });
db.usuarios.createIndex({ "tipo_usuario": 1 });

// Índices para productos
db.productos.createIndex({ "codigo_producto": 1 }, { unique: true });
db.productos.createIndex({ "nombre_producto": "text" });
db.productos.createIndex({ "tipo_producto": 1 });
db.productos.createIndex({ "estado_producto": 1 });

// Índices para stock
db.stock.createIndex({ "producto_id": 1 }, { unique: true });
db.stock.createIndex({ "cantidad_disponible": 1 });

// Índices para históricos
db.h_productos.createIndex({ "created_at": -1 });
db.h_usuarios.createIndex({ "created_at": -1 });

// Índices para logs
db.log_general.createIndex({ "created_at": -1 });
db.contador_general.createIndex({ "modulo": 1 });

print('✅ Índices creados exitosamente');