# Documentación Técnica de APIs - Sistema de Control de Almacén

## Información General

**Versión:** 1.0.0  
**Base URL:** `http://localhost:8000`  
**Formato de respuesta:** JSON  
**Autenticación:** Bearer Token (JWT)  

## Índice

1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Productos](#productos)
4. [Stock](#stock)
5. [Dashboard](#dashboard)
6. [Logs y Auditoría](#logs-y-auditoría)
7. [Códigos de Estado](#códigos-de-estado)
8. [Estructura de Respuestas](#estructura-de-respuestas)

---

## Autenticación

### POST /api/auth/login
Autenticar usuario en el sistema.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email_usuario": "admin@almacen.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 28800,
    "user": {
      "id_usuario": 1,
      "codigo_usuario": "ADMIN001",
      "nombre_usuario": "Administrador",
      "email_usuario": "admin@almacen.com",
      "tipo_usuario": 0,
      "area_usuario": "Sistemas",
      "estado_usuario": 1
    }
  },
  "code": 200,
  "timestamp": "2025-08-27T10:30:00.000Z"
}
```

### POST /api/auth/refresh
Renovar token de acceso.

**Headers:**
```
Authorization: Bearer <refresh_token>
Content-Type: application/json
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Token renovado exitosamente",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 28800
  }
}
```

### POST /api/auth/logout
Cerrar sesión del usuario.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

## Usuarios

### GET /api/usuarios/
Obtener lista de usuarios con paginación.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (int, opcional): Número de página (default: 1)
- `limit` (int, opcional): Elementos por página (default: 10)
- `search` (string, opcional): Búsqueda por nombre o email
- `estado` (int, opcional): Filtrar por estado (0=inactivo, 1=activo)

**Ejemplo:** `/api/usuarios/?page=1&limit=10&search=admin&estado=1`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": {
    "usuarios": [
      {
        "id_usuario": 1,
        "codigo_usuario": "ADMIN001",
        "nombre_usuario": "Administrador",
        "email_usuario": "admin@almacen.com",
        "tipo_usuario": 0,
        "area_usuario": "Sistemas",
        "estado_usuario": 1,
        "created_at": "2025-08-26T15:09:35.321000",
        "ultimo_login": "2025-08-27T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### GET /api/usuarios/{id}
Obtener usuario específico por ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (int): ID del usuario

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "id_usuario": 1,
    "codigo_usuario": "ADMIN001",
    "nombre_usuario": "Administrador",
    "email_usuario": "admin@almacen.com",
    "tipo_usuario": 0,
    "area_usuario": "Sistemas",
    "estado_usuario": 1
  }
}
```

### POST /api/usuarios/
Crear nuevo usuario.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "codigo_usuario": "USR001",
  "nombre_usuario": "Juan Pérez",
  "email_usuario": "juan@almacen.com",
  "password": "password123",
  "tipo_usuario": 1,
  "area_usuario": "Almacén",
  "estado_usuario": 1
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id_usuario": 2,
    "codigo_usuario": "USR001",
    "nombre_usuario": "Juan Pérez",
    "email_usuario": "juan@almacen.com"
  }
}
```

### PUT /api/usuarios/{id}
Actualizar usuario existente.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (int): ID del usuario

**Body:**
```json
{
  "nombre_usuario": "Juan Carlos Pérez",
  "area_usuario": "Logística",
  "estado_usuario": 1
}
```

### DELETE /api/usuarios/{id}
Eliminar usuario (soft delete).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (int): ID del usuario

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

## Productos

### GET /api/productos/
Obtener lista de productos con paginación y filtros.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (int, opcional): Número de página (default: 1)
- `limit` (int, opcional): Elementos por página (default: 10)
- `search` (string, opcional): Búsqueda por código o nombre
- `categoria` (string, opcional): Filtrar por categoría
- `tipo` (string, opcional): Filtrar por tipo
- `estado` (int, opcional): Filtrar por estado

**Ejemplo:** `/api/productos/?page=1&limit=10&search=TEST&categoria=Lubricantes`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Productos obtenidos exitosamente",
  "data": {
    "productos": [
      {
        "id_producto": 1,
        "codigo_producto": "STRING",
        "nombre_producto": "Aceite Motor 15W40",
        "descripcion_producto": "Aceite para motor diesel",
        "categoria_producto": "Lubricantes",
        "tipo_producto": "insumo",
        "unidad_medida": "litro",
        "precio_unitario": 15.50,
        "costo_unitario": 12.00,
        "stock_minimo": 10,
        "stock_critico": 5,
        "ubicacion_almacen": "A-01-01",
        "estado_producto": 1,
        "fecha_vencimiento": "2025-12-31T00:00:00",
        "proveedor": "Proveedor XYZ",
        "created_at": "2025-08-26T15:54:34.136000"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "pages": 1
    },
    "estadisticas": {
      "total_productos": 2,
      "productos_activos": 2,
      "productos_stock_bajo": 2,
      "valor_total_inventario": 20.0
    }
  }
}
```

