# backend/Dockerfile

# ===== ETAPA DE BUILD =====
FROM python:3.11-slim as builder

# Metadatos
LABEL maintainer="Sistema Control de Almacén"
LABEL version="1.0.0"
LABEL description="Backend FastAPI para Sistema de Control de Almacén"

# Variables de entorno para el build
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalar dependencias del sistema necesarias para el build
RUN apt-get update && apt-get install -y \
   build-essential \
   libmagic1 \
   libmagic-dev \
   libjpeg-dev \
   libpng-dev \
   libfreetype6-dev \
   zlib1g-dev \
   liblcms2-dev \
   libwebp-dev \
   libharfbuzz-dev \
   libfribidi-dev \
   libxcb1-dev \
   pkg-config \
   && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /build

# Copiar requirements y instalar dependencias Python
COPY requirements.txt .
RUN pip install --upgrade pip wheel setuptools && \
   pip install --user --no-warn-script-location -r requirements.txt

# ===== ETAPA DE PRODUCCIÓN =====
FROM python:3.11-slim as production

# Variables de entorno para producción
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app

# Instalar solo dependencias runtime
RUN apt-get update && apt-get install -y \
   libmagic1 \
   libjpeg62-turbo \
   libpng16-16 \
   libfreetype6 \
   libwebp7 \
   libharfbuzz0b \
   libfribidi0 \
   liblcms2-2 \
   curl \
   && rm -rf /var/lib/apt/lists/* \
   && apt-get autoremove -y \
   && apt-get autoclean

# Crear usuario no-root para seguridad
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copiar dependencias Python desde builder
COPY --from=builder /root/.local /root/.local

# Crear estructura de directorios
RUN mkdir -p /app/static/uploads \
   /app/static/images/products \
   /app/static/images/users \
   /app/static/images/thumbnails \
   /app/static/reports \
   /app/logs \
   && chown -R appuser:appuser /app

# Establecer directorio de trabajo
WORKDIR /app

# Copiar código de la aplicación
COPY --chown=appuser:appuser ./app ./

# Crear script de inicio
RUN echo '#!/bin/bash\n\
echo "🚀 Iniciando Sistema Control de Almacén - Backend"\n\
echo "📊 Ambiente: ${ENVIRONMENT:-development}"\n\
echo "🔧 Debug: ${DEBUG:-false}"\n\
echo "🗄️  MongoDB: ${MONGO_DB_NAME:-almacen_control}"\n\
echo ""\n\
\n\
# Verificar conexión a MongoDB\n\
echo "🔍 Verificando conexión a MongoDB..."\n\
python -c "\n\
import asyncio\n\
from motor.motor_asyncio import AsyncIOMotorClient\n\
import os\n\
\n\
async def check_mongo():\n\
   try:\n\
       client = AsyncIOMotorClient(os.getenv(\"MONGO_URL\"))\n\
       await client.admin.command(\"ping\")\n\
       print(\"✅ Conexión a MongoDB exitosa\")\n\
       client.close()\n\
       return True\n\
   except Exception as e:\n\
       print(f\"❌ Error conectando a MongoDB: {e}\")\n\
       return False\n\
\n\
if not asyncio.run(check_mongo()):\n\
   print(\"⏳ Esperando MongoDB...\")\n\
   import time\n\
   time.sleep(5)\n\
   if not asyncio.run(check_mongo()):\n\
       print(\"💥 No se pudo conectar a MongoDB\")\n\
       exit(1)\n\
"\n\
\n\
echo ""\n\
echo "🌐 Iniciando servidor FastAPI en puerto ${BACKEND_PORT:-7070}"\n\
echo "📚 Documentación disponible en: http://localhost:${BACKEND_PORT:-7070}/docs"\n\
echo ""\n\
\n\
# Ejecutar aplicación\n\
exec python main.py' > /app/start.sh \
   && chmod +x /app/start.sh \
   && chown appuser:appuser /app/start.sh

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
   CMD curl -f http://localhost:${BACKEND_PORT:-7070}/health || exit 1

# Cambiar a usuario no-root
USER appuser

# Exponer puerto
EXPOSE 7070

# Volúmenes para persistencia
VOLUME ["/app/static", "/app/logs"]

# Comando por defecto
CMD ["/app/start.sh"]

# ===== ETAPA DE DESARROLLO =====
FROM production as development

# Cambiar a root temporalmente para instalar dependencias de desarrollo
USER root

# Instalar dependencias de desarrollo
RUN pip install --no-cache-dir \
   pytest==7.4.3 \
   pytest-asyncio==0.21.1 \
   pytest-cov==4.1.0 \
   black==23.11.0 \
   flake8==6.1.0 \
   isort==5.12.0 \
   mypy==1.7.1

# Instalar herramientas de desarrollo
RUN apt-get update && apt-get install -y \
   git \
   vim \
   htop \
   && rm -rf /var/lib/apt/lists/*

# Volver a usuario no-root
USER appuser

# Variables de entorno para desarrollo
ENV DEBUG=true
ENV ENVIRONMENT=development
ENV LOG_LEVEL=DEBUG

# Comando para desarrollo (con hot reload)
CMD ["python", "main.py"]

# ===== ETAPA DE TESTING =====
FROM development as testing

USER root

# Copiar tests
COPY --chown=appuser:appuser ./tests /app/tests/

# Script para ejecutar tests
RUN echo '#!/bin/bash\n\
echo "🧪 Ejecutando tests del Sistema Control de Almacén"\n\
echo ""\n\
\n\
# Ejecutar tests con coverage\n\
pytest tests/ -v --cov=server --cov-report=html --cov-report=term-missing --cov-fail-under=80\n\
\n\
echo ""\n\
echo "📊 Reporte de coverage disponible en: /app/htmlcov/index.html"\n\
' > /app/run-tests.sh \
   && chmod +x /app/run-tests.sh \
   && chown appuser:appuser /app/run-tests.sh

USER appuser

# Variables de entorno para testing
ENV ENVIRONMENT=testing
ENV TEST_MODE=true

# Comando para testing
CMD ["/app/run-tests.sh"]