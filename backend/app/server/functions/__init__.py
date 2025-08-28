# backend/app/server/functions/__init__.py
"""
Módulo de funciones de lógica de negocio
"""

from .auth import authenticate_user, change_user_password, verify_user_token
from .usuarios import (
    crear_usuario, 
    obtener_usuario_por_id, 
    obtener_usuarios, 
    actualizar_usuario, 
    eliminar_usuario,
    buscar_usuarios
)
from .productos import (
    crear_producto,
    obtener_producto_por_id,
    obtener_productos,
    actualizar_producto,
    eliminar_producto,
    buscar_productos,
    verificar_codigo_producto_unico
)
from .stock import (
    obtener_stock,
    obtener_stock_por_producto,
    ajustar_stock,
    obtener_alertas_stock,
    calcular_valoracion_inventario,
    obtener_movimientos_stock
)

__all__ = [
    # Auth
    "authenticate_user",
    "change_user_password", 
    "verify_user_token",
    
    # Usuarios
    "crear_usuario",
    "obtener_usuario_por_id",
    "obtener_usuarios",
    "actualizar_usuario", 
    "eliminar_usuario",
    "buscar_usuarios",
    
    # Productos
    "crear_producto",
    "obtener_producto_por_id",
    "obtener_productos",
    "actualizar_producto",
    "eliminar_producto", 
    "buscar_productos",
    "verificar_codigo_producto_unico",
    
    # Stock
    "obtener_stock",
    "obtener_stock_por_producto",
    "ajustar_stock",
    "obtener_alertas_stock",
    "calcular_valoracion_inventario",
    "obtener_movimientos_stock"
]