### GET /api/productos/{id}
Obtener producto específico por ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (int): ID del producto

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Producto obtenido exitosamente",
  "data": {
    "id_producto": 1,
    "codigo_producto": "STRING",
    "nombre_producto": "Aceite Motor 15W40",
    "descripcion_producto": "Aceite para motor diesel",
    "categoria_producto": "Lubricantes",
    "tipo_producto": "insumo",
    "unidad_medida": "litro",
    "precio_unitario": 15.50,
    "costo_unitario": 12.00,
    "stock_minimo": 10,
    "stock_critico": 5,
    "ubicacion_almacen": "A-01-01",
    "estado_producto": 1,
    "stock_actual": {
      "cantidad_total": 5,
      "cantidad_disponible": 5,
      "cantidad_reservada": 0
    }
  }
}
```

### POST /api/productos/
Crear nuevo producto.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "codigo_producto": "PROD001",
  "nombre_producto": "Filtro de Aceite",
  "descripcion_producto": "Filtro de aceite para motor",
  "categoria_producto": "Repuestos Mecánicos",
  "tipo_producto": "repuesto",
  "unidad_medida": "unidad",
  "precio_unitario": 25.00,
  "costo_unitario": 18.00,
  "stock_minimo": 20,
  "stock_critico": 10,
  "ubicacion_almacen": "B-02-03",
  "proveedor": "Repuestos ABC"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "id_producto": 3,
    "codigo_producto": "PROD001",
    "nombre_producto": "Filtro de Aceite"
  }
}
```

### PUT /api/productos/{id}
Actualizar producto existente.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (int): ID del producto

**Body:**
```json
{
  "nombre_producto": "Filtro de Aceite HD",
  "precio_unitario": 28.00,
  "stock_minimo": 25
}
```

### DELETE /api/productos/{id}
Eliminar producto.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (int): ID del producto

---

## Stock

### GET /api/stock/
Obtener información de stock con paginación.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (int, opcional): Número de página
- `limit` (int, opcional): Elementos por página
- `producto_id` (int, opcional): Filtrar por producto
- `stock_bajo` (bool, opcional): Solo productos con stock bajo

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Stock obtenido exitosamente",
  "data": {
    "stock": [
      {
        "id_stock": 1,
        "producto_id": 1,
        "cantidad_total": 5,
        "cantidad_disponible": 5,
        "cantidad_reservada": 0,
        "ultimo_movimiento": "2025-08-27T09:00:00",
        "producto_info": {
          "codigo_producto": "STRING",
          "nombre_producto": "Aceite Motor 15W40",
          "stock_minimo": 10,
          "stock_critico": 5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "pages": 1
    }
  }
}
```

### POST /api/stock/movimiento
Registrar movimiento de stock (entrada/salida).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "producto_id": 1,
  "tipo_movimiento": "entrada", // "entrada" o "salida"
  "cantidad": 10,
  "motivo": "Compra a proveedor",
  "referencia": "ORDEN-001",
  "costo_unitario": 12.50
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Movimiento registrado exitosamente",
  "data": {
    "id_movimiento": 15,
    "stock_anterior": 5,
    "stock_nuevo": 15,
    "fecha_movimiento": "2025-08-27T10:30:00"
  }
}
```

---

## Dashboard

### GET /api/dashboard
Obtener estadísticas completas del dashboard.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Dashboard obtenido exitosamente",
  "data": {
    "stats": {
      "productos": 2,
      "productos_activos": 2,
      "stock_bajo": 2,
      "productos_sin_stock": 0,
      "solicitudes_pendientes": 0,
      "ot_activas": 0,
      "movimientos_hoy": 3,
      "usuarios_activos": 1,
      "total_usuarios": 1,
      "valor_total_inventario": 20.0,
      "actividad_reciente": 21,
      "alertas": {
        "stock_bajo": true,
        "sin_stock": false,
        "solicitudes_pendientes": false,
        "ot_vencidas": false
      },
      "ultima_actualizacion": "2025-08-27T10:50:46.521956"
    },
    "activity": {
      "actividad": [
        {
          "timestamp": "2025-08-27T09:25:31.213000",
          "action": "PRODUCT_CREATED",
          "user_id": 1,
          "user_name": "Administrador",
          "details": {
            "product_id": 5,
            "codigo": "TESTE4"
          }
        }
      ],
      "total": 10
    },
    "alerts": [
      {
        "id": "stock_critico_4",
        "tipo": "stock_critico",
        "titulo": "Stock Crítico",
        "mensaje": "Producto 'TESTE1' tiene stock bajo (0 unidades)",
        "prioridad": "alta",
        "timestamp": "2025-08-27T10:50:46.534471",
        "producto_id": 4,
        "cantidad": 0
      }
    ],
    "summary": {
      "productos_por_tipo": [
        {
          "tipo": "repuesto",
          "cantidad": 1,
          "porcentaje": 50
        }
      ],
      "productos_por_categoria": [
        {
          "categoria": "Repuestos Mecánicos",
          "cantidad": 1,
          "porcentaje": 50
        }
      ],
      "total_productos": 2
    }
  }
}
```

### GET /api/dashboard/stats
Obtener solo estadísticas básicas.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "productos": 2,
    "productos_activos": 2,
    "stock_bajo": 2,
    "valor_total_inventario": 20.0,
    "usuarios_activos": 1,
    "movimientos_hoy": 3
  }
}
```

### GET /api/dashboard/activity
Obtener actividad reciente.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `limit` (int, opcional): Número de actividades (default: 10)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "actividad": [
      {
        "timestamp": "2025-08-27T09:25:31.213000",
        "action": "PRODUCT_CREATED",
        "user_id": 1,
        "user_name": "Administrador",
        "details": {
          "product_id": 5,
          "codigo": "TESTE4"
        }
      }
    ],
    "total": 10
  }
}
```

### GET /api/dashboard/alerts
Obtener alertas del sistema.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "stock_critico_4",
      "tipo": "stock_critico",
      "titulo": "Stock Crítico",
      "mensaje": "Producto 'TESTE1' tiene stock bajo (0 unidades)",
      "prioridad": "alta",
      "timestamp": "2025-08-27T10:50:46.534471",
      "producto_id": 4,
      "cantidad": 0
    }
  ]
}
```

---

## Logs y Auditoría

### GET /api/logs/
Obtener logs del sistema.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (int, opcional): Número de página
- `limit` (int, opcional): Elementos por página
- `action` (string, opcional): Filtrar por tipo de acción
- `user_id` (int, opcional): Filtrar por usuario
- `fecha_inicio` (string, opcional): Fecha de inicio (ISO format)
- `fecha_fin` (string, opcional): Fecha de fin (ISO format)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "timestamp": "2025-08-27T09:25:31.213000",
        "action": "PRODUCT_CREATED",
        "user_id": 1,
        "user_name": "Administrador",
        "details": {
          "product_id": 5,
          "codigo": "TESTE4"
        },
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 21,
      "pages": 3
    }
  }
}
```

---

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Solicitud incorrecta (Bad Request) |
| 401 | No autorizado (Token inválido o expirado) |
| 403 | Prohibido (Sin permisos suficientes) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (Recurso ya existe) |
| 422 | Entidad no procesable (Errores de validación) |
| 500 | Error interno del servidor |

---

## Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Descripción de la operación",
  "data": {
    // Datos de respuesta
  },
  "code": 200,
  "timestamp": "2025-08-27T10:30:00.000Z"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": {
    "type": "ValidationError",
    "details": {
      "campo": ["Este campo es requerido"]
    }
  },
  "code": 422,
  "timestamp": "2025-08-27T10:30:00.000Z"
}
```

### Respuesta con Paginación
```json
{
  "success": true,
  "message": "Datos obtenidos exitosamente",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

## Tipos de Usuario

| Valor | Tipo | Descripción | Permisos |
|-------|------|-------------|----------|
| 0 | Admin | Administrador del sistema | Todos los permisos |
| 1 | Jefatura | Jefe de área | Gestión de usuarios y reportes |
| 2 | GeneraOT | Genera órdenes de trabajo | Crear y gestionar OT |
| 3 | ValidaSolicitudes | Valida solicitudes | Aprobar/rechazar solicitudes |
| 4 | Almacen | Personal de almacén | Gestión de stock y productos |
| 5 | RealizaIngresos | Realiza ingresos | Registrar entradas de stock |

---

## Tipos de Acciones (Logs)

- `LOGIN_SUCCESS` - Inicio de sesión exitoso
- `LOGIN_FAILED` - Intento de inicio de sesión fallido
- `LOGOUT` - Cierre de sesión
- `USER_CREATED` - Usuario creado
- `USER_UPDATED` - Usuario actualizado
- `USER_DELETED` - Usuario eliminado
- `PRODUCT_CREATED` - Producto creado
- `PRODUCT_UPDATED` - Producto actualizado
- `PRODUCT_DELETED` - Producto eliminado
- `STOCK_ENTRADA` - Entrada de stock
- `STOCK_SALIDA` - Salida de stock
- `STOCK_AJUSTE` - Ajuste de stock

---

## Autenticación y Seguridad

### JWT Token
Los tokens JWT tienen una duración de 8 horas (28800 segundos) y contienen:
- `user_id`: ID del usuario
- `email`: Email del usuario
- `tipo_usuario`: Tipo de usuario (permisos)
- `exp`: Fecha de expiración
- `iat`: Fecha de emisión

### Headers Requeridos
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Refresh Token
Los refresh tokens tienen una duración de 30 días y se usan para renovar el access token sin necesidad de volver a autenticarse.

---

## Ejemplos de Uso

### Autenticación y Uso Básico
```bash
# 1. Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email_usuario": "admin@almacen.com", "password": "password123"}'

# 2. Usar el token para obtener productos
curl -X GET "http://localhost:8000/api/productos/" \
  -H "Authorization: Bearer <access_token>"

# 3. Crear un producto
curl -X POST "http://localhost:8000/api/productos/" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_producto": "PROD001",
    "nombre_producto": "Filtro de Aceite",
    "categoria_producto": "Repuestos",
    "precio_unitario": 25.00
  }'
```

### Paginación y Filtros
```bash
# Obtener productos con filtros
curl -X GET "http://localhost:8000/api/productos/?page=1&limit=5&search=aceite&categoria=Lubricantes" \
  -H "Authorization: Bearer <access_token>"

# Obtener usuarios activos
curl -X GET "http://localhost:8000/api/usuarios/?estado=1&page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

---

## Notas Adicionales

1. **Timezone**: Todas las fechas están en formato ISO 8601 con timezone UTC
2. **Encoding**: UTF-8
3. **Rate Limiting**: No implementado actualmente
4. **Versionado**: La API no está versionada actualmente
5. **CORS**: Configurado para desarrollo local
6. **Logs**: Todas las operaciones sensibles son registradas en la tabla de logs

---

**Última actualización:** 27 de agosto de 2025  
**Mantenido por:** Equipo de Desarrollo Sistema de Almacén
