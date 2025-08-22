
# backend/app/server/models/usuarios.py
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime
from .base import BaseSchema

class UsuarioCreate(BaseModel):
    """Schema para crear usuario"""
    codigo_usuario: str = Field(..., min_length=5, max_length=20, description="Código único de usuario")
    nombre_usuario: str = Field(..., min_length=2, max_length=100, description="Nombre completo")
    email_usuario: EmailStr = Field(..., description="Email único")
    password: str = Field(..., min_length=6, max_length=100, description="Contraseña")
    tipo_usuario: int = Field(..., ge=0, le=5, description="Tipo de usuario (0-5)")
    area_usuario: str = Field(default="Sin área", max_length=50, description="Área de trabajo")
    
    @validator('codigo_usuario')
    def validate_codigo(cls, v):
        if not v.replace('_', '').isalnum():
            raise ValueError('Código solo puede contener letras, números y guiones bajos')
        return v.upper()
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Contraseña debe tener al menos 6 caracteres')
        return v

class UsuarioUpdate(BaseModel):
    """Schema para actualizar usuario"""
    nombre_usuario: Optional[str] = Field(None, min_length=2, max_length=100)
    email_usuario: Optional[EmailStr] = None
    tipo_usuario: Optional[int] = Field(None, ge=0, le=5)
    area_usuario: Optional[str] = Field(None, max_length=50)
    estado_usuario: Optional[int] = Field(None, ge=0, le=1)

class UsuarioResponse(BaseSchema):
    """Schema para respuesta de usuario"""
    id_usuario: int
    codigo_usuario: str
    nombre_usuario: str
    email_usuario: str
    tipo_usuario: int
    area_usuario: str
    estado_usuario: int
    ultimo_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UsuarioLogin(BaseModel):
    """Schema para login"""
    email_usuario: EmailStr = Field(..., description="Email de usuario")
    password: str = Field(..., min_length=1, description="Contraseña")

class ChangePassword(BaseModel):
    """Schema para cambiar contraseña"""
    current_password: str = Field(..., description="Contraseña actual")
    new_password: str = Field(..., min_length=6, description="Nueva contraseña")
    confirm_password: str = Field(..., description="Confirmar nueva contraseña")
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Las contraseñas no coinciden')
        return v

class TokenResponse(BaseModel):
    """Schema para respuesta de token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UsuarioResponse