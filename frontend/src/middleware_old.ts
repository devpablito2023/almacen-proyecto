import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES, USER_MENU_ACCESS } from './lib/config/constants';

/**
 * Middleware de Next.js para protección de rutas
 * Se ejecuta en el edge antes de que la página se renderice
 */

// Rutas públicas (no requieren autenticación)
const publicPaths = [
  ROUTES.LOGIN,
  //jaja',
  //ROUTES.DASHBOARD,
  '/api/health',
  '/_next',
  '/favicon.ico',
  '/images',
  '/icons',
];

// Rutas protegidas y sus permisos requeridos
const protectedRoutes: Record<string, number[]> = {
  [ROUTES.DASHBOARD]: [0, 1, 2, 3, 4, 5], // Todos los usuarios autenticados
  [ROUTES.PRODUCTOS]: [0, 1, 2, 3, 4, 5], // Todos pueden ver productos
  [ROUTES.STOCK]: [0, 1, 2, 3, 4, 5], // Todos pueden ver stock
  [ROUTES.USUARIOS]: [0], // Solo superusuario
  [ROUTES.INGRESOS]: [0, 5], // Superusuario y quien realiza ingresos
  [ROUTES.OT]: [0, 2], // Superusuario y quien genera OT
  [ROUTES.SOLICITUDES]: [0, 2, 3, 4], // Superusuario, genera OT, valida solicitudes, almacén
  [ROUTES.REPORTES]: [0, 1], // Superusuario y jefatura
  [ROUTES.CONFIGURACION]: [0], // Solo superusuario
};

/**
 * Verificar si una ruta es pública
 */
function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => pathname.startsWith(path));
}

/**
 * Extraer y verificar el token JWT
 */
function verifyToken(token: string): { valid: boolean; payload: any } {
  try {
    // Decodificación básica del JWT (solo para verificar expiración)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, payload: null };
    }

    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // Verificar expiración
    if (payload.exp && payload.exp < currentTime) {
      return { valid: false, payload: null };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, payload: null };
  }
}

/**
 * Verificar permisos del usuario para una ruta
 */

/*
function hasPermission(userType: number, pathname: string): boolean {
  const requiredTypes = protectedRoutes[pathname];
  
  if (!requiredTypes) {
    // Si la ruta no está definida en protectedRoutes, verificar módulo
    const module = pathname.split('/')[1]; // Obtener primer segmento de la ruta
    const allowedModules = USER_MENU_ACCESS[userType] || [];
    return allowedModules.includes(module);
  }
  
  return requiredTypes.includes(userType);
}

*/

function hasPermission(userType: number, pathname: string): boolean {
  const requiredTypes = protectedRoutes[pathname];
  
  if (!requiredTypes) {
    // Si la ruta no está definida en protectedRoutes, verificar módulo
    const module = pathname.split('/')[1]; // Obtener primer segmento de la ruta
    
    // Crear un mapa de tipos con assertion explícita
    const menuAccess: Record<number, string[]> = {
      0: ['dashboard', 'productos', 'stock', 'usuarios', 'ingresos', 'ot', 'solicitudes', 'reportes', 'configuracion'],
      1: ['dashboard', 'productos', 'stock', 'reportes'],
      2: ['dashboard', 'productos', 'stock', 'ot', 'solicitudes'],
      3: ['dashboard', 'productos', 'stock', 'solicitudes'],
      4: ['dashboard', 'productos', 'stock', 'solicitudes'],
      5: ['dashboard', 'productos', 'stock', 'ingresos'],
    };
    
    const allowedModules = menuAccess[userType] || [];
    return allowedModules.includes(module);
  }
  
  return requiredTypes.includes(userType);
}




export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir rutas públicas
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Obtener token de las cookies o headers
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Si no hay token, redirigir a login
  if (!token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar token
  const { valid, payload } = verifyToken(token);
  
  if (!valid) {
    // Token inválido o expirado
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('expired', '1');
    
    const response = NextResponse.redirect(loginUrl);
    // Limpiar cookies de autenticación
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    
    return response;
  }

  // Verificar permisos para rutas específicas
  //const userType = payload.user_type;
  const userType = payload.user_type ?? payload.tipo_usuario;

  
  if (!hasPermission(userType, pathname)) {
    // Sin permisos, redirigir al dashboard
    const dashboardUrl = new URL(ROUTES.DASHBOARD, request.url);
    dashboardUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(dashboardUrl);
  }

  // Si llegamos aquí, el usuario tiene permisos
  const response = NextResponse.next();
  
  // Agregar headers con información del usuario para las páginas
  response.headers.set('x-user-type', userType.toString());
  response.headers.set('x-user-id', payload.user_id?.toString() || '');
  
  return response;
}

// Configurar en qué rutas debe ejecutarse el middleware
export const config = {
  matcher: [
    /*
     * Hacer match con todas las rutas excepto:
     * - api routes que terminan con /health
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - archivos públicos con extensiones comunes
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};