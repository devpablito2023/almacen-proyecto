// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
  setHasHydrated: (hydrated: boolean) => void;
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
          const response = await fetch('http://localhost:7070/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email_usuario: email,
              password: password,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success && data.data) {
            const { token, user } = data.data;
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return { success: true };
          } else {
            const errorMessage = data.message || 'Credenciales inválidas';
            set({
              isLoading: false,
              error: errorMessage,
              isAuthenticated: false,
            });
            return { success: false, message: errorMessage };
          }
        } catch (error) {
          const errorMessage = 'Error de conexión';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          return { success: false, message: errorMessage };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      initializeAuth: () => {
        const { token, user } = get();
        if (token && user) {
          set({ isAuthenticated: true, error: null, isLoading: false });
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
        }
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          state.initializeAuth();
        }
      },
    }
  )
);