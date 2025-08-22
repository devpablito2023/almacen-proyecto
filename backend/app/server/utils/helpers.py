# backend/app/server/utils/helpers.py
import hashlib
import secrets
import string
import re
import unicodedata
from datetime import datetime, date
from typing import Optional, Union, Any
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

def generate_unique_code(prefix: str = "", length: int = 8) -> str:
    """
    Generar código único alfanumérico
    
    Args:
        prefix: Prefijo para el código
        length: Longitud de la parte aleatoria
        
    Returns:
        Código único generado
    """
    try:
        # Caracteres permitidos (sin caracteres ambiguos)
        chars = string.ascii_uppercase + string.digits
        chars = chars.replace('0', '').replace('O', '').replace('I', '').replace('1')
        
        # Generar parte aleatoria
        random_part = ''.join(secrets.choice(chars) for _ in range(length))
        
        # Combinar con prefijo
        if prefix:
            return f"{prefix.upper()}-{random_part}"
        
        return random_part
        
    except Exception as e:
        logger.error(f"Error generando código único: {e}")
        return f"{prefix}-{datetime.now().strftime('%Y%m%d%H%M%S')}"

def generate_filename(original_name: str, prefix: str = "", max_length: int = 255) -> str:
    """
    Generar nombre de archivo seguro y único
    
    Args:
        original_name: Nombre original del archivo
        prefix: Prefijo para el nombre
        max_length: Longitud máxima del nombre
        
    Returns:
        Nombre de archivo sanitizado y único
    """
    try:
        # Extraer extensión
        if '.' in original_name:
            name, extension = original_name.rsplit('.', 1)
            extension = f".{extension.lower()}"
        else:
            name = original_name
            extension = ""
        
        # Sanitizar nombre
        safe_name = clean_string(name, allow_spaces=False)
        
        # Generar timestamp único
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Combinar partes
        if prefix:
            filename = f"{prefix}_{timestamp}_{safe_name}{extension}"
        else:
            filename = f"{timestamp}_{safe_name}{extension}"
        
        # Truncar si es muy largo
        if len(filename) > max_length:
            max_name_length = max_length - len(extension) - len(timestamp) - 2
            if prefix:
                max_name_length -= len(prefix) + 1
            safe_name = safe_name[:max_name_length]
            
            if prefix:
                filename = f"{prefix}_{timestamp}_{safe_name}{extension}"
            else:
                filename = f"{timestamp}_{safe_name}{extension}"
        
        return filename
        
    except Exception as e:
        logger.error(f"Error generando nombre de archivo: {e}")
        return f"file_{datetime.now().strftime('%Y%m%d_%H%M%S')}.bin"

def format_datetime(dt: Union[datetime, str, None], format_string: str = "%d/%m/%Y %H:%M:%S") -> str:
    """
    Formatear datetime para display
    
    Args:
        dt: Datetime a formatear
        format_string: Formato de salida
        
    Returns:
        String formateado
    """
    if dt is None:
        return ""
    
    try:
        if isinstance(dt, str):
            # Intentar parsear string ISO
            dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
        
        return dt.strftime(format_string)
        
    except Exception as e:
        logger.warning(f"Error formateando datetime {dt}: {e}")
        return str(dt) if dt else ""

def format_currency(amount: Union[float, Decimal, int, None], 
                   currency: str = "S/", decimals: int = 2) -> str:
    """
    Formatear cantidad como moneda
    
    Args:
        amount: Cantidad a formatear
        currency: Símbolo de moneda
        decimals: Número de decimales
        
    Returns:
        String formateado como moneda
    """
    if amount is None:
        return f"{currency} 0.00"
    
    try:
        # Convertir a float si es necesario
        if isinstance(amount, Decimal):
            amount = float(amount)
        
        # Formatear con separadores de miles
        formatted = f"{float(amount):,.{decimals}f}"
        
        return f"{currency} {formatted}"
        
    except Exception as e:
        logger.warning(f"Error formateando moneda {amount}: {e}")
        return f"{currency} {amount}"

