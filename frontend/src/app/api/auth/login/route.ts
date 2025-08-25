// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { LoginCredentials, AuthResponse } from '@/types/auth';

/**
 * ENDPOINT DE LOGIN
 * 
 * Flujo:
 * 1. Recibe credenciales del frontend
 * 2. Las envía al backend FastAPI
 * 3. Si son válidas, crea JWT propio
 * 4. Setea cookie HTTP-Only con el JWT
 * 5. Retorna respuesta al frontend
 */

// Configuración JWT
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro_de_32_caracteres'
);

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h'; // 8 horas por defecto

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Login: Iniciando proceso de autenticación');
    
    // ========================================
    // 1. VALIDAR ENTRADA
    // ========================================
    const body = await request.json();
    const { email_usuario, password_usuario }: LoginCredentials = body;

    if (!email_usuario || !password_usuario) {
      console.log('❌ API Login: Credenciales incompletas');
      return NextResponse.json({
        success: false,
        message: 'Email y contraseña son requeridos',
        code: 400,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // ========================================
    // 2. AUTENTICAR CON BACKEND FASTAPI
    // ========================================
    console.log(`📡 API Login: Enviando credenciales al backend para ${email_usuario}`);
    
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:7070'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Frontend/1.0',
      },
      body: JSON.stringify({
        email_usuario,
        password_usuario
      })
    });

    const backendData: AuthResponse = await backendResponse.json();
    
    console.log(`📡 API Login: Respuesta del backend - Status: ${backendResponse.status}`, {
      success: backendData.success,
      hasUser: !!backendData.data?.user,
      hasToken: !!backendData.data?.access_token
    });

    // ========================================
    // 3. PROCESAR RESPUESTA DEL BACKEND
    // ========================================
    if (!backendResponse.ok || !backendData.success || !backendData.data) {
      console.log('❌ API Login: Autenticación fallida en backend');
      return NextResponse.json({
        success: false,
        message: backendData.message || 'Credenciales inválidas',
        code: backendResponse.status,
        timestamp: new Date().toISOString()
      }, { status: backendResponse.status });
    }

    const { access_token, refresh_token, user } = backendData.data; // ← Corregido: access_token

    // ========================================
    // 4. CREAR JWT PROPIO (para cookies)
    // ========================================
    console.log(`🔐 API Login: Creando JWT propio para usuario ${user.nombre_usuario}`);
    
    // Calcular tiempo de expiración
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 8); // 8 horas

    const jwtToken = await new SignJWT({ 
      user,
      backendToken: access_token, // ← Usar access_token del backend
      refreshToken: refresh_token, // ← Guardar también refresh_token
      loginTime: new Date().toISOString(),
      expiresAt: expirationTime.toISOString()
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .setSubject(user.id_usuario.toString())
    .setIssuer('control-almacen-frontend')
    .setAudience('control-almacen-users')
    .sign(JWT_SECRET);

    // ========================================
    // 5. CREAR RESPUESTA CON COOKIE
    // ========================================
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      code: 200,
      timestamp: new Date().toISOString(),
      data: {
        user: {
          ...user,
          // No incluir información sensible
          ultimo_login: new Date().toISOString()
        }
        // NO incluimos el token en la respuesta JSON por seguridad
      }
    });

    // Configurar cookie HTTP-Only
    response.cookies.set('auth-token', jwtToken, {
      httpOnly: true, // No accesible desde JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict', // CSRF protection
      maxAge: 8 * 60 * 60, // 8 horas en segundos
      path: '/', // Disponible en toda la aplicación
    });

    // Cookie adicional para info básica del usuario (accesible desde JS)
    response.cookies.set('user-info', JSON.stringify({
      id: user.id_usuario,
      nombre: user.nombre_usuario,
      rol: user.tipo_usuario,
      email: user.email_usuario,
      area: user.area_usuario || ''
    }), {
      httpOnly: false, // Accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60,
      path: '/',
    });

    console.log(`✅ API Login: Cookies configuradas para ${user.nombre_usuario}`);
    console.log(`🍪 Auth Token: ${jwtToken.substring(0, 20)}...`);
    console.log(`🍪 User Info: ${JSON.stringify({
      id: user.id_usuario,
      nombre: user.nombre_usuario,
      rol: user.tipo_usuario
    })}`);
    
    return response;

  } catch (error) {
    console.error('💥 API Login: Error inesperado:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      code: 500,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Manejo de métodos no permitidos
export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Método no permitido',
    code: 405,
    timestamp: new Date().toISOString()
  }, { status: 405 });
}