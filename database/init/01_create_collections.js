// database/init/01_create_collections.js
db = db.getSiblingDB('almacen_control');

// Crear colecciones con validación
db.createCollection('usuarios', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["codigo_usuario", "email_usuario", "password_hash", "tipo_usuario"],
      properties: {
        codigo_usuario: { bsonType: "string" },
        email_usuario: { bsonType: "string" },
        tipo_usuario: { bsonType: "int", minimum: 0, maximum: 5 }
      }
    }
  }
});

db.createCollection('productos', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["codigo_producto", "nombre_producto", "tipo_producto"],
      properties: {
        codigo_producto: { bsonType: "string" },
        nombre_producto: { bsonType: "string" },
        tipo_producto: { enum: ["insumo", "repuesto", "herramienta", "otro"] }
      }
    }
  }
});

db.createCollection('stock');
db.createCollection('h_productos');  // Histórico productos
db.createCollection('h_usuarios');   // Histórico usuarios
db.createCollection('contador_general');
db.createCollection('log_general');

print('✅ Colecciones creadas exitosamente');