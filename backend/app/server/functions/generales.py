from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import json

def procesar_historico(mensaje: str, responsable: int, data: dict, unico: int) -> dict:
    """
    Procesa los datos para el histórico de cambios
    """
    return {
        "mensaje": mensaje,
        "responsable": responsable,
        "data": data,
        "unico": unico,
        "created_at": datetime.now(),
        "tipo_operacion": "KARDEX",
        "modulo": "kardex"
    }

def procesar_log(mensaje: str, responsable: int, unico: int) -> dict:
    """
    Procesa los datos para el log general del sistema
    """
    return {
        "mensaje": mensaje,
        "responsable": responsable,
        "unico": unico,
        "created_at": datetime.now(),
        "modulo": "kardex",
        "nivel": "INFO",
        "ip_address": None,
        "user_agent": None
    }

def filtrar_no_none(data: dict) -> dict:
    """
    Filtra los valores None de un diccionario
    """
    return {k: v for k, v in data.items() if v is not None}

def convertir_fecha_inicio(fecha_str: str) -> datetime:
    """
    Convierte string de fecha a datetime para inicio de día
    Formato esperado: YYYY-MM-DD
    """
    try:
        if not fecha_str or fecha_str == "0":
            return datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Parsear la fecha y setear al inicio del día
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d")
        return fecha.replace(hour=0, minute=0, second=0, microsecond=0)
    except ValueError:
        # Si hay error en el formato, retornar inicio del mes actual
        return datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

def convertir_fecha_fin(fecha_str: str) -> datetime:
    """
    Convierte string de fecha a datetime para fin de día
    Formato esperado: YYYY-MM-DD
    """
    try:
        if not fecha_str or fecha_str == "0":
            return datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # Parsear la fecha y setear al final del día
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d")
        return fecha.replace(hour=23, minute=59, second=59, microsecond=999999)
    except ValueError:
        # Si hay error en el formato, retornar fin del día actual
        return datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)

def comparar_json(json1: dict, json2: dict) -> dict:
    """
    Compara dos diccionarios y retorna las diferencias
    """
    diferencias = {
        "campos_modificados": {},
        "campos_nuevos": {},
        "campos_eliminados": {}
    }
    
    # Encontrar campos modificados y nuevos
    for key, value in json2.items():
        if key not in json1:
            diferencias["campos_nuevos"][key] = value
        elif json1[key] != value:
            diferencias["campos_modificados"][key] = {
                "anterior": json1[key],
                "nuevo": value
            }
    
    # Encontrar campos eliminados
    for key in json1:
        if key not in json2:
            diferencias["campos_eliminados"][key] = json1[key]
    
    return diferencias

def formatear_numero(numero: float, decimales: int = 2) -> str:
    """
    Formatea un número con separadores de miles y decimales
    """
    return f"{numero:,.{decimales}f}"

def validar_formato_fecha(fecha_str: str) -> bool:
    """
    Valida si una cadena tiene formato de fecha válido YYYY-MM-DD
    """
    try:
        datetime.strptime(fecha_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False

def generar_codigo_unico(prefijo: str, longitud: int = 8) -> str:
    """
    Genera un código único basado en timestamp
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"{prefijo}-{timestamp}"[:longitud]

def calcular_dias_diferencia(fecha_inicio: datetime, fecha_fin: datetime) -> int:
    """
    Calcula la diferencia en días entre dos fechas
    """
    return (fecha_fin - fecha_inicio).days

def es_fecha_valida(fecha: datetime, fecha_minima: datetime = None, fecha_maxima: datetime = None) -> bool:
    """
    Valida si una fecha está dentro de un rango válido
    """
    if fecha_minima and fecha < fecha_minima:
        return False
    if fecha_maxima and fecha > fecha_maxima:
        return False
    return True

def formatear_dinero(cantidad: float, moneda: str = "PEN") -> str:
    """
    Formatea una cantidad como dinero
    """
    return f"{moneda} {cantidad:,.2f}"

def convertir_a_mayusculas(texto: str) -> str:
    """
    Convierte texto a mayúsculas eliminando espacios extra
    """
    if not texto:
        return ""
    return texto.strip().upper()

def limpiar_codigo(codigo: str) -> str:
    """
    Limpia y formatea un código eliminando caracteres especiales
    """
    if not codigo:
        return ""
    return codigo.strip().upper().replace(" ", "-")

def validar_cantidad_positiva(cantidad: float) -> bool:
    """
    Valida que una cantidad sea positiva
    """
    return cantidad > 0

def redondear_decimal(numero: float, decimales: int = 2) -> float:
    """
    Redondea un número decimal a la cantidad especificada de decimales
    """
    return round(numero, decimales)

def obtener_timestamp() -> str:
    """
    Obtiene timestamp actual en formato string
    """
    return datetime.now().strftime("%Y%m%d%H%M%S")

def convertir_datetime_a_string(fecha: datetime, formato: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Convierte datetime a string con formato específico
    """
    if not fecha:
        return ""
    return fecha.strftime(formato)

def obtener_inicio_mes(fecha: datetime = None) -> datetime:
    """
    Obtiene el primer día del mes para una fecha dada
    """
    if not fecha:
        fecha = datetime.now()
    return fecha.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

def obtener_fin_mes(fecha: datetime = None) -> datetime:
    """
    Obtiene el último día del mes para una fecha dada
    """
    if not fecha:
        fecha = datetime.now()
    
    # Ir al primer día del siguiente mes y restar un día
    if fecha.month == 12:
        siguiente_mes = fecha.replace(year=fecha.year + 1, month=1, day=1)
    else:
        siguiente_mes = fecha.replace(month=fecha.month + 1, day=1)
    
    ultimo_dia = siguiente_mes - timedelta(days=1)
    return ultimo_dia.replace(hour=23, minute=59, second=59, microsecond=999999)

def validar_rango_fechas(fecha_inicio: datetime, fecha_fin: datetime) -> bool:
    """
    Valida que el rango de fechas sea correcto
    """
    return fecha_inicio <= fecha_fin

def calcular_porcentaje(parte: float, total: float) -> float:
    """
    Calcula el porcentaje de una parte respecto al total
    """
    if total == 0:
        return 0.0
    return round((parte / total) * 100, 2)

def sanitizar_texto(texto: str) -> str:
    """
    Sanitiza texto eliminando caracteres peligrosos
    """
    if not texto:
        return ""
    # Eliminar caracteres problemáticos básicos
    caracteres_peligrosos = ['<', '>', '"', "'", '&', ';']
    texto_limpio = texto
    for char in caracteres_peligrosos:
        texto_limpio = texto_limpio.replace(char, '')
    return texto_limpio.strip()

def generar_hash_simple(texto: str) -> str:
    """
    Genera un hash simple para texto (no para seguridad)
    """
    import hashlib
    return hashlib.md5(texto.encode()).hexdigest()[:8]

def es_numero_valido(valor: str) -> bool:
    """
    Valida si una cadena representa un número válido
    """
    try:
        float(valor)
        return True
    except (ValueError, TypeError):
        return False

def obtener_extension_archivo(nombre_archivo: str) -> str:
    """
    Obtiene la extensión de un archivo
    """
    if not nombre_archivo or '.' not in nombre_archivo:
        return ""
    return nombre_archivo.split('.')[-1].lower()

def validar_extension_permitida(nombre_archivo: str, extensiones_permitidas: list) -> bool:
    """
    Valida si la extensión del archivo está permitida
    """
    extension = obtener_extension_archivo(nombre_archivo)
    return extension in [ext.lower() for ext in extensiones_permitidas]

def formatear_tamaño_archivo(tamaño_bytes: int) -> str:
    """
    Formatea el tamaño de archivo en formato legible
    """
    for unidad in ['B', 'KB', 'MB', 'GB', 'TB']:
        if tamaño_bytes < 1024.0:
            return f"{tamaño_bytes:.1f} {unidad}"
        tamaño_bytes /= 1024.0
    return f"{tamaño_bytes:.1f} PB"

def validar_email(email: str) -> bool:
    """
    Validación básica de email
    """
    import re
    patron = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
    return re.match(patron, email) is not None

def generar_slug(texto: str) -> str:
    """
    Genera un slug URL-friendly desde texto
    """
    import re
    texto = texto.lower().strip()
    texto = re.sub(r'[^\w\s-]', '', texto)
    texto = re.sub(r'[-\s]+', '-', texto)
    return texto

def obtener_fecha_legible(fecha: datetime, incluir_hora: bool = False) -> str:
    """
    Convierte datetime a formato legible en español
    """
    meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    
    dia = fecha.day
    mes = meses[fecha.month - 1]
    año = fecha.year
    
    fecha_str = f"{dia} de {mes} de {año}"
    
    if incluir_hora:
        hora = fecha.strftime("%H:%M")
        fecha_str += f" a las {hora}"
    
    return fecha_str

def calcular_edad_dias(fecha_nacimiento: datetime) -> int:
    """
    Calcula la edad en días desde una fecha
    """
    return (datetime.now() - fecha_nacimiento).days

def es_fin_de_semana(fecha: datetime) -> bool:
    """
    Verifica si una fecha es fin de semana
    """
    return fecha.weekday() >= 5  # 5 = sábado, 6 = domingo

def obtener_primer_dia_semana(fecha: datetime = None) -> datetime:
    """
    Obtiene el primer día de la semana (lunes)
    """
    if not fecha:
        fecha = datetime.now()
    
    dias_desde_lunes = fecha.weekday()
    primer_dia = fecha - timedelta(days=dias_desde_lunes)
    return primer_dia.replace(hour=0, minute=0, second=0, microsecond=0)

def obtener_ultimo_dia_semana(fecha: datetime = None) -> datetime:
    """
    Obtiene el último día de la semana (domingo)
    """
    if not fecha:
        fecha = datetime.now()
    
    dias_hasta_domingo = 6 - fecha.weekday()
    ultimo_dia = fecha + timedelta(days=dias_hasta_domingo)
    return ultimo_dia.replace(hour=23, minute=59, second=59, microsecond=999999)

def truncar_texto(texto: str, longitud: int, sufijo: str = "...") -> str:
    """
    Trunca texto a una longitud específica
    """
    if not texto or len(texto) <= longitud:
        return texto
    return texto[:longitud - len(sufijo)] + sufijo

def capitalizar_palabras(texto: str) -> str:
    """
    Capitaliza la primera letra de cada palabra
    """
    if not texto:
        return ""
    return ' '.join(palabra.capitalize() for palabra in texto.split())

def remover_acentos(texto: str) -> str:
    """
    Remueve acentos de un texto
    """
    import unicodedata
    if not texto:
        return ""
    texto_normalizado = unicodedata.normalize('NFD', texto)
    return ''.join(c for c in texto_normalizado if unicodedata.category(c) != 'Mn')

def validar_longitud_texto(texto: str, minimo: int = 0, maximo: int = None) -> bool:
    """
    Valida la longitud de un texto
    """
    if not texto:
        return minimo == 0
    
    longitud = len(texto.strip())
    
    if longitud < minimo:
        return False
    
    if maximo and longitud > maximo:
        return False
    
    return True

def obtener_diferencia_tiempo(fecha_inicio: datetime, fecha_fin: datetime) -> dict:
    """
    Calcula la diferencia de tiempo entre dos fechas
    """
    diferencia = fecha_fin - fecha_inicio
    
    dias = diferencia.days
    horas, resto = divmod(diferencia.seconds, 3600)
    minutos, segundos = divmod(resto, 60)
    
    return {
        "dias": dias,
        "horas": horas,
        "minutos": minutos,
        "segundos": segundos,
        "total_segundos": diferencia.total_seconds()
    }

def convertir_a_bool(valor) -> bool:
    """
    Convierte varios tipos de valor a boolean
    """
    if isinstance(valor, bool):
        return valor
    if isinstance(valor, str):
        return valor.lower() in ['true', '1', 'yes', 'si', 'sí']
    if isinstance(valor, (int, float)):
        return valor != 0
    return False

def limpiar_espacios_extra(texto: str) -> str:
    """
    Limpia espacios extra de un texto
    """
    if not texto:
        return ""
    return ' '.join(texto.split())

# Constantes útiles
MESES_ESPAÑOL = {
    1: "enero", 2: "febrero", 3: "marzo", 4: "abril",
    5: "mayo", 6: "junio", 7: "julio", 8: "agosto",
    9: "septiembre", 10: "octubre", 11: "noviembre", 12: "diciembre"
}

DIAS_SEMANA_ESPAÑOL = {
    0: "lunes", 1: "martes", 2: "miércoles", 3: "jueves",
    4: "viernes", 5: "sábado", 6: "domingo"
}

EXTENSIONES_IMAGEN = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
EXTENSIONES_DOCUMENTO = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
EXTENSIONES_PERMITIDAS_GENERAL = EXTENSIONES_IMAGEN + EXTENSIONES_DOCUMENTO