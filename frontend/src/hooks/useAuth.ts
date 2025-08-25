// src/hooks/useAuth.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth/authService';
import { ROLE_DEFAULT_ROUTES, ROLE_PERMISSIONS ,ROLE_NAMES, hasModuleAccess, hasOperationPermission } from '@/lib/auth/permissions';
import type { User, LoginCredentials, UserRole,SystemModule } from '@/types/auth';

/**
 * HOOK DE AUTENTICACIÓN PROFESIONAL
 * 
 * Maneja todo el estado de autenticación usando:
 * - React state para UI reactiva
 * - Cookies HTTP-Only para seguridad
 * - API calls solo cuando es necesario
 * 
 * Ventajas:
 * - No problemas de hidratación (usa cookies + state)
 * - Seguro (token no accesible desde JS)
 * - Performante (checks locales cuando es posible)
 * - Type-safe (TypeScript completo)
 */

interface UseAuthReturn {
  // Estado principal
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Información de permisos
  userRole: UserRole | null;
  roleName: string | null;
  accessibleModules: SystemModule[];

  // Acciones principales
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;

  // Utilidades de permisos
  hasModulePermission: (module: SystemModule) => boolean;
  hasOperationPermission: (module: SystemModule, operation: 'create' | 'edit' | 'delete' | 'export') => boolean;
  canAccessRoute: (pathname: string) => boolean;

  // Estado de UI
  isAdmin: boolean;
  isJefatura: boolean;
  isGeneraOT: boolean;
  isValidaSolicitudes: boolean;
  isAlmacen: boolean;
  isRealizaIngresos: boolean;
}

