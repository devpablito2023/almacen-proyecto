# backend/app/server/utils/file_handler.py
import os
import shutil
from pathlib import Path
from typing import Optional, Dict, Any, Tuple, Union, BinaryIO
from PIL import Image, ImageOps
import magic
from server.config.settings import settings
from server.utils.validators import FileValidator
from server.utils.helpers import generate_filename, format_file_size
import logging

logger = logging.getLogger(__name__)

class FileManager:
    """Gestor de archivos del sistema"""
    
    def __init__(self):
        self.upload_dir = Path(settings.upload_folder)
        self.images_dir = Path(settings.images_folder)
        self.reports_dir = Path(settings.reports_folder)
        
        # Crear directorios si no existen
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Crear directorios necesarios"""
        directories = [
            self.upload_dir,
            self.images_dir,
            self.images_dir / "products",
            self.images_dir / "users", 
            self.images_dir / "thumbnails",
            self.reports_dir,
            Path("logs")
        ]
        
        for directory in directories:
            try:
                directory.mkdir(parents=True, exist_ok=True)
                logger.debug(f"Directorio asegurado: {directory}")
            except Exception as e:
                logger.error(f"Error creando directorio {directory}: {e}")
    
    def save_file(self, file_content: bytes, filename: str, 
                  subdirectory: str = "", validate: bool = True) -> Dict[str, Any]:
        """
        Guardar archivo en el sistema
        
        Args:
            file_content: Contenido del archivo
            filename: Nombre del archivo
            subdirectory: Subdirectorio donde guardar
            validate: Validar archivo antes de guardar
            
        Returns:
            Dict con información del archivo guardado
        """
        try:
            # Validar archivo si se solicita
            if validate:
                validation_result = self.validate_file(filename, file_content)
                if not validation_result["valid"]:
                    return {
                        "success": False,
                        "error": validation_result["error"],
                        "details": validation_result
                    }
            
            # Generar nombre seguro
            safe_filename = generate_filename(filename)
            
            # Determinar directorio de destino
            if subdirectory:
                target_dir = self.upload_dir / subdirectory
                target_dir.mkdir(parents=True, exist_ok=True)
            else:
                target_dir = self.upload_dir
            
            # Ruta completa del archivo
            file_path = target_dir / safe_filename
            
            # Guardar archivo
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            # Obtener información del archivo
            file_info = self.get_file_info(file_path)
            
            logger.info(f"Archivo guardado: {safe_filename}")
            
            return {
                "success": True,
                "filename": safe_filename,
                "original_filename": filename,
                "file_path": str(file_path),
                "relative_path": str(file_path.relative_to(Path.cwd())),
                "url": f"/static/{file_path.relative_to(Path('static'))}",
                "size": len(file_content),
                "size_formatted": format_file_size(len(file_content)),
                "info": file_info
            }
            
        except Exception as e:
            logger.error(f"Error guardando archivo {filename}: {e}")
            return {
                "success": False,
                "error": f"Error guardando archivo: {str(e)}"
            }
    
    def delete_file(self, file_path: Union[str, Path]) -> bool:
        """
        Eliminar archivo del sistema
        
        Args:
            file_path: Ruta del archivo a eliminar
            
        Returns:
            True si se eliminó exitosamente
        """
        try:
            path = Path(file_path)
            
            if path.exists() and path.is_file():
                path.unlink()
                logger.info(f"Archivo eliminado: {path}")
                return True
            else:
                logger.warning(f"Archivo no encontrado: {path}")
                return False
                
        except Exception as e:
            logger.error(f"Error eliminando archivo {file_path}: {e}")
            return False
    
    def get_file_info(self, file_path: Union[str, Path]) -> Dict[str, Any]:
        """
        Obtener información detallada de un archivo
        
        Args:
            file_path: Ruta del archivo
            
        Returns:
            Dict con información del archivo
        """
        try:
            path = Path(file_path)
            
            if not path.exists():
                return {"exists": False}
            
            stat = path.stat()
            
            # Detectar tipo MIME
            try:
                mime_type = magic.from_file(str(path), mime=True)
            except:
                mime_type = "application/octet-stream"
            
            info = {
                "exists": True,
                "name": path.name,
                "size": stat.st_size,
                "size_formatted": format_file_size(stat.st_size),
                "extension": path.suffix.lower(),
                "mime_type": mime_type,
                "created": stat.st_ctime,
                "modified": stat.st_mtime,
                "is_image": FileValidator.is_image(path.name, mime_type),
                "is_document": FileValidator.is_document(path.name, mime_type)
            }
            
            # Información adicional para imágenes
            if info["is_image"]:
                try:
                    with Image.open(path) as img:
                        info.update({
                            "width": img.width,
                            "height": img.height,
                            "format": img.format,
                            "mode": img.mode
                        })
                except Exception as e:
                    logger.warning(f"Error obteniendo info de imagen {path}: {e}")
            
            return info
            
        except Exception as e:
            logger.error(f"Error obteniendo info de archivo {file_path}: {e}")
            return {"exists": False, "error": str(e)}
    
    def validate_file(self, filename: str, content: bytes) -> Dict[str, Any]:
        """
        Validar archivo completamente
        
        Args:
            filename: Nombre del archivo
            content: Contenido del archivo
            
        Returns:
            Dict con resultado de validación
        """
        result = {
            "valid": True,
            "errors": [],
            "warnings": []
        }
        
        try:
            # Validar tamaño
            if not FileValidator.validate_file_size(len(content), settings.max_file_size):
                result["valid"] = False
                result["errors"].append(f"Archivo demasiado grande (máximo: {format_file_size(settings.max_file_size)})")
            
            # Detectar tipo real del archivo
            try:
                real_mime_type = magic.from_buffer(content, mime=True)
            except:
                real_mime_type = "application/octet-stream"
            
            # Validar tipo de archivo
            if not FileValidator.validate_file_type(filename, real_mime_type):
                result["valid"] = False
                result["errors"].append(f"Tipo de archivo no permitido: {real_mime_type}")
            
            # Verificar consistencia entre extensión y contenido
            extension = Path(filename).suffix.lower()
            expected_types = {
                '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
                '.png': 'image/png', '.gif': 'image/gif',
                '.pdf': 'application/pdf',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }
            
            expected_type = expected_types.get(extension)
            if expected_type and real_mime_type != expected_type:
                result["warnings"].append(f"Extensión {extension} no coincide con tipo detectado {real_mime_type}")
            
            # Validaciones específicas para imágenes
            if real_mime_type.startswith('image/'):
                try:
                    with Image.open(BytesIO(content)) as img:
                        # Verificar dimensiones razonables
                        if img.width > 10000 or img.height > 10000:
                            result["warnings"].append("Imagen muy grande, se recomienda redimensionar")
                        
                        # Verificar si es animada (GIF)
                        if hasattr(img, 'is_animated') and img.is_animated:
                            result["warnings"].append("Imagen animada detectada")
                            
                except Exception as e:
                    result["valid"] = False
                    result["errors"].append(f"Archivo de imagen corrupto: {str(e)}")
            
            result["mime_type"] = real_mime_type
            result["size"] = len(content)
            result["size_formatted"] = format_file_size(len(content))
            
        except Exception as e:
            result["valid"] = False
            result["errors"].append(f"Error validando archivo: {str(e)}")
        
        if result["errors"]:
            result["error"] = "; ".join(result["errors"])
        
        return result

class ImageProcessor:
    """Procesador de imágenes"""
    
    def __init__(self):
        self.thumbnail_sizes = {
            "small": (150, 150),
            "medium": (300, 300), 
            "large": (600, 600)
        }
        
        self.max_dimensions = {
            "product": (1200, 1200),
            "user": (500, 500),
            "general": (1920, 1920)
        }
    
    def compress_image(self, image_path: Union[str, Path], 
                      quality: int = 85, max_width: int = 1200) -> Dict[str, Any]:
        """
        Comprimir imagen manteniendo calidad
        
        Args:
            image_path: Ruta de la imagen
            quality: Calidad de compresión (1-100)
            max_width: Ancho máximo
            
        Returns:
            Dict con resultado de la compresión
        """
        try:
            path = Path(image_path)
            
            with Image.open(path) as img:
                # Convertir a RGB si es necesario
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Redimensionar si es muy grande
                if img.width > max_width:
                    ratio = max_width / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                
                # Corregir orientación EXIF
                img = ImageOps.exif_transpose(img)
                
                # Guardar comprimida
                compressed_path = path.parent / f"compressed_{path.name}"
                img.save(compressed_path, format='JPEG', quality=quality, optimize=True)
                
                # Obtener información
                original_size = path.stat().st_size
                compressed_size = compressed_path.stat().st_size
                reduction = ((original_size - compressed_size) / original_size) * 100
                
                logger.info(f"Imagen comprimida: {path.name} - Reducción: {reduction:.1f}%")
                
                return {
                    "success": True,
                    "original_path": str(path),
                    "compressed_path": str(compressed_path),
                    "original_size": original_size,
                    "compressed_size": compressed_size,
                    "reduction_percent": reduction,
                    "dimensions": (img.width, img.height)
                }
                
        except Exception as e:
            logger.error(f"Error comprimiendo imagen {image_path}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def generate_thumbnail(self, image_path: Union[str, Path], 
                          size: Tuple[int, int] = (300, 300),
                          crop: bool = True) -> Dict[str, Any]:
        """
        Generar thumbnail de imagen
        
        Args:
            image_path: Ruta de la imagen
            size: Tamaño del thumbnail (width, height)
            crop: Recortar para mantener aspect ratio
            
        Returns:
            Dict con resultado de la generación
        """
        try:
            path = Path(image_path)
            
            with Image.open(path) as img:
                # Convertir a RGB si es necesario
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Corregir orientación
                img = ImageOps.exif_transpose(img)
                
                # Crear thumbnail
                if crop:
                    # Crop centrado manteniendo aspect ratio
                    img = ImageOps.fit(img, size, Image.Resampling.LANCZOS)
                else:
                    # Redimensionar manteniendo proporciones
                    img.thumbnail(size, Image.Resampling.LANCZOS)
                
                # Guardar thumbnail
                thumb_path = path.parent / "thumbnails" / f"thumb_{path.name}"
                thumb_path.parent.mkdir(exist_ok=True)
                
                img.save(thumb_path, format='JPEG', quality=90, optimize=True)
                
                logger.info(f"Thumbnail generado: {thumb_path}")
                
                return {
                    "success": True,
                    "original_path": str(path),
                    "thumbnail_path": str(thumb_path),
                    "thumbnail_size": img.size,
                    "file_size": thumb_path.stat().st_size
                }
                
        except Exception as e:
            logger.error(f"Error generando thumbnail {image_path}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def generate_all_thumbnails(self, image_path: Union[str, Path]) -> Dict[str, Any]:
        """Generar todos los tamaños de thumbnail"""
        results = {}
        
        for size_name, dimensions in self.thumbnail_sizes.items():
            result = self.generate_thumbnail(image_path, dimensions)
            results[size_name] = result
        
        return results

class DocumentProcessor:
    """Procesador de documentos"""
    
    def __init__(self):
        self.allowed_types = [
            'application/pdf',
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
            'text/plain'
        ]
    
    def validate_document(self, file_path: Union[str, Path]) -> Dict[str, Any]:
        """
        Validar documento
        
        Args:
            file_path: Ruta del documento
            
        Returns:
            Dict con resultado de validación
        """
        try:
            path = Path(file_path)
            
            if not path.exists():
                return {"valid": False, "error": "Archivo no encontrado"}
            
            # Detectar tipo MIME
            try:
                mime_type = magic.from_file(str(path), mime=True)
            except:
                mime_type = "application/octet-stream"
            
            # Verificar tipo permitido
            is_allowed = mime_type in self.allowed_types
            
            # Verificar tamaño
            size = path.stat().st_size
            size_ok = size <= settings.max_file_size
            
            result = {
                "valid": is_allowed and size_ok,
                "mime_type": mime_type,
                "size": size,
                "size_formatted": format_file_size(size),
                "is_allowed_type": is_allowed,
                "size_ok": size_ok
            }
            
            if not is_allowed:
                result["error"] = f"Tipo de documento no permitido: {mime_type}"
            elif not size_ok:
                result["error"] = f"Documento demasiado grande (máximo: {format_file_size(settings.max_file_size)})"
            
            return result
            
        except Exception as e:
            logger.error(f"Error validando documento {file_path}: {e}")
            return {"valid": False, "error": str(e)}

# Funciones de conveniencia
def upload_file(file_content: bytes, filename: str, subdirectory: str = "") -> Dict[str, Any]:
    """Subir archivo"""
    file_manager = FileManager()
    return file_manager.save_file(file_content, filename, subdirectory)

def delete_file(file_path: Union[str, Path]) -> bool:
    """Eliminar archivo"""
    file_manager = FileManager()
    return file_manager.delete_file(file_path)

def get_file_info(file_path: Union[str, Path]) -> Dict[str, Any]:
    """Obtener información de archivo"""
    file_manager = FileManager()
    return file_manager.get_file_info(file_path)

def compress_image(image_path: Union[str, Path], quality: int = 85) -> Dict[str, Any]:
    """Comprimir imagen"""
    processor = ImageProcessor()
    return processor.compress_image(image_path, quality)

def generate_thumbnail(image_path: Union[str, Path], size: Tuple[int, int] = (300, 300)) -> Dict[str, Any]:
    """Generar thumbnail"""
    processor = ImageProcessor()
    return processor.generate_thumbnail(image_path, size)

def validate_upload(filename: str, content: bytes) -> Dict[str, Any]:
    """Validar archivo para upload"""
    file_manager = FileManager()
    return file_manager.validate_file(filename, content)

# Importar BytesIO para el procesamiento de imágenes
from io import BytesIO

logger.info("✅ Utilidades de archivos cargadas")