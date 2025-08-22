// database/init/03_seed_data.js
db = db.getSiblingDB('almacen_control');

// Usuario administrador por defecto
const adminPassword = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmhndCD2ZjKneXa'; // admin123

db.usuarios.insertOne({
  id_usuario: 1,
  codigo_usuario: "ADMIN001",
  nombre_usuario: "Administrador",
  email_usuario: "admin@almacen.com",
  password_hash: adminPassword,
  tipo_usuario: 0,
  area_usuario: "Sistemas",
  estado_usuario: 1,
  created_at: new Date(),
  created_by: 0,
  created_by_name: "Sistema"
});

// Contador para IDs autoincrementales
db.contador_general.insertOne({
  modulo: "usuarios",
  id_usuarios: 1,
  created_at: new Date()
});

db.contador_general.insertOne({
  modulo: "productos", 
  id_productos: 0,
  created_at: new Date()
});

db.contador_general.insertOne({
  modulo: "stock",
  id_stock: 0,
  created_at: new Date()
});

print('✅ Datos iniciales insertados exitosamente');