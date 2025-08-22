# backend/app/server/config/settings.py
import os
from typing import Optional, List
from pydantic import BaseSettings, validator
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Settings(BaseSettings):
   """Configuraciones de la aplicación"""
   
   # ===== CONFIGURACIÓN GENERAL =====
   app_name: str = "Sistema Control de Almacén"
   app_version: str = "1.0.0"
   app_description: str = "API REST para el sistema de control de almacén"
   environment: str = os.getenv("ENVIRONMENT", "development")
   debug: bool = os.getenv("DEBUG", "false").lower() == "true"
   log_level: str = os.getenv("LOG_LEVEL", "INFO")
   
   # ===== CONFIGURACIÓN DEL SERVIDOR =====
   host: str = "0.0.0.0"
   port: int = int(os.getenv("BACKEND_PORT", 7070))
   reload: bool = debug
   workers: int = 1
   
   # ===== BASE DE DATOS =====
   mongo_url: str = os.getenv("MONGO_URL", "")
   mongo_db_name: str = os.getenv("MONGO_DB_NAME", "almacen_control")
   mongo_user: str = os.getenv("MONGO_USER", "admin")
   mongo_password: str = os.getenv("MONGO_PASSWORD", "")
   mongo_host: str = "mongodb"
   mongo_port: int = int(os.getenv("MONGODB_PORT", 28000))
   
   @validator('mongo_url')
   def validate_mongo_url(cls, v):
       if not v:
           raise ValueError("MONGO_URL es requerida")
       return v
   
   # ===== SEGURIDAD =====
   jwt_secret: str = os.getenv("JWT_SECRET", "")
   jwt_algorithm: str = "HS256"
   jwt_expire_hours: int = int(os.getenv("JWT_EXPIRE_HOURS", 8))
   bcrypt_rounds: int = int(os.getenv("BCRYPT_ROUNDS", 12))
   secret_key: str = os.getenv("SECRET_KEY", "")
   
   @validator('jwt_secret')
   def validate_jwt_secret(cls, v):
       if not v or len(v) < 32:
           raise ValueError("JWT_SECRET debe tener al menos 32 caracteres")
       return v
   
   @validator('secret_key')
   def validate_secret_key(cls, v):
       if not v or len(v) < 32:
           raise ValueError("SECRET_KEY debe tener al menos 32 caracteres")
       return v
   
   # ===== CORS =====
   cors_origins: List[str] = [
       "http://localhost:9090",
       "http://127.0.0.1:9090",
       "http://localhost:3000",
       "http://127.0.0.1:3000"
   ]
   cors_allow_credentials: bool = True
   cors_allow_methods: List[str] = ["*"]
   cors_allow_headers: List[str] = ["*"]
   
   # ===== ARCHIVOS =====
   max_file_size: int = int(os.getenv("MAX_FILE_SIZE", 10485760))  # 10MB
   upload_folder: str = os.getenv("UPLOAD_FOLDER", "./static/uploads")
   images_folder: str = os.getenv("IMAGES_FOLDER", "./static/images")
   reports_folder: str = os.getenv("REPORTS_FOLDER", "./static/reports")
   allowed_image_extensions: List[str] = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
   allowed_document_extensions: List[str] = [".pdf", ".doc", ".docx", ".xls", ".xlsx"]
   
   # ===== LOGGING =====
   log_file: str = "logs/app.log"
   error_log_file: str = "logs/error.log"
   audit_log_file: str = "logs/audit.log"
   log_rotation: str = "daily"
   log_retention_days: int = 30
   log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
   
   # ===== REDIS (CACHE) =====
   redis_url: str = os.getenv("REDIS_URL", "redis://redis:6379")
   redis_enabled: bool = False  # Por ahora deshabilitado en Fase 1
   cache_expire_seconds: int = int(os.getenv("CACHE_EXPIRE_SECONDS", 3600))
   
   # ===== EMAIL/NOTIFICACIONES =====
   smtp_server: str = os.getenv("SMTP_SERVER", "")
   smtp_port: int = int(os.getenv("SMTP_PORT", 587))
   smtp_user: str = os.getenv("SMTP_USER", "")
   smtp_password: str = os.getenv("SMTP_PASSWORD", "")
   smtp_use_tls: bool = True
   email_enabled: bool = bool(smtp_server and smtp_user)
   
   # Email por defecto para notificaciones
   default_from_email: str = smtp_user
   admin_emails: List[str] = [
       email.strip() 
       for email in os.getenv("ALERT_EMAIL_RECIPIENTS", "").split(",") 
       if email.strip()
   ]
   
   # ===== CONFIGURACIONES DE NEGOCIO =====
   # Stock
   stock_check_interval: int = int(os.getenv("STOCK_CHECK_INTERVAL", 300))  # 5 minutos
   default_stock_minimo: int = 1
   default_stock_maximo: int = 100
   default_stock_critico: int = 0
   
   # Productos
   codigo_producto_prefix: str = "PRD"
   auto_generate_codes: bool = True
   require_product_images: bool = False
   
   # Usuarios
   password_min_length: int = 6
   password_require_special: bool = False
   max_login_attempts: int = 3
   session_timeout_hours: int = jwt_expire_hours
   
   # ===== CONFIGURACIONES DE PERFORMANCE =====
   db_connection_pool_size: int = 10
   db_max_overflow: int = 20
   db_pool_timeout: int = 30
   api_rate_limit_per_minute: int = 100
   max_concurrent_requests: int = 50
   
   # Paginación
   default_page_size: int = 20
   max_page_size: int = 100
   
   # ===== CONFIGURACIONES DE DESARROLLO =====
   enable_docs: bool = True
   docs_url: str = "/docs" if debug else None
   redoc_url: str = "/redoc" if debug else None
   openapi_url: str = "/openapi.json" if debug else None
   
   # Testing
   test_mode: bool = os.getenv("TEST_MODE", "false").lower() == "true"
   
   # ===== CONFIGURACIONES DE PRODUCCIÓN =====
   enable_monitoring: bool = not debug
   enable_metrics: bool = not debug
   enable_health_check: bool = True
   health_check_interval: int = 30
   
   # Backup
   auto_backup_enabled: bool = True
   backup_retention_days: int = 30
   backup_interval_hours: int = 24
   
   class Config:
       env_file = ".env"
       env_file_encoding = "utf-8"
       case_sensitive = False
   
   @property
   def is_development(self) -> bool:
       """Verificar si está en modo desarrollo"""
       return self.environment.lower() == "development"
   
   @property
   def is_production(self) -> bool:
       """Verificar si está en modo producción"""
       return self.environment.lower() == "production"
   
   @property
   def is_testing(self) -> bool:
       """Verificar si está en modo testing"""
       return self.test_mode or self.environment.lower() == "testing"
   
   def get_database_url(self) -> str:
       """Obtener URL completa de la base de datos"""
       return self.mongo_url
   
   def get_cors_config(self) -> dict:
       """Obtener configuración CORS"""
       return {
           "allow_origins": self.cors_origins if not self.is_production else [],
           "allow_credentials": self.cors_allow_credentials,
           "allow_methods": self.cors_allow_methods,
           "allow_headers": self.cors_allow_headers,
       }
   
   def get_jwt_config(self) -> dict:
       """Obtener configuración JWT"""
       return {
           "secret": self.jwt_secret,
           "algorithm": self.jwt_algorithm,
           "expire_hours": self.jwt_expire_hours
       }
   
   def get_logging_config(self) -> dict:
       """Obtener configuración de logging"""
       return {
           "version": 1,
           "disable_existing_loggers": False,
           "formatters": {
               "default": {
                   "format": self.log_format,
                   "datefmt": "%Y-%m-%d %H:%M:%S"
               },
               "detailed": {
                   "format": "%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s",
                   "datefmt": "%Y-%m-%d %H:%M:%S"
               }
           },
           "handlers": {
               "console": {
                   "class": "logging.StreamHandler",
                   "formatter": "default",
                   "level": self.log_level,
                   "stream": "ext://sys.stdout"
               },
               "file": {
                   "class": "logging.handlers.RotatingFileHandler",
                   "formatter": "detailed",
                   "level": self.log_level,
                   "filename": self.log_file,
                   "maxBytes": 10485760,  # 10MB
                   "backupCount": 5
               },
               "error_file": {
                   "class": "logging.handlers.RotatingFileHandler",
                   "formatter": "detailed",
                   "level": "ERROR",
                   "filename": self.error_log_file,
                   "maxBytes": 10485760,  # 10MB
                   "backupCount": 5
               }
           },
           "loggers": {
               "": {  # Root logger
                   "handlers": ["console", "file"],
                   "level": self.log_level,
                   "propagate": False
               },
               "uvicorn": {
                   "handlers": ["console"],
                   "level": "INFO",
                   "propagate": False
               },
               "uvicorn.access": {
                   "handlers": ["file"],
                   "level": "INFO",
                   "propagate": False
               },
               "fastapi": {
                   "handlers": ["console", "file"],
                   "level": "INFO",
                   "propagate": False
               }
           }
       }
   
   def validate_settings(self) -> List[str]:
       """Validar configuraciones y retornar lista de errores"""
       errors = []
       
       # Validar configuraciones críticas
       if not self.mongo_url:
           errors.append("MONGO_URL no configurada")
       
       if not self.jwt_secret or len(self.jwt_secret) < 32:
           errors.append("JWT_SECRET debe tener al menos 32 caracteres")
       
       if not self.secret_key or len(self.secret_key) < 32:
           errors.append("SECRET_KEY debe tener al menos 32 caracteres")
       
       # Validar configuraciones de archivos
       if self.max_file_size < 1024 * 1024:  # Mínimo 1MB
           errors.append("MAX_FILE_SIZE debe ser al menos 1MB")
       
       # Validar configuraciones de email si está habilitado
       if self.email_enabled:
           if not self.smtp_server:
               errors.append("SMTP_SERVER requerido cuando email está habilitado")
           if not self.smtp_user:
               errors.append("SMTP_USER requerido cuando email está habilitado")
       
       # Validar configuraciones de producción
       if self.is_production:
           if self.debug:
               errors.append("DEBUG debe ser False en producción")
           if not self.admin_emails:
               errors.append("ALERT_EMAIL_RECIPIENTS requerido en producción")
       
       return errors

# Crear instancia global de configuraciones
settings = Settings()

# Validar configuraciones al importar
validation_errors = settings.validate_settings()
if validation_errors:
   error_msg = "Errores de configuración:\n" + "\n".join(f"- {error}" for error in validation_errors)
   raise ValueError(error_msg)

# Configuraciones derivadas
DATABASE_URL = settings.get_database_url()
CORS_CONFIG = settings.get_cors_config()
JWT_CONFIG = settings.get_jwt_config()
LOGGING_CONFIG = settings.get_logging_config()

# Exports para fácil importación
__all__ = [
   "settings",
   "Settings",
   "DATABASE_URL",
   "CORS_CONFIG", 
   "JWT_CONFIG",
   "LOGGING_CONFIG"
]