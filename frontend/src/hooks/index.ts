/**
 * Exportaciones centralizadas de todos los hooks
 * Permite importar hooks de manera consistente
 */

// Hooks de autenticación
export { 
  useAuth, 
  usePermissions, 
  useRequireAuth 
} from './useAuth';

// Hooks de localStorage
export {
  useLocalStorage,
  useLocalStorageBoolean,
  useLocalStorageArray,
  useLocalStorageObject,
  useUserPreferences,
} from './useLocalStorage';

// Re-exportar hooks de stores para conveniencia
export {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useIsLoading,
  useAuthError,
  useUserPermissions,
  useUserData,
} from '../stores/authStore';