def validate_file_extension(filename: str, allowed_extensions: list) -> bool:
    """
    Validar extensión de archivo
    
    Args:
        filename: Nombre del archivo
        allowed_extensions: Lista de extensiones permitidas
        
    Returns:
        True si la extensión es válida
    """
    if not filename or not allowed_extensions:
        return False
    
    try:
        # Extraer extensión
        extension = filename.lower().split('.')[-1] if '.' in filename else ''
        
        # Normalizar extensiones permitidas
        normalized_allowed = [ext.lower().lstrip('.') for ext in allowed_extensions]
        
        return extension in normalized_allowed
        
    except Exception as e:
        logger.warning(f"Error validando extensión de {filename}: {e}")
        return False

def clean_string(text: str, allow_spaces: bool = True, max_length: Optional[int] = None) -> str:
    """
    Limpiar y sanitizar string
    
    Args:
        text: Texto a limpiar
        allow_spaces: Permitir espacios
        max_length: Longitud máxima
        
    Returns:
        String limpio
    """
    if not isinstance(text, str):
        text = str(text) if text is not None else ""
    
    try:
        # Normalizar unicode
        text = unicodedata.normalize('NFKD', text)
        
        # Remover acentos
        text = ''.join(c for c in text if not unicodedata.combining(c))
        
        # Remover caracteres especiales
        if allow_spaces:
            # Permitir letras, números, espacios y algunos signos básicos
            text = re.sub(r'[^\w\s\-_.]', '', text)
            # Limpiar espacios múltiples
            text = ' '.join(text.split())
        else:
            # Solo letras, números, guiones y guiones bajos
            text = re.sub(r'[^\w\-_]', '', text)
        
        # Truncar si es necesario
        if max_length and len(text) > max_length:
            text = text[:max_length]
        
        return text.strip()
        
    except Exception as e:
        logger.warning(f"Error limpiando string: {e}")
        return re.sub(r'[^\w\s]', '', str(text))[:max_length] if max_length else re.sub(r'[^\w\s]', '', str(text))

def calculate_percentage(part: Union[int, float], total: Union[int, float], decimals: int = 2) -> float:
    """
    Calcular porcentaje
    
    Args:
        part: Parte del total
        total: Total
        decimals: Decimales en el resultado
        
    Returns:
        Porcentaje calculado
    """
    if not total or total == 0:
        return 0.0
    
    try:
        percentage = (float(part) / float(total)) * 100
        return round(percentage, decimals)
        
    except Exception as e:
        logger.warning(f"Error calculando porcentaje {part}/{total}: {e}")
        return 0.0

