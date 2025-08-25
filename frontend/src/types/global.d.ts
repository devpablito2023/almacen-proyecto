/**
 * Tipos globales para toda la aplicación
 * Definiciones base que se usan en múltiples módulos
 */

// Tipos base comunes
export interface BaseEntity {
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  created_by_name?: string;
  updated_by_name?: string;
}

// Estados genéricos
export type EntityStatus = 0 | 1; // 0 = inactivo/eliminado, 1 = activo

// Respuestas de API
export interface ApiResponse<T = any> {
  data: T;
  code: number;
  message: string;
}

export interface ApiError {
  error: string;
  code: number;
  message: string;
}

// Paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Filtros genéricos
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface BaseFilters extends DateRangeFilter {
  status?: EntityStatus;
  search?: string;
}

// Opciones para selects
export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

// Estado de loading
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Navegación
export interface NavigationItem {
  key: string;
  label: string;
  icon?: string;
  href: string;
  children?: NavigationItem[];
  requiredUserTypes?: number[];
}

// Configuración de tabla
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T) => React.ReactNode;
}

// Métricas del dashboard
export interface DashboardMetric {
  key: string;
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  format?: 'number' | 'currency' | 'percentage';
}

// Alertas del sistema
export interface SystemAlert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Archivos
export interface FileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Formularios
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

// Configuración de modales
export interface ModalConfig {
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeable?: boolean;
  footer?: React.ReactNode;
}

// Datos de graficos
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// Configuración de exports
export interface ExportConfig {
  format: 'excel' | 'pdf' | 'csv';
  filename?: string;
  includeHeaders?: boolean;
  filters?: Record<string, any>;
}

// Breadcrumbs
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}