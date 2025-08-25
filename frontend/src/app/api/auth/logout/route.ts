// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * ENDPOINT DE LOGOUT
 * 
 * Responsabilidades:
 * 1. Limpiar cookies de autenticación
 * 2. Opcionalmente notificar al backend (para audit logs)
 * 3. Retornar confirmación
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 API Logout: Iniciando proceso de logout');
    
    const token = request.cookies.get('auth-token');
    const userInfo = request.cookies.get('user-info');
    
    // Información del usuario para logs (si existe)
    let userEmail = 'unknown';
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo.value);
        userEmail = userData.email || 'unknown';
      } catch (e) {
        console.log('⚠️ API Logout: Error parsing user info cookie');
      }
    }

    // ========================================
    // 1. NOTIFICAR AL BACKEND (OPCIONAL)
    // ========================================
    // Esto es útil para audit logs y tracking de sesiones
    if (token) {
      try {
        await fetch(`${process.env.BACKEND_URL || 'http://localhost:7070'}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.value}`,
            'User-Agent': 'NextJS-Frontend/1.0',
          },
          // Timeout corto - no queremos que falle el logout si backend no responde
          signal: AbortSignal.timeout(3000) // 3 segundos
        });
        
        console.log(`📡 API Logout: Backend notificado para ${userEmail}`);
      } catch (error) {
        // No es crítico si falla - el logout debe proceder
        console.log('⚠️ API Logout: Error notificando backend (no crítico):', error);
      }
    }

    // ========================================
    // 2. LIMPIAR COOKIES
    // ========================================
    const response = NextResponse.json({
      success: true,
      message: 'Logout exitoso',
      code: 200,
      timestamp: new Date().toISOString()
    });

    // Eliminar cookie del token
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expira inmediatamente
      path: '/',
    });

    // Eliminar cookie de info del usuario
    response.cookies.set('user-info', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expira inmediatamente
      path: '/',
    });

    console.log(`✅ API Logout: Logout completado para ${userEmail}`);
    
    return response;

  } catch (error) {
    console.error('💥 API Logout: Error inesperado:', error);
    
    // Incluso si hay error, intentamos limpiar las cookies
    const response = NextResponse.json({
      success: true, // Consideramos exitoso porque las cookies se limpiaron
      message: 'Logout completado (con advertencias)',
      code: 200,
      timestamp: new Date().toISOString()
    });

    // Limpiar cookies de emergencia
    response.cookies.delete('auth-token');
    response.cookies.delete('user-info');

    return response;
  }
}

// Manejo de métodos no permitidos
export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Método no permitido - usar POST',
    code: 405,
    timestamp: new Date().toISOString()
  }, { status: 405 });
}