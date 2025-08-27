// Crear base de datos y usuario
db = db.getSiblingDB('almacen_control');

// Crear usuario con permisos
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'almacen_control'
    }
  ]
});

// Crear colecciones
db.createCollection('usuarios');
db.createCollection('productos');
db.createCollection('stock');
db.createCollection('ot');
db.createCollection('solicitudes');
db.createCollection('asignaciones');
db.createCollection('ingresos');
db.createCollection('kardex');
db.createCollection('colaboradores');
db.createCollection('contador_general');
db.createCollection('log_general');

// Insertar usuario superadmin inicial
db.usuarios.insertOne({
  id_usuario: 1,
  codigo_usuario: "ADMIN001",
  nombre_usuario: 'Administrador',
  email_usuario: 'admin@almacen.com',
  password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewmhndCD2ZjKneXa', // password: admin123
  tipo_usuario: 0, // Superusuario
  area_usuario: "Sistemas",
  estado_usuario: 1,
  created_at: new Date(),
  created_by: 0,
  created_by_name: "Sistema"
});

// Insertar algunos productos de ejemplo
db.productos.insertMany([
  {
    id_producto: 1,
    codigo_producto: 'PROD001',
    nombre_producto: 'Tornillo Hexagonal 1/4',
    tipo_producto: 'repuesto',
    descripcion_producto: 'Tornillo hexagonal de acero inoxidable',
    magnitud_producto: 'UND',
    estado_producto: 1,
    created_at: new Date()
  },
  {
    id_producto: 2,
    codigo_producto: 'PROD002',
    nombre_producto: 'Aceite Motor 10W40',
    tipo_producto: 'insumo',
    descripcion_producto: 'Aceite sintético para motor',
    magnitud_producto: 'LT',
    estado_producto: 1,
    created_at: new Date()
  },
  {
    id_producto: 3,
    codigo_producto: 'PROD003',
    nombre_producto: 'Martillo de Goma',
    tipo_producto: 'herramienta',
    descripcion_producto: 'Martillo de goma anti-rebote',
    magnitud_producto: 'UND',
    estado_producto: 1,
    created_at: new Date()
  }
]);

// Insertar stock inicial
db.stock.insertMany([
  {
    id_stock: 1,
    producto_id: 1,
    codigo_producto: 'PROD001',
    nombre_producto: 'Tornillo Hexagonal 1/4',
    cantidad_disponible: 500,
    cantidad_reservada: 0,
    cantidad_total: 500,
    stock_minimo: 100,
    stock_maximo: 1000,
    created_at: new Date()
  },
  {
    id_stock: 2,
    producto_id: 2,
    codigo_producto: 'PROD002',
    nombre_producto: 'Aceite Motor 10W40',
    cantidad_disponible: 50,
    cantidad_reservada: 5,
    cantidad_total: 55,
    stock_minimo: 20,
    stock_maximo: 200,
    created_at: new Date()
  },
  {
    id_stock: 3,
    producto_id: 3,
    codigo_producto: 'PROD003',
    nombre_producto: 'Martillo de Goma',
    cantidad_disponible: 10,
    cantidad_reservada: 2,
    cantidad_total: 12,
    stock_minimo: 5,
    stock_maximo: 50,
    created_at: new Date()
  }
]);

// Crear contadores para IDs autoincrementales
db.contador_general.insertMany([
  {
    modulo: "usuarios",
    id_usuarios: 1,
    created_at: new Date()
  },
  {
    modulo: "productos", 
    id_productos: 3,
    created_at: new Date()
  },
  {
    modulo: "stock",
    id_stock: 3,
    created_at: new Date()
  }
]);

print('Base de datos inicializada correctamente');