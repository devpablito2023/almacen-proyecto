// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { User } from '@/types/auth';

/**
 * ENDPOINT PARA OBTENER USUARIO ACTUAL
 * 
 * Usado para:
 * 1. Refresh de datos del usuario
 * 2. Validar sesión desde el frontend
 * 3. Obtener permisos actualizados
 */

// Configuración JWT
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro_de_32_caracteres'
);

export async function GET(request: NextRequest) {
  try {
    console.log('👤 API Me: Obteniendo información del usuario actual');
    
    // ========================================
    // 1. OBTENER Y VALIDAR TOKEN
    // ========================================
    const token = request.cookies.get('auth-token');
    
    if (!token) {
      console.log('❌ API Me: No hay token presente');
      return NextResponse.json({
        success: false,
        message: 'No autenticado',
        code: 401,
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    let user: User;
    let backendToken: string;

    try {
      const { payload } = await jwtVerify(token.value, JWT_SECRET);
      user = payload.user as User;
      backendToken = payload.backendToken as string;
      
      console.log(`👤 API Me: Token validado para ${user.nombre_usuario}`);
    } catch (jwtError) {
      console.log('❌ API Me: Token JWT inválido:', jwtError);
      
      // Limpiar cookie inválida
      const response = NextResponse.json({
        success: false,
        message: 'Token inválido',
        code: 401,
        timestamp: new Date().toISOString()
      }, { status: 401 });
      
      response.cookies.delete('auth-token');
      response.cookies.delete('user-info');
      
      return response;
    }

    // ========================================
    // 2. OPCIONAL: SINCRONIZAR CON BACKEND
    // ========================================
    // Útil para obtener información actualizada del usuario
    try {
      const backendResponse = await fetch(
        `${process.env.BACKEND_URL || 'http://localhost:7070'}/auth/me`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${backendToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'NextJS-Frontend/1.0',
          },
          // Timeout corto
          signal: AbortSignal.timeout(5000) // 5 segundos
        }
      );

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        if (backendData.success && backendData.data) {
          // Usar datos actualizados del backend
          user = { ...user, ...backendData.data };
          console.log(`📡 API Me: Datos sincronizados con backend para ${user.nombre_usuario}`);
        }
      } else {
        console.log(`⚠️ API Me: Backend no disponible (${backendResponse.status}), usando datos del token`);
      }
    } catch (fetchError) {
      // No es crítico - usamos los datos del token
      console.log('⚠️ API Me: Error conectando con backend (no crítico):', fetchError);
    }

    // ========================================
    // 3. GENERAR RESPUESTA
    // ========================================
    
    // Información básica del usuario (sin datos sensibles)
    const userResponse = {
      id_usuario: user.id_usuario,
      codigo_usuario: user.codigo_usuario,
      nombre_usuario: user.nombre_usuario,
      email_usuario: user.email_usuario,
      tipo_usuario: user.tipo_usuario,
      area_usuario: user.area_usuario,
      estado_usuario: user.estado_usuario,
      ultimo_login: user.ultimo_login || new Date().toISOString(),
      created_at: user.created_at
    };

    console.log(`✅ API Me: Información enviada para ${user.nombre_usuario}`);

    return NextResponse.json({
      success: true,
      message: 'Usuario obtenido exitosamente',
      code: 200,
      timestamp: new Date().toISOString(),
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('💥 API Me: Error inesperado:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      code: 500,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Manejo de métodos no permitidos
export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'Método no permitido - usar GET',
    code: 405,
    timestamp: new Date().toISOString()
  }, { status: 405 });
}