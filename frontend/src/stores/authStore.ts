// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';
import { authService } from '../lib/auth/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string ; user?: User | null}>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
  setHasHydrated: (hydrated: boolean) => void;
  getCurrentUser: () => Promise<void>;
  verifySession: (route?: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.login({
            email_usuario: email,
            password_usuario: password,
          });
          console.log('✅ AuthStore: Login result:', result);

          if (result.success && result.user) {
            set({
              user: result.user,
              token: 'authenticated', // Token manejado por cookies HttpOnly
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return { success: true, message: result.message,user:result.user };
          } else {
            set({
              isLoading: false,
              error: result.message,
              isAuthenticated: false,
              user: null,
              token: null,
            });
            return { success: false, message: result.message ,user:null};
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          return { success: false, message: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
          console.log('✅ AuthStore: Logout exitoso');
        } catch (error) {
          console.error('❌ AuthStore: Error en logout:', error);
        } finally {
          // Limpiar estado local siempre
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      getCurrentUser: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const result = await authService.getCurrentUser();
          
          if (result.success && result.user) {
            set({
              user: result.user,
              token: 'authenticated',
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: result.message,
            });
          }
        } catch (error) {
          console.error('❌ AuthStore: Error obteniendo usuario:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Error obteniendo información del usuario',
          });
        }
      },

      verifySession: async (route?: string) => {
        try {
          const result = await authService.verifySession(route);
          
          if (result.success && result.isAuthenticated && result.user) {
            set({
              user: result.user,
              token: 'authenticated',
              isAuthenticated: true,
              error: null,
            });
            return true;
          } else {
            // Sesión inválida
            get().clearAuth();
            return false;
          }
        } catch (error) {
          console.error('❌ AuthStore: Error verificando sesión:', error);
          get().clearAuth();
          return false;
        }
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          token: user ? 'authenticated' : null
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearAuth: () => {
        // También limpiar cookies localmente
        authService.clearAuthState();
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      initializeAuth: async () => {
        const { hasHydrated } = get();
        
        // Solo inicializar después de la hidratación
        if (!hasHydrated) return;

        console.log('🔄 AuthStore: Inicializando autenticación...');

        try {
          // Verificar primero si hay una sesión activa usando cookies
          const hasActiveSession = authService.hasActiveSession();
          
          if (!hasActiveSession) {
            console.log('❌ AuthStore: No hay sesión activa en cookies');
            get().clearAuth();
            return;
          }

          // Intentar obtener usuario desde cookies primero (más rápido)
          const userFromCookie = authService.getUserInfoFromCookie();
          
          if (userFromCookie) {
            console.log('✅ AuthStore: Usuario encontrado en cookies:', userFromCookie.nombre_usuario);
            
            set({
              user: userFromCookie,
              token: 'authenticated',
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Verificar sesión en background para actualizar datos si es necesario
            setTimeout(async () => {
              try {
                await get().verifySession();
              } catch (error) {
                console.warn('⚠️ AuthStore: Error en verificación background:', error);
              }
            }, 100);

          } else {
            // Si no hay usuario en cookies, hacer verificación completa
            console.log('🔍 AuthStore: Verificando sesión con servidor...');
            const isValid = await get().verifySession();
            
            if (!isValid) {
              console.log('❌ AuthStore: Sesión inválida, limpiando estado');
              get().clearAuth();
            }
          }
          
        } catch (error) {
          console.error('❌ AuthStore: Error inicializando auth:', error);
          get().clearAuth();
        }
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated });
        
        if (hasHydrated) {
          // Inicializar auth después de hidratar
          get().initializeAuth();
        }
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('💧 AuthStore: Rehidratando estado desde localStorage');
          state.setHasHydrated(true);
        }
      },
      // Solo persistir datos básicos - las cookies HttpOnly manejan la seguridad real
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);