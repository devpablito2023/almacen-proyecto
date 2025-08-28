# backend/app/server/utils/__init__.py
"""
Utilidades y funciones helper para el Sistema de Control de Almacén
"""

from .helpers import (
    generate_unique_code,
    generate_filename,
    format_datetime,
    format_currency,
    validate_file_extension,
    clean_string,
    calculate_percentage,
    truncate_text,
    parse_date_string,
    get_current_timestamp,
    hash_string,
    generate_random_string
)

from .validators import (
    EmailValidator,
    PhoneValidator,
    FileValidator,
    DataValidator,
    SecurityValidator,
    validate_email,
    validate_phone,
    validate_file_type,
    validate_file_size,
    sanitize_input,
    check_sql_injection,
    check_xss_attempt
)

from .file_handler import (
    FileManager,
    ImageProcessor,
    DocumentProcessor,
    upload_file,
    delete_file,
    get_file_info,
    compress_image,
    generate_thumbnail,
    validate_upload
)

__all__ = [
    # Helpers
    "generate_unique_code",
    "generate_filename", 
    "format_datetime",
    "format_currency",
    "validate_file_extension",
    "clean_string",
    "calculate_percentage",
    "truncate_text",
    "parse_date_string",
    "get_current_timestamp",
    "hash_string",
    "generate_random_string",
    
    # Validators
    "EmailValidator",
    "PhoneValidator",
    "FileValidator", 
    "DataValidator",
    "SecurityValidator",
    "validate_email",
    "validate_phone",
    "validate_file_type",
    "validate_file_size",
    "sanitize_input",
    "check_sql_injection",
    "check_xss_attempt",
    
    # File handlers
    "FileManager",
    "ImageProcessor",
    "DocumentProcessor",
    "upload_file",
    "delete_file",
    "get_file_info",
    "compress_image",
    "generate_thumbnail",
    "validate_upload"
]