export function useAuth(): UseAuthReturn {
  // ========================================
  // ESTADO LOCAL
  // ========================================
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); 

  const router = useRouter();

  // ========================================
  // ESTADOS DERIVADOS
  // ========================================
  const isAuthenticated = !!user;
  //const userRole = user?.tipo_usuario || null;
  const userRole = user?.tipo_usuario ?? null;

  const roleName = userRole !== null ? ROLE_NAMES[userRole] || null : null;
  const accessibleModules = userRole !== null ? 
    Object.keys(ROLE_PERMISSIONS).filter(module => 
      hasModuleAccess(userRole, module as SystemModule)
    ) as SystemModule[] : [];

  // Estados de UI por rol
  const isAdmin = userRole === 0;
  const isJefatura = userRole === 1;
  const isGeneraOT = userRole === 2;
  const isValidaSolicitudes = userRole === 3;
  const isAlmacen = userRole === 4;
  const isRealizaIngresos = userRole === 5;

  // ========================================
  // INICIALIZACIÓN
  // ========================================
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      console.log('🔄 useAuth: Inicializando autenticación');
      
      try {
        setIsLoading(true);
        setError(null);

        // 1. Verificación rápida de cookies (sin API call)
        if (!authService.hasActiveSession()) {
          console.log('📭 useAuth: No hay sesión activa en cookies');
          setUser(null);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        // 2. Intentar obtener info básica de cookies
        const cookieUser = authService.getUserInfoFromCookie();
        if (cookieUser && isMounted) {
          console.log(`👤 useAuth: Usuario encontrado en cookies: ${cookieUser.nombre_usuario}`);
          setUser(cookieUser);
        }

        // 3. Verificar con el servidor (validar JWT)
        const verification = await authService.verifySession();
        
        if (!isMounted) return;

        if (verification.success && verification.isAuthenticated && verification.user) {
          console.log(`✅ useAuth: Sesión verificada para ${verification.user.nombre_usuario}`);
          setUser(verification.user);
          setError(null);
        } else {
          console.log('❌ useAuth: Sesión inválida, limpiando estado');
          setUser(null);
          authService.clearAuthState();
        }

      } catch (error) {
        console.error('💥 useAuth: Error en inicialización:', error);
        if (isMounted) {
          setError('Error verificando sesión');
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // ========================================
  // FUNCIÓN DE LOGIN
  // ========================================
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    console.log(`🔐 useAuth: Iniciando login para ${credentials.email_usuario}`);
    
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.login(credentials);

      if (result.success && result.user) {
        console.log(`✅ useAuth: Login exitoso para ${result.user.nombre_usuario}`);
        
        setUser(result.user);
        setError(null);

        // Redirigir a la ruta apropiada según el rol
        console.log('Rol del usuario:', result.user.tipo_usuario);
        const defaultRoute = ROLE_DEFAULT_ROUTES[result.user.tipo_usuario] || '/dashboard';
        
        // Pequeño delay para asegurar que el estado se actualice
        setTimeout(() => {
          router.push(defaultRoute);
          router.refresh();
        }, 100);

        return true;

      } else {
        console.log(`❌ useAuth: Login fallido: ${result.message}`);
        setError(result.message);
        setUser(null);
        return false;
      }

    } catch (error) {
      console.error('💥 useAuth: Error inesperado en login:', error);
      setError('Error inesperado durante el login');
      return false;

    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ========================================
  // FUNCIÓN DE LOGOUT
  // ========================================
  const logout = useCallback(async (): Promise<void> => {
    console.log('🚪 useAuth: Iniciando logout');
    
    try {
      setIsLoading(true);
      
      // Llamar al API de logout
      await authService.logout();
      
      console.log('✅ useAuth: Logout completado');
      
      // Limpiar estado local
      setUser(null);
      setError(null);

      // Redirigir al login
      router.push('/login');
      router.refresh();

    } catch (error) {
      console.error('💥 useAuth: Error en logout:', error);
      
      // Limpiar estado de emergencia
      setUser(null);
      authService.clearAuthState();
      router.push('/login');

    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ========================================
  // REFRESH DE USUARIO
  // ========================================
  const refreshUser = useCallback(async (): Promise<void> => {
    console.log('🔄 useAuth: Refrescando datos del usuario');
    
    try {
      setIsLoading(true);
      
      const result = await authService.getCurrentUser();
      
      if (result.success && result.user) {
        console.log(`✅ useAuth: Usuario actualizado: ${result.user.nombre_usuario}`);
        setUser(result.user);
        setError(null);
      } else {
        console.log('❌ useAuth: Error actualizando usuario');
        setError(result.message);
      }

    } catch (error) {
      console.error('💥 useAuth: Error refrescando usuario:', error);
      setError('Error actualizando información del usuario');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================
  // UTILIDADES DE PERMISOS
  // ========================================
  const hasModulePermission = useCallback((module: SystemModule): boolean => {
   //if (!userRole && userRole !== 0) return false;
   if (userRole === null) return false;
    return hasModuleAccess(userRole, module);
  }, [userRole]);

  const hasOperationPermissionCallback = useCallback((
    module: SystemModule, 
    operation: 'create' | 'edit' | 'delete' | 'export'
  ): boolean => {
    //if (!userRole && userRole !== 0) return false;
    if (userRole === null) return false;
    return hasOperationPermission(userRole, module, operation);
  }, [userRole]);

  const canAccessRoute = useCallback((pathname: string): boolean => {
    //if (!userRole && userRole !== 0) return false;
    if (userRole === null) return false;

    // Lógica de verificación de rutas
    const pathSegments = pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 1 && pathSegments[0] === 'dashboard') {
      return hasModuleAccess(userRole, 'dashboard');
    }
    
    if (pathSegments.length >= 2 && pathSegments[0] === 'dashboard') {
      const module = pathSegments[1] as SystemModule;
      return hasModuleAccess(userRole, module);
    }
    
    return false;
  }, [userRole]);

  // ========================================
  // LIMPIAR ERROR
  // ========================================
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ========================================
  // RETORNO DEL HOOK
  // ========================================
  return {
    // Estado principal
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,

    // Información de permisos
    userRole,
    roleName,
    accessibleModules,

    // Acciones principales
    login,
    logout,
    refreshUser,
    clearError,

    // Utilidades de permisos
    hasModulePermission,
    hasOperationPermission: hasOperationPermissionCallback,
    canAccessRoute,

    // Estado de UI
    isAdmin,
    isJefatura,
    isGeneraOT,
    isValidaSolicitudes,
    isAlmacen,
    isRealizaIngresos,
  };
}

/**
 * Hook adicional para verificar permisos específicos
 * Útil para componentes que solo necesitan verificar permisos
 */
export function usePermissions() {
  const { userRole, hasModulePermission, hasOperationPermission, canAccessRoute } = useAuth();

  return {
    userRole,
    hasModulePermission,
    hasOperationPermission,
    canAccessRoute,
  };
}

/**
 * Hook para información básica del usuario
 * Más liviano cuando solo necesitas datos del usuario
 */
export function useCurrentUser() {
  const { user, isAuthenticated, userRole, roleName, isLoading } = useAuth();

  return {
    user,
    isAuthenticated,
    userRole,
    roleName,
    isLoading,
  };
}