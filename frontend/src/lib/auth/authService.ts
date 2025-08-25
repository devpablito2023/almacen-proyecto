// src/lib/auth/authService.ts
import { LoginCredentials, AuthResponse, User } from '@/types/auth';

/**
 * CLIENTE DE AUTENTICACIÓN
 * 
 * Maneja todas las llamadas a las API routes de auth.
 * Usado por los hooks y componentes de React.
 */
class AuthService {
  private baseURL = '/api/auth';

  /**
   * Realiza login del usuario
   */
  async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    message: string;
    user?: User;
  }> {
    try {
      console.log('🔐 AuthService: Iniciando login para', credentials.email_usuario);
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante: incluir cookies
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await response.json();
      
      console.log(`🔐 AuthService: Respuesta login - Status: ${response.status}`, {
        success: data.success,
        hasUser: !!data.data?.user
      });

      if (data.success && data.data?.user) {
        return {
          success: true,
          message: data.message,
          user: data.data.user
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error en el login'
        };
      }

    } catch (error) {
      console.error('❌ AuthService: Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión. Verifica tu conexión a internet.'
      };
    }
  }

  /**
   * Realiza logout del usuario
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🚪 AuthService: Iniciando logout');
      
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      
      console.log(`🚪 AuthService: Respuesta logout - Status: ${response.status}`);

      return {
        success: data.success,
        message: data.message || 'Logout completado'
      };

    } catch (error) {
      console.error('❌ AuthService: Error en logout:', error);
      
      // Incluso si hay error, consideramos exitoso para limpiar el estado
      return {
        success: true,
        message: 'Logout completado (con advertencias)'
      };
    }
  }

  /**
   * Obtiene información del usuario actual
   */
  async getCurrentUser(): Promise<{
    success: boolean;
    message: string;
    user?: User;
  }> {
    try {
      console.log('👤 AuthService: Obteniendo usuario actual');
      
      const response = await fetch(`${this.baseURL}/me`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      
      console.log(`👤 AuthService: Respuesta me - Status: ${response.status}`, {
        success: data.success,
        hasUser: !!data.data?.user
      });

      if (data.success && data.data?.user) {
        return {
          success: true,
          message: data.message,
          user: data.data.user
        };
      } else {
        return {
          success: false,
          message: data.message || 'Usuario no encontrado'
        };
      }

    } catch (error) {
      console.error('❌ AuthService: Error obteniendo usuario:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Verifica si la sesión es válida
   */
  async verifySession(route?: string): Promise<{
    success: boolean;
    message: string;
    isAuthenticated: boolean;
    hasPermission: boolean;
    user?: User;
    accessibleModules?: string[];
  }> {
    try {
      console.log('🔍 AuthService: Verificando sesión', { route });
      
      const url = new URL(`${window.location.origin}${this.baseURL}/verify`);
      if (route) {
        url.searchParams.set('route', route);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      
      console.log(`🔍 AuthService: Respuesta verify - Status: ${response.status}`, {
        success: data.success,
        isAuthenticated: data.data?.isAuthenticated,
        hasPermission: data.data?.hasPermission
      });

      return {
        success: data.success,
        message: data.message,
        isAuthenticated: data.data?.isAuthenticated || false,
        hasPermission: data.data?.hasPermission || false,
        user: data.data?.user,
        accessibleModules: data.data?.permissions?.accessibleModules || []
      };

    } catch (error) {
      console.error('❌ AuthService: Error verificando sesión:', error);
      return {
        success: false,
        message: 'Error de conexión',
        isAuthenticated: false,
        hasPermission: false
      };
    }
  }

  /**
   * Verifica múltiples rutas y permisos
   */
  async verifyMultiplePermissions(routes: string[] = [], operations: string[] = []): Promise<{
    success: boolean;
    message: string;
    routePermissions: Record<string, boolean>;
    user?: User;
  }> {
    try {
      console.log('🔍 AuthService: Verificando múltiples permisos', { routes, operations });
      
      const response = await fetch(`${this.baseURL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ routes, operations }),
      });

      const data = await response.json();
      
      console.log(`🔍 AuthService: Respuesta verify múltiple - Status: ${response.status}`);

      return {
        success: data.success,
        message: data.message,
        routePermissions: data.data?.routePermissions || {},
        user: data.data?.user
      };

    } catch (error) {
      console.error('❌ AuthService: Error verificando múltiples permisos:', error);
      return {
        success: false,
        message: 'Error de conexión',
        routePermissions: {}
      };
    }
  }

  /**
   * Obtiene información básica del usuario desde la cookie (sin API call)
   */
  getUserInfoFromCookie(): User | null {
    try {
      // Solo funciona en el cliente
      if (typeof window === 'undefined') {
        return null;
      }

      // Leer la cookie user-info que es accesible desde JavaScript
      const cookies = document.cookie.split(';');
      const userInfoCookie = cookies.find(c => c.trim().startsWith('user-info='));
      
      if (!userInfoCookie) {
        return null;
      }

      const cookieValue = userInfoCookie.split('=')[1];
      const userInfo = JSON.parse(decodeURIComponent(cookieValue));
      
      return {
        id_usuario: userInfo.id,
        codigo_usuario: userInfo.codigo || '',
        nombre_usuario: userInfo.nombre,
        email_usuario: userInfo.email,
        tipo_usuario: userInfo.rol,
        area_usuario: userInfo.area || '',
        estado_usuario: 1,
        intentos_login: 0,
        created_at: '',
        created_by: 0
      };

    } catch (error) {
      console.error('❌ AuthService: Error leyendo cookie de usuario:', error);
      return null;
    }
  }

  /**
   * Verifica si hay una sesión activa (sin API call)
   */
  hasActiveSession(): boolean {
    try {
      // Solo funciona en el cliente
      if (typeof window === 'undefined') {
        return false;
      }

      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
      const userCookie = cookies.find(c => c.trim().startsWith('user-info='));
      
      return !!(authCookie && userCookie);
    } catch (error) {
      console.error('❌ AuthService: Error verificando sesión:', error);
      return false;
    }
  }

  /**
   * Limpia el estado de autenticación localmente
   * Útil para casos de emergencia o testing
   */
  clearAuthState(): void {
    try {
      // Solo funciona en el cliente
      if (typeof window === 'undefined') {
        return;
      }

      // Limpiar cookies localmente
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'user-info=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      console.log('🧹 AuthService: Estado de auth limpiado localmente');
    } catch (error) {
      console.error('❌ AuthService: Error limpiando estado:', error);
    }
  }
}

// Instancia singleton
export const authService = new AuthService();

// También exportar la clase para testing
export { AuthService };

/**
 * UTILIDADES ADICIONALES PARA DESARROLLO
 */

/**
 * Hook para debugging - obtiene info de cookies
 */
export function getAuthDebugInfo() {
  if (typeof window === 'undefined') {
    return { isServer: true };
  }

  const cookies = document.cookie.split(';');
  const authToken = cookies.find(c => c.trim().startsWith('auth-token='));
  const userInfo = cookies.find(c => c.trim().startsWith('user-info='));

  return {
    isServer: false,
    hasAuthToken: !!authToken,
    hasUserInfo: !!userInfo,
    cookies: cookies.map(c => c.trim().split('=')[0]),
    cookieCount: cookies.length,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'N/A'
  };
}

/**
 * Función para testing - simular diferentes estados
 */
export function mockAuthState(user?: User, hasToken: boolean = true) {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ mockAuthState solo debe usarse en desarrollo');
    return;
  }

  console.log('🧪 AuthService: Mocking auth state para testing');

  if (user && hasToken) {
    const userInfoCookie = JSON.stringify({
      id: user.id_usuario,
      nombre: user.nombre_usuario,
      email: user.email_usuario,
      rol: user.tipo_usuario,
      area: user.area_usuario
    });

    document.cookie = `user-info=${encodeURIComponent(userInfoCookie)}; path=/;`;
    document.cookie = `auth-token=mock_token_${Date.now()}; path=/;`;
    
    console.log('🧪 Estado mock creado:', { user: user.nombre_usuario, rol: user.tipo_usuario });
  } else {
    authService.clearAuthState();
    console.log('🧪 Estado mock limpiado');
  }
}