def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncar texto agregando sufijo
    
    Args:
        text: Texto a truncar
        max_length: Longitud máxima
        suffix: Sufijo a agregar
        
    Returns:
        Texto truncado
    """
    if not text or len(text) <= max_length:
        return text
    
    try:
        return text[:max_length - len(suffix)] + suffix
        
    except Exception as e:
        logger.warning(f"Error truncando texto: {e}")
        return text[:max_length]

def parse_date_string(date_string: str, formats: Optional[list] = None) -> Optional[datetime]:
    """
    Parsear string de fecha con múltiples formatos
    
    Args:
        date_string: String de fecha
        formats: Lista de formatos a intentar
        
    Returns:
        Datetime parseado o None
    """
    if not date_string:
        return None
    
    if formats is None:
        formats = [
            "%Y-%m-%d",
            "%d/%m/%Y",
            "%Y-%m-%d %H:%M:%S",
            "%d/%m/%Y %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%S.%f",
            "%Y-%m-%dT%H:%M:%SZ"
        ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_string.strip(), fmt)
        except ValueError:
            continue
    
    logger.warning(f"No se pudo parsear fecha: {date_string}")
    return None

def get_current_timestamp() -> str:
    """
    Obtener timestamp actual en formato ISO
    
    Returns:
        Timestamp actual
    """
    return datetime.now().isoformat()

def hash_string(text: str, algorithm: str = "sha256") -> str:
    """
    Generar hash de string
    
    Args:
        text: Texto a hashear
        algorithm: Algoritmo de hash
        
    Returns:
        Hash generado
    """
    try:
        hash_obj = hashlib.new(algorithm)
        hash_obj.update(text.encode('utf-8'))
        return hash_obj.hexdigest()
        
    except Exception as e:
        logger.error(f"Error generando hash: {e}")
        return hashlib.md5(text.encode('utf-8')).hexdigest()

def generate_random_string(length: int = 32, include_symbols: bool = False) -> str:
    """
    Generar string aleatorio
    
    Args:
        length: Longitud del string
        include_symbols: Incluir símbolos especiales
        
    Returns:
        String aleatorio generado
    """
    try:
        chars = string.ascii_letters + string.digits
        
        if include_symbols:
            chars += "!@#$%^&*"
        
        return ''.join(secrets.choice(chars) for _ in range(length))
        
    except Exception as e:
        logger.error(f"Error generando string aleatorio: {e}")
        return secrets.token_urlsafe(length)[:length]

def convert_size_to_bytes(size_str: str) -> int:
    """
    Convertir string de tamaño a bytes
    
    Args:
        size_str: String como "10MB", "1.5GB", etc.
        
    Returns:
        Tamaño en bytes
    """
    if not size_str:
        return 0
    
    try:
        # Extraer número y unidad
        size_str = size_str.upper().strip()
        
        # Buscar número
        import re
        match = re.match(r'([\d.]+)\s*([KMGT]?B?)', size_str)
        
        if not match:
            return int(float(size_str))  # Asumir bytes si no hay unidad
        
        number = float(match.group(1))
        unit = match.group(2)
        
        # Convertir según unidad
        multipliers = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 ** 2,
            'GB': 1024 ** 3,
            'TB': 1024 ** 4,
            'K': 1024,
            'M': 1024 ** 2,
            'G': 1024 ** 3,
            'T': 1024 ** 4
        }
        
        multiplier = multipliers.get(unit, 1)
        return int(number * multiplier)
        
    except Exception as e:
        logger.warning(f"Error convirtiendo tamaño {size_str}: {e}")
        return 0

def format_file_size(size_bytes: int) -> str:
    """
    Formatear tamaño de archivo en formato legible
    
    Args:
        size_bytes: Tamaño en bytes
        
    Returns:
        Tamaño formateado (ej: "1.5 MB")
    """
    if size_bytes == 0:
        return "0 B"
    
    try:
        units = ['B', 'KB', 'MB', 'GB', 'TB']
        size = float(size_bytes)
        unit_index = 0
        
        while size >= 1024 and unit_index < len(units) - 1:
            size /= 1024
            unit_index += 1
        
        if unit_index == 0:
            return f"{int(size)} {units[unit_index]}"
        else:
            return f"{size:.1f} {units[unit_index]}"
            
    except Exception as e:
        logger.warning(f"Error formateando tamaño {size_bytes}: {e}")
        return f"{size_bytes} B"

def deep_merge_dicts(dict1: dict, dict2: dict) -> dict:
    """
    Hacer merge profundo de diccionarios
    
    Args:
        dict1: Diccionario base
        dict2: Diccionario a mergear
        
    Returns:
        Diccionario resultante
    """
    result = dict1.copy()
    
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge_dicts(result[key], value)
        else:
            result[key] = value
    
    return result

def safe_get(dictionary: dict, key_path: str, default: Any = None) -> Any:
    """
    Obtener valor de diccionario anidado de forma segura
    
    Args:
        dictionary: Diccionario fuente
        key_path: Ruta de claves separadas por punto (ej: "user.profile.name")
        default: Valor por defecto
        
    Returns:
        Valor encontrado o default
    """
    try:
        keys = key_path.split('.')
        value = dictionary
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value
        
    except Exception:
        return default

logger.info("✅ Utilidades helper cargadas")