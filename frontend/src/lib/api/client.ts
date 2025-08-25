import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { apiConfig, storageConfig } from '../config/env';
import { ApiResponse, ApiError } from '../../types/global';

/**
 * Cliente HTTP configurado para la API del backend
 * Maneja interceptores, autenticación y errores automáticamente
 */

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Agregar token automáticamente
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log para desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔵 ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Manejar respuestas y errores
    this.instance.interceptors.response.use(
      (response) => {
        // Log para desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(`🟢 ${response.status} ${response.config.url}`, response.data);
        }
        
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Manejar error 401 - Token expirado
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Si ya se está refrescando, agregar a la cola
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            
            // Procesar cola de requests fallidos
            this.processQueue(null, newToken);
            
            // Reintentar request original
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.clearStoredTokens();
            
            // Redirigir a login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Log de errores
        console.error(`❌ ${error.response?.status || 'Network'} Error:`, {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        return Promise.reject(this.transformError(error));
      }
    );
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${apiConfig.baseURL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { token, refresh_token: newRefreshToken } = response.data;
      
      this.setStoredToken(token);
      if (newRefreshToken) {
        this.setStoredRefreshToken(newRefreshToken);
      }
      
      return token;
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  private transformError(error: AxiosError): ApiError {
    // Error de red
    if (!error.response) {
      return {
        error: 'NETWORK_ERROR',
        code: 0,
        message: 'Error de conexión. Verifique su conexión a internet.',
      };
    }

    // Error del servidor con respuesta
    const { status, data } = error.response;
    
    // Si el servidor devuelve el formato esperado
    if (data && typeof data === 'object' && 'error' in data) {
      return data as ApiError;
    }

    // Mapear errores HTTP comunes
    const errorMessages: Record<number, string> = {
      400: 'Solicitud inválida',
      401: 'No autorizado. Inicie sesión nuevamente',
      403: 'No tiene permisos para realizar esta acción',
      404: 'Recurso no encontrado',
      409: 'Conflicto. El recurso ya existe',
      422: 'Datos inválidos',
      500: 'Error interno del servidor',
      502: 'Servidor no disponible',
      503: 'Servicio no disponible',
    };

    return {
      error: `HTTP_${status}`,
      code: status,
      message: errorMessages[status] || 'Error inesperado del servidor',
    };
  }

  // Métodos para manejo de tokens
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(storageConfig.keys.token);
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(storageConfig.keys.refreshToken);
  }

  private setStoredToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageConfig.keys.token, token);
  }

  private setStoredRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageConfig.keys.refreshToken, token);
  }

  private clearStoredTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(storageConfig.keys.token);
    localStorage.removeItem(storageConfig.keys.refreshToken);
    localStorage.removeItem(storageConfig.keys.user);
  }

  // Métodos públicos del cliente
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    console.log("ahora estoy en api/clients , en la funcion post , que envia los datos ")
    console.log(url)
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Método para subir archivos
  async upload<T = any>(url: string, file: File | FormData, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = file instanceof FormData ? file : new FormData();
    
    if (file instanceof File) {
      formData.append('file', file);
    }

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    };

    const response = await this.instance.post<ApiResponse<T>>(url, formData, config);
    return response.data;
  }

  // Método para descargar archivos
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    });

    // Crear enlace de descarga
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Método para obtener la instancia de Axios (casos especiales)
  getInstance(): AxiosInstance {
    return this.instance;
  }

  // Método para limpiar la sesión
  clearSession(): void {
    this.clearStoredTokens();
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      // Verificar si el token no ha expirado (decodificación básica)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }
}

// Instancia singleton del cliente
const apiClient = new ApiClient();

// Exportar tanto la clase como la instancia
export { ApiClient };
export default apiClient;