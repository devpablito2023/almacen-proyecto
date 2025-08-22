Características del Dockerfile:
🏗️ Arquitectura Multi-Stage
1. Builder Stage

✅ Instala dependencias de compilación
✅ Compila packages Python pesados
✅ Optimiza el tamaño final

2. Production Stage

✅ Imagen mínima solo con runtime
✅ Usuario no-root para seguridad
✅ Healthcheck integrado
✅ Script de inicio inteligente
✅ Verificación de MongoDB

3. Development Stage

✅ Herramientas de desarrollo
✅ Hot reload habilitado
✅ Debugging tools

4. Testing Stage

✅ Framework de testing completo
✅ Coverage reports
✅ Script automatizado

🔒 Características de Seguridad

Usuario no-root: Ejecución segura
Dependencias mínimas: Solo lo necesario en producción
Permisos específicos: Archivos con ownership correcto

📊 Optimizaciones

Multi-stage build: Reduce tamaño de imagen final
Cache de layers: Optimiza rebuilds
Healthcheck: Monitoreo automático
Volúmenes: Persistencia de datos

🛠️ Para usar el Dockerfile:
bash
# Construir imagen de producción

docker build -t almacen-backend:latest .

# Construir imagen de desarrollo
docker build --target development -t almacen-backend:dev .

# Construir imagen de testing
docker build --target testing -t almacen-backend:test .

# Ejecutar contenedor
docker run -p 7070:7070 --env-file .env almacen-backend:latest