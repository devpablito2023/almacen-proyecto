import apiClient from './client';
import { endpoints } from './endpoints';
import { 
  LoginCredentials, 
  LoginResponse, 
  ChangePasswordData, 
  ResetPasswordData, 
  ConfirmResetPasswordData, 
  UserProfile,
  User 
} from '../../types/auth';
import { ApiResponse } from '../../types/global';

/**
 * Servicios de autenticación
 * Maneja todas las operaciones relacionadas con auth
 */
export class AuthService {
  /**
   * Iniciar sesión
   */
async login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    endpoints.auth.login,
    credentials
  );
  
  console.log('🌐 API Response:', {
    hasData: !!response.data,
    hasToken: !!response.data?.token,
    hasUser: !!response.data?.user
  });
  
  return response.data;
}

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(endpoints.auth.logout);
    } catch (error) {
      // Si falla el logout en el servidor, al menos limpiamos localmente
      console.warn('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Siempre limpiar la sesión local
      apiClient.clearSession();
    }
  }

  /**
   * Refrescar token
   */
  async refreshToken(): Promise<{ token: string; refresh_token?: string }> {
    const response = await apiClient.post<{ token: string; refresh_token?: string }>(
      endpoints.auth.refresh
    );
    return response.data;
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.post(endpoints.auth.changePassword, data);
  }

  /**
   * Solicitar reset de contraseña
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await apiClient.post(endpoints.auth.resetPassword, data);
  }

  /**
   * Confirmar reset de contraseña
   */
  async confirmResetPassword(data: ConfirmResetPasswordData): Promise<void> {
    await apiClient.post(endpoints.auth.confirmResetPassword, data);
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>(endpoints.auth.profile);
    return response.data;
  }

  /**
   * Actualizar perfil del usuario actual
   */
  async updateProfile(profile: UserProfile): Promise<User> {
    const response = await apiClient.put<User>(endpoints.auth.profile, profile);
    return response.data;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Obtener el token actual
   */
  getCurrentToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Obtener datos del usuario desde localStorage
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Guardar datos del usuario en localStorage
   */
  setCurrentUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  /**
   * Limpiar datos de sesión
   */
  clearSession(): void {
    apiClient.clearSession();
  }

  /**
   * Decodificar token JWT (básico)
   */
  decodeToken(token?: string): any {
    const tokenToUse = token || this.getCurrentToken();
    
    if (!tokenToUse) return null;

    try {
      // Decodificación básica del JWT (solo para obtener payload)
      const base64Url = tokenToUse.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Verificar si el token ha expirado
   */
  isTokenExpired(token?: string): boolean {
    const payload = this.decodeToken(token);
    
    if (!payload || !payload.exp) return true;

    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  }

  /**
   * Obtener tiempo restante del token (en minutos)
   */
  getTokenTimeRemaining(token?: string): number {
    const payload = this.decodeToken(token);
    
    if (!payload || !payload.exp) return 0;

    const currentTime = Date.now() / 1000;
    const remaining = payload.exp - currentTime;
    
    return Math.max(0, Math.floor(remaining / 60)); // en minutos
  }

  /**
   * Verificar si el usuario tiene un tipo específico
   */
  hasUserType(requiredType: number): boolean {
    const user = this.getCurrentUser();
    return user?.tipo_usuario === requiredType;
  }

  /**
   * Verificar si el usuario tiene uno de varios tipos
   */
  hasAnyUserType(requiredTypes: number[]): boolean {
    const user = this.getCurrentUser();
    return user ? requiredTypes.includes(user.tipo_usuario) : false;
  }

  /**
   * Verificar si es superusuario
   */
  isSuperUser(): boolean {
    return this.hasUserType(0);
  }
}

// Instancia singleton del servicio
const authService = new AuthService();

export default authService;