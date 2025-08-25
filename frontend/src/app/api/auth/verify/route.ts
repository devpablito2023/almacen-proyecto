// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { User } from '@/types/auth';
import { hasRoutePermission, getAccessibleModules } from '@/lib/auth/permissions';

/**
 * ENDPOINT DE VERIFICACIÓN RÁPIDA
 * 
 * Usado por:
 * 1. Componentes para verificar permisos
 * 2. Validación rápida de sesión
 * 3. Obtener módulos accesibles
 */

// Configuración JWT
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro_de_32_caracteres'
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const route = searchParams.get('route'); // Para verificar permisos de ruta específica
    
    console.log('🔍 API Verify: Verificando sesión', { route });
    
    // ========================================
    // 1. OBTENER Y VALIDAR TOKEN
    // ========================================
    const token = request.cookies.get('auth-token');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No autenticado',
        code: 401,
        timestamp: new Date().toISOString(),
        data: {
          isAuthenticated: false,
          hasPermission: false
        }
      }, { status: 401 });
    }

    let user: User;

    try {
      const { payload } = await jwtVerify(token.value, JWT_SECRET);
      user = payload.user as User;
    } catch (jwtError) {
      console.log('❌ API Verify: Token inválido');
      
      const response = NextResponse.json({
        success: false,
        message: 'Token inválido',
        code: 401,
        timestamp: new Date().toISOString(),
        data: {
          isAuthenticated: false,
          hasPermission: false
        }
      }, { status: 401 });
      
      // Limpiar cookies inválidas
      response.cookies.delete('auth-token');
      response.cookies.delete('user-info');
      
      return response;
    }

    // ========================================
    // 2. VERIFICAR PERMISOS (SI SE SOLICITA)
    // ========================================
    let hasPermission = true;
    if (route) {
      hasPermission = hasRoutePermission(route, user.tipo_usuario);
      console.log(`🔍 API Verify: Permiso para ${route}: ${hasPermission}`);
    }

    // ========================================
    // 3. GENERAR RESPUESTA COMPLETA
    // ========================================
    const accessibleModules = getAccessibleModules(user.tipo_usuario);
    
    return NextResponse.json({
      success: true,
      message: 'Sesión válida',
      code: 200,
      timestamp: new Date().toISOString(),
      data: {
        isAuthenticated: true,
        hasPermission,
        user: {
          id_usuario: user.id_usuario,
          nombre_usuario: user.nombre_usuario,
          email_usuario: user.email_usuario,
          tipo_usuario: user.tipo_usuario,
          area_usuario: user.area_usuario
        },
        permissions: {
          accessibleModules,
          canAccessRoute: route ? hasPermission : null
        }
      }
    });

  } catch (error) {
    console.error('💥 API Verify: Error inesperado:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      code: 500,
      timestamp: new Date().toISOString(),
      data: {
        isAuthenticated: false,
        hasPermission: false
      }
    }, { status: 500 });
  }
}

/**
 * Endpoint POST para verificaciones con payload
 * Útil para verificar múltiples rutas o permisos complejos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { routes = [], operations = [] } = body;
    
    console.log('🔍 API Verify POST: Verificación múltiple', { routes, operations });
    
    // Validar token
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No autenticado',
        code: 401,
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    let user: User;
    try {
      const { payload } = await jwtVerify(token.value, JWT_SECRET);
      user = payload.user as User;
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        message: 'Token inválido',
        code: 401,
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    // Verificar permisos para múltiples rutas
    const routePermissions = routes.reduce((acc: any, route: string) => {
      acc[route] = hasRoutePermission(route, user.tipo_usuario);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      message: 'Verificación completada',
      code: 200,
      timestamp: new Date().toISOString(),
      data: {
        isAuthenticated: true,
        routePermissions,
        user: {
          id_usuario: user.id_usuario,
          nombre_usuario: user.nombre_usuario,
          tipo_usuario: user.tipo_usuario
        }
      }
    });

  } catch (error) {
    console.error('💥 API Verify POST: Error inesperado:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      code: 500,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}