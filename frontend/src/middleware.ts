// middleware.ts (en la raíz del proyecto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { hasRoutePermission, ROLE_DEFAULT_ROUTES } from '@/lib/auth/permissions';
import type { User } from '@/types/auth';

/**
 * MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
 * 
 * Se ejecuta en CADA request antes de llegar a las páginas.
 * Responsabilidades:
 * 1. Validar token JWT en cookies
 * 2. Verificar permisos por rol
 * 3. Redireccionar según estado de auth
 * 4. Añadir headers con info del usuario
 */

// Configuración JWT
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro_de_32_caracteres'
);

// Rutas que NO requieren autenticación
const PUBLIC_ROUTES = ['/login', '/api/auth/login'];

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/dashboard'];

/**
 * Función principal del middleware
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token');

  console.log(`🔒 Middleware: ${request.method} ${pathname}`, {
    hasToken: !!token,
    timestamp: new Date().toISOString()
  });

  // ========================================
  // 1. MANEJO DE RUTAS PÚBLICAS
  // ========================================
  if (isPublicRoute(pathname)) {
    // Si está en login pero ya tiene token válido -> redirigir al dashboard
    if (pathname === '/login' && token) {
      const user = await validateToken(token.value);
      if (user) {
        const defaultRoute = ROLE_DEFAULT_ROUTES[user.tipo_usuario] || '/dashboard';
        console.log(`✅ Usuario ya autenticado, redirigiendo a: ${defaultRoute}`);
        return NextResponse.redirect(new URL(defaultRoute, request.url));
      }
    }
    
    return NextResponse.next();
  }

  // ========================================
  // 2. VALIDACIÓN DE AUTENTICACIÓN
  // ========================================
  if (isProtectedRoute(pathname)) {
    if (!token) {
      console.log(`❌ Sin token, redirigiendo a login desde: ${pathname}`);
      return redirectToLogin(request);
    }

    const user = await validateToken(token.value);
    if (!user) {
      console.log(`❌ Token inválido, redirigiendo a login desde: ${pathname}`);
      // Limpiar cookie inválida
      const response = redirectToLogin(request);
      response.cookies.delete('auth-token');
      return response;
    }

    // ========================================
    // 3. VALIDACIÓN DE PERMISOS
    // ========================================
    if (!hasRoutePermission(pathname, user.tipo_usuario)) {
      console.log(`❌ Sin permisos para ${pathname}, rol: ${user.tipo_usuario}`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // ========================================
    // 4. AÑADIR HEADERS CON INFO DEL USUARIO
    // ========================================
    const response = NextResponse.next();
    
    // Headers para que las páginas puedan acceder a info del usuario
    response.headers.set('X-User-ID', user.id_usuario.toString());
    response.headers.set('X-User-Role', user.tipo_usuario.toString());
    response.headers.set('X-User-Name', encodeURIComponent(user.nombre_usuario));
    
    console.log(`✅ Acceso autorizado para ${user.nombre_usuario} (${user.tipo_usuario}) a ${pathname}`);
    return response;
  }

  // ========================================
  // 5. REDIRECCIÓN DE RUTA RAÍZ
  // ========================================
  if (pathname === '/') {
    if (token) {
      const user = await validateToken(token.value);
      if (user) {
        const defaultRoute = ROLE_DEFAULT_ROUTES[user.tipo_usuario] || '/dashboard';
        return NextResponse.redirect(new URL(defaultRoute, request.url));
      }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

/**
 * Valida si una ruta es pública
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Valida si una ruta está protegida
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Redirige al login preservando la URL de destino
 */
function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  
  // Preservar la URL de destino para redirigir después del login
  if (request.nextUrl.pathname !== '/login') {
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  }
  
  return NextResponse.redirect(loginUrl);
}

/**
 * Valida el token JWT y extrae la información del usuario
 */
async function validateToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Verificar que el payload tenga la estructura esperada
    if (!payload.user || typeof payload.user !== 'object') {
      console.log('❌ Token sin información de usuario');
      return null;
    }

    const user = payload.user as User;
    
    // Validaciones básicas
    if (!user.id_usuario || !user.email_usuario || user.tipo_usuario === undefined) {
      console.log('❌ Token con datos de usuario inválidos');
      return null;
    }

    // Verificar expiración (además de la verificación automática de jwtVerify)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('❌ Token expirado');
      return null;
    }

    return user;
  } catch (error) {
    console.log('❌ Error validando token:', error);
    return null;
  }
}

/**
 * Configuración de rutas donde aplicar el middleware
 * 
 * Incluye:
 * - Todas las rutas del dashboard (protegidas)
 * - Ruta de login (para redirigir si ya está autenticado)  
 * - Ruta raíz (para redirigir apropiadamente)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - manejadas por separado)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    //'/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',

  ],
};