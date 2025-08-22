# backend/app/server/utils/validators.py
import re
import mimetypes
from typing import List, Optional, Union, Any
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class EmailValidator:
    """Validador de emails"""
    
    # Regex más estricto para emails
    EMAIL_REGEX = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    # Dominios comunes bloqueados (temporales, etc.)
    BLOCKED_DOMAINS = {
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
        'mailinator.com', 'throwaway.email', 'temp-mail.org'
    }
    
    @classmethod
    def validate(cls, email: str) -> bool:
        """Validar formato de email"""
        if not email or not isinstance(email, str):
            return False
        
        email = email.lower().strip()
        
        # Verificar formato básico
        if not cls.EMAIL_REGEX.match(email):
            return False
        
        # Verificar longitud
        if len(email) > 254:  # RFC 5321
            return False
        
        # Verificar partes
        local, domain = email.rsplit('@', 1)
        
        # Validar parte local
        if len(local) > 64 or len(local) == 0:
            return False
        
        # Validar dominio
        if domain in cls.BLOCKED_DOMAINS:
            return False
        
        return True
    
    @classmethod
    def normalize(cls, email: str) -> str:
        """Normalizar email"""
        if not email:
            return ""
        
        return email.lower().strip()

class PhoneValidator:
    """Validador de teléfonos"""
    
    # Regex para diferentes formatos
    PHONE_PATTERNS = [
        re.compile(r'^\+?[1-9]\d{1,14}$'),  # E.164
        re.compile(r'^[\+]?[\d\s\-\(\)]{7,15}$'),  # Formato flexible
        re.compile(r'^\(\d{3}\)\s?\d{3}-?\d{4}$'),  # (555) 555-5555
        re.compile(r'^\d{3}-?\d{3}-?\d{4}$'),  # 555-555-5555
    ]
    
    @classmethod
    def validate(cls, phone: str) -> bool:
        """Validar formato de teléfono"""
        if not phone or not isinstance(phone, str):
            return False
        
        phone = phone.strip()
        
        # Verificar con patrones
        return any(pattern.match(phone) for pattern in cls.PHONE_PATTERNS)
    
    @classmethod
    def normalize(cls, phone: str) -> str:
        """Normalizar teléfono"""
        if not phone:
            return ""
        
        # Remover caracteres no numéricos excepto +
        normalized = re.sub(r'[^\d+]', '', phone)
        
        return normalized

class FileValidator:
    """Validador de archivos"""
    
    # Tipos MIME permitidos por categoría
    ALLOWED_IMAGES = {
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
        'image/webp', 'image/bmp', 'image/tiff'
    }
    
    ALLOWED_DOCUMENTS = {
        'application/pdf', 
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv', 'text/plain'
    }
    
    # Extensiones peligrosas
    DANGEROUS_EXTENSIONS = {
        '.exe', '.bat', '.com', '.cmd', '.scr', '.pif', '.vbs', 
        '.js', '.jar', '.php', '.py', '.pl', '.sh', '.ps1'
    }
    
    @classmethod
    def validate_file_type(cls, filename: str, content_type: str = None, 
                          allowed_types: List[str] = None) -> bool:
        """Validar tipo de archivo"""
        if not filename:
            return False
        
        try:
            # Obtener extensión
            extension = Path(filename).suffix.lower()
            
            # Verificar extensiones peligrosas
            if extension in cls.DANGEROUS_EXTENSIONS:
                logger.warning(f"Extensión peligrosa detectada: {extension}")
                return False
            
            # Si no se especifican tipos permitidos, usar imágenes y documentos
            if allowed_types is None:
                allowed_mime_types = cls.ALLOWED_IMAGES | cls.ALLOWED_DOCUMENTS
            else:
                allowed_mime_types = set(allowed_types)
            
            # Verificar content type si está disponible
            if content_type:
                if content_type.split(';')[0].strip() in allowed_mime_types:
                    return True
            
            # Verificar por extensión
            guessed_type, _ = mimetypes.guess_type(filename)
            if guessed_type and guessed_type in allowed_mime_types:
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error validando tipo de archivo {filename}: {e}")
            return False
    
    @classmethod
    def validate_file_size(cls, size: int, max_size: int = 10 * 1024 * 1024) -> bool:
        """Validar tamaño de archivo"""
        if size < 0:
            return False
        
        return size <= max_size
    
    @classmethod
    def is_image(cls, filename: str, content_type: str = None) -> bool:
        """Verificar si es imagen"""
        return cls.validate_file_type(filename, content_type, list(cls.ALLOWED_IMAGES))
    
    @classmethod
    def is_document(cls, filename: str, content_type: str = None) -> bool:
        """Verificar si es documento"""
        return cls.validate_file_type(filename, content_type, list(cls.ALLOWED_DOCUMENTS))

class DataValidator:
    """Validador de datos de negocio"""
    
    @staticmethod
    def validate_codigo_producto(codigo: str) -> bool:
        """Validar código de producto"""
        if not codigo or not isinstance(codigo, str):
            return False
        
        # Solo letras, números, guiones y guiones bajos
        pattern = re.compile(r'^[A-Z0-9_-]+$')
        
        codigo = codigo.upper().strip()
        
        return (
            len(codigo) >= 3 and 
            len(codigo) <= 20 and
            pattern.match(codigo)
        )
    
    @staticmethod
    def validate_stock_quantity(quantity: Union[int, float]) -> bool:
        """Validar cantidad de stock"""
        try:
            qty = float(quantity)
            return qty >= 0 and qty <= 999999
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_price(price: Union[int, float]) -> bool:
        """Validar precio"""
        try:
            p = float(price)
            return p >= 0 and p <= 9999999.99
        except (ValueError, TypeError):
            return False
    
    @staticmethod
    def validate_percentage(value: Union[int, float]) -> bool:
        """Validar porcentaje (0-100)"""
        try:
            p = float(value)
            return 0 <= p <= 100
        except (ValueError, TypeError):
            return False

class SecurityValidator:
    """Validador de seguridad"""
    
    # Patrones de ataques comunes
    SQL_INJECTION_PATTERNS = [
        re.compile(r'union\s+select', re.IGNORECASE),
        re.compile(r'drop\s+table', re.IGNORECASE),
        re.compile(r'delete\s+from', re.IGNORECASE),
        re.compile(r'insert\s+into', re.IGNORECASE),
        re.compile(r'update\s+set', re.IGNORECASE),
        re.compile(r'exec\s*\(', re.IGNORECASE),
        re.compile(r'execute\s*\(', re.IGNORECASE),
        re.compile(r'sp_\w+', re.IGNORECASE),
        re.compile(r'xp_\w+', re.IGNORECASE),
    ]
    
    XSS_PATTERNS = [
        re.compile(r'<script[^>]*>', re.IGNORECASE),
        re.compile(r'javascript:', re.IGNORECASE),
        re.compile(r'vbscript:', re.IGNORECASE),
        re.compile(r'onload\s*=', re.IGNORECASE),
        re.compile(r'onerror\s*=', re.IGNORECASE),
        re.compile(r'onclick\s*=', re.IGNORECASE),
        re.compile(r'onmouseover\s*=', re.IGNORECASE),
        re.compile(r'<iframe[^>]*>', re.IGNORECASE),
        re.compile(r'<object[^>]*>', re.IGNORECASE),
        re.compile(r'<embed[^>]*>', re.IGNORECASE),
    ]
    
    PATH_TRAVERSAL_PATTERNS = [
        re.compile(r'\.\./'),
        re.compile(r'\.\.\\'),
        re.compile(r'%2e%2e%2f', re.IGNORECASE),
        re.compile(r'%2e%2e%5c', re.IGNORECASE),
        re.compile(r'\.\.%2f', re.IGNORECASE),
        re.compile(r'\.\.%5c', re.IGNORECASE),
    ]
    
    @classmethod
    def check_sql_injection(cls, value: str) -> bool:
        """Detectar patrones de inyección SQL"""
        if not isinstance(value, str):
            return False
        
        return any(pattern.search(value) for pattern in cls.SQL_INJECTION_PATTERNS)
    
    @classmethod
    def check_xss_attempt(cls, value: str) -> bool:
        """Detectar patrones de XSS"""
        if not isinstance(value, str):
            return False
        
        return any(pattern.search(value) for pattern in cls.XSS_PATTERNS)
    
    @classmethod
    def check_path_traversal(cls, value: str) -> bool:
        """Detectar patrones de path traversal"""
        if not isinstance(value, str):
            return False
        
        return any(pattern.search(value) for pattern in cls.PATH_TRAVERSAL_PATTERNS)
    
    @classmethod
    def sanitize_input(cls, value: str, max_length: int = 1000) -> str:
        """Sanitizar entrada de usuario"""
        if not isinstance(value, str):
            return str(value) if value is not None else ""
        
        # Truncar longitud
        if len(value) > max_length:
            value = value[:max_length]
        
        # Remover caracteres de control
        sanitized = ''.join(char for char in value if ord(char) >= 32 or char in '\t\n\r')
        
        # Escapar caracteres HTML básicos
        sanitized = sanitized.replace('<', '&lt;').replace('>', '&gt;')
        sanitized = sanitized.replace('"', '&quot;').replace("'", '&#x27;')
        sanitized = sanitized.replace('&', '&amp;')
        
        return sanitized.strip()
    
    @classmethod
    def is_safe_input(cls, value: str) -> bool:
        """Verificar si la entrada es segura"""
        if not isinstance(value, str):
            return True
        
        # Verificar patrones maliciosos
        if cls.check_sql_injection(value):
            logger.warning(f"Patrón SQL injection detectado: {value[:100]}")
            return False
        
        if cls.check_xss_attempt(value):
            logger.warning(f"Patrón XSS detectado: {value[:100]}")
            return False
        
        if cls.check_path_traversal(value):
            logger.warning(f"Patrón path traversal detectado: {value[:100]}")
            return False
        
        return True

# Funciones de conveniencia
def validate_email(email: str) -> bool:
    """Validar email"""
    return EmailValidator.validate(email)

def validate_phone(phone: str) -> bool:
    """Validar teléfono"""
    return PhoneValidator.validate(phone)

def validate_file_type(filename: str, content_type: str = None, allowed_types: List[str] = None) -> bool:
    """Validar tipo de archivo"""
    return FileValidator.validate_file_type(filename, content_type, allowed_types)

def validate_file_size(size: int, max_size: int = 10 * 1024 * 1024) -> bool:
    """Validar tamaño de archivo"""
    return FileValidator.validate_file_size(size, max_size)

def sanitize_input(value: str, max_length: int = 1000) -> str:
    """Sanitizar entrada"""
    return SecurityValidator.sanitize_input(value, max_length)    

def check_sql_injection(value: str) -> bool:
   """Verificar inyección SQL"""
   return SecurityValidator.check_sql_injection(value)

def check_xss_attempt(value: str) -> bool:
   """Verificar intento XSS"""
   return SecurityValidator.check_xss_attempt(value)

def check_path_traversal(value: str) -> bool:
   """Verificar path traversal"""
   return SecurityValidator.check_path_traversal(value)

def is_safe_input(value: str) -> bool:
   """Verificar si entrada es segura"""
   return SecurityValidator.is_safe_input(value)

logger.info("✅ Validadores cargados")