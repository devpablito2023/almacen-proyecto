# backend/app/server/routes/__init__.py
"""
Módulo de rutas API
"""

from .auth import router as auth_router
from .usuarios import router as usuarios_router
from .productos import router as productos_router
from .stock import router as stock_router

__all__ = [
    "auth_router",
    "usuarios_router", 
    "productos_router",
    "stock_router"
]