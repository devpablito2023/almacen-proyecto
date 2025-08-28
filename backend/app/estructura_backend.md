backend/app/
├── server/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── database.py        # Configuración MongoDB
│   │   ├── security.py        # Configuración JWT/Auth
│   │   └── settings.py        # Settings generales
│   ├── functions/
│   │   ├── __init__.py
│   │   ├── usuarios.py        # Lógica usuarios
│   │   ├── productos.py       # Lógica productos
│   │   ├── stock.py           # Lógica stock
│   │   └── auth.py            # Lógica autenticación
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py            # Middleware autenticación
│   │   ├── cors.py            # Configuración CORS
│   │   └── logging.py         # Middleware logging
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py            # Modelos base
│   │   ├── usuarios.py        # Schemas usuarios
│   │   ├── productos.py       # Schemas productos
│   │   ├── stock.py           # Schemas stock
│   │   └── responses.py       # Schemas responses
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py            # Endpoints auth
│   │   ├── usuarios.py        # Endpoints usuarios
│   │   ├── productos.py       # Endpoints productos
│   │   └── stock.py           # Endpoints stock
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── helpers.py         # Funciones útiles
│   │   ├── validators.py      # Validadores custom
│   │   └── file_handler.py    # Manejo archivos
│   └── app.py                 # Configuración FastAPI
├── static/
│   ├── uploads/               # Archivos subidos
│   └── images/                # Imágenes productos
├── logs/                      # Archivos de log
└── main.py                    # Punto de entrada


Características de las Rutas:
🔐 Seguridad Integrada

Autenticación JWT en todos los endpoints protegidos
Verificación de permisos por tipo de usuario
Logging detallado de todas las operaciones

📊 Endpoints Implementados
Auth (7 endpoints):

POST /auth/login - Iniciar sesión
POST /auth/refresh - Renovar token
POST /auth/change-password - Cambiar contraseña
POST /auth/logout - Cerrar sesión
GET /auth/me - Datos usuario actual
POST /auth/verify-token - Verificar token
GET /health - Estado del sistema

Usuarios (6 endpoints):

POST /usuarios/ - Crear usuario
GET /usuarios/ - Listar usuarios
GET /usuarios/{id} - Obtener usuario
PUT /usuarios/{id} - Actualizar usuario
DELETE /usuarios/{id} - Eliminar usuario
GET /usuarios/search/ - Buscar usuarios

Productos (10 endpoints):

POST /productos/ - Crear producto
GET /productos/ - Listar productos
GET /productos/autocomplete - Autocompletar
GET /productos/search - Buscar productos
GET /productos/{id} - Obtener producto
PUT /productos/{id} - Actualizar producto
DELETE /productos/{id} - Eliminar producto
POST /productos/{id}/upload-image - Subir imagen
GET /productos/validate/codigo/{codigo} - Validar código

Stock (7 endpoints):

GET /stock/ - Consultar stock
GET /stock/producto/{id} - Stock por producto
POST /stock/ajustar - Ajustar stock
GET /stock/alertas - Alertas de stock
GET /stock/valoracion - Valorización
GET /stock/movimientos - Movimientos
GET /stock/resumen - Resumen ejecutivo

✨ Funcionalidades Destacadas

Paginación automática en listados
Filtros avanzados en búsquedas
Validaciones robustas
Manejo de errores estandarizado
Respuestas consistentes con códigos HTTP apropiados
Documentación automática con OpenAPI/Swagger

¿Necesitas que continúe con los archivos de middleware o algún otro componente específico?


pip install PyJWT
