// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { LoginCredentials, AuthResponse } from '@/types/auth';

// Configuración JWT
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mi_jwt_secret_super_seguro_de_32_caracteres_para_almacen'
);

export async function POST(request: NextRequest) {
  console.log('🚀 API Login: POST request recibido');
  
  try {
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

    console.log(`📡 API Login: Enviando credenciales al backend para ${email_usuario}`);

    // ========================================
    // 2. AUTENTICAR CON BACKEND FASTAPI
    // ========================================
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:7070';
    
    const backendResponse = await fetch(`${backendUrl}/auth/login`, {
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

    let backendData: AuthResponse;
    
    try {
      backendData = await backendResponse.json();
    } catch (parseError) {
      console.error('❌ API Login: Error parsing JSON del backend:', parseError);
      return NextResponse.json({
        success: false,
        message: 'Error de comunicación con el servidor',
        code: 502,
        timestamp: new Date().toISOString()
      }, { status: 502 });
    }
    
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
        error: backendData.error || 'LOGIN_FAILED',
        timestamp: new Date().toISOString()
      }, { status: backendResponse.status });
    }

    const { access_token, refresh_token, user } = backendData.data;

    // ========================================
    // 4. CREAR JWT PROPIO (para cookies)
    // ========================================
    console.log(`🔐 API Login: Creando JWT propio para usuario ${user.nombre_usuario}`);
    
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 8); // 8 horas

    const jwtToken = await new SignJWT({ 
      user,
      backendToken: access_token, // Token del backend FastAPI
      refreshToken: refresh_token, // Refresh token del backend
      loginTime: new Date().toISOString(),
      expiresAt: expirationTime.toISOString()
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .setSubject(user.id_usuario.toString())
    .setIssuer('control-almacen-frontend')
    .setAudience('control-almacen')
    .sign(JWT_SECRET);

    // ========================================
    // 5. CREAR RESPUESTA CON COOKIES
    // ========================================
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      code: 200,
      timestamp: new Date().toISOString(),
      data: {
        user: {
          ...user,
          ultimo_login: new Date().toISOString()
        }
        // NO incluimos tokens en la respuesta por seguridad
      }
    });

    // Cookie HTTP-Only principal con JWT
    response.cookies.set('auth-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 horas
      path: '/',
    });

    // Cookie accesible con info básica del usuario
    response.cookies.set('user-info', JSON.stringify({
      id: user.id_usuario,
      nombre: user.nombre_usuario,
      rol: user.tipo_usuario,
      email: user.email_usuario,
      area: user.area_usuario || '',
      codigo: user.codigo_usuario
    }), {
      httpOnly: false, // Accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60,
      path: '/',
    });

    console.log(`✅ API Login: Cookies configuradas para ${user.nombre_usuario}`);
    console.log(`🍪 Auth Token length: ${jwtToken.length}`);
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

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Método no permitido - usar POST',
    code: 405,
    timestamp: new Date().toISOString()
  }, { status: 405 });
}