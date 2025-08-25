import { z } from 'zod';
import { USER_TYPES } from '../config/constants';

/**
 * Esquemas de validación para el módulo de autenticación
 * Usando Zod para validaciones type-safe
 */

// Validación de email
const emailSchema = z.string()
  .min(1, 'El email es requerido')
  .email('Formato de email inválido')
  .max(100, 'El email no puede exceder 100 caracteres');

// Validación de contraseña
const passwordSchema = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'La contraseña no puede exceder 100 caracteres')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
  );

// Esquema para login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Esquema para cambio de contraseña
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'La contraseña actual es requerida'),
  new_password: passwordSchema,
  confirm_password: z.string().min(1, 'Confirmar contraseña es requerido'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Esquema para reset de contraseña
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Esquema para confirmar reset de contraseña
export const confirmResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token es requerido'),
  new_password: passwordSchema,
  confirm_password: z.string().min(1, 'Confirmar contraseña es requerido'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
});

export type ConfirmResetPasswordFormData = z.infer<typeof confirmResetPasswordSchema>;

// Esquema para perfil de usuario
export const userProfileSchema = z.object({
  nombre_usuario: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  email_usuario: emailSchema,
  area_usuario: z.string()
    .min(2, 'El área debe tener al menos 2 caracteres')
    .max(50, 'El área no puede exceder 50 caracteres'),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

// Esquema para crear usuario (solo superusuario)
export const createUserSchema = z.object({
  codigo_usuario: z.string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(20, 'El código no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9_-]+$/, 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'),
  nombre_usuario: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email_usuario: emailSchema,
  tipo_usuario: z.number()
    .min(0, 'Tipo de usuario inválido')
    .max(5, 'Tipo de usuario inválido')
    .refine((val) => Object.values(USER_TYPES).includes(val as any), {
      message: 'Tipo de usuario no válido',
    }),
  area_usuario: z.string()
    .min(2, 'El área debe tener al menos 2 caracteres')
    .max(50, 'El área no puede exceder 50 caracteres'),
  password: passwordSchema,
  confirm_password: z.string().min(1, 'Confirmar contraseña es requerido'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Esquema para actualizar usuario
export const updateUserSchema = createUserSchema.partial().extend({
  id_usuario: z.number().min(1, 'ID de usuario requerido'),
  estado_usuario: z.number().min(0).max(1).optional(),
}).omit({ password: true, confirm_password: true });

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// Esquema para filtros de usuario
export const userFiltersSchema = z.object({
  tipo_usuario: z.number().min(0).max(5).optional(),
  estado_usuario: z.number().min(0).max(1).optional(),
  area_usuario: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type UserFiltersFormData = z.infer<typeof userFiltersSchema>;

// Validaciones auxiliares
export const validateUserType = (userType: number): boolean => {
  return Object.values(USER_TYPES).includes(userType as any);
};

export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  try {
    emailSchema.parse(email);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]; // Los errores de Zod están en 'issues', no en 'errors'
      return { valid: false, message: firstError?.message || 'Email inválido' };
      //return { valid: false, message: error.errors[0]?.message };
    }
    return { valid: false, message: 'Email inválido' };
  }
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  try {
    passwordSchema.parse(password);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]; // Los errores de Zod están en 'issues', no en 'errors'
      return { valid: false, message: firstError?.message || 'Contraseña inválida' };
      //return { valid: false, message: error.errors[0]?.message };
    }
    return { valid: false, message: 'Contraseña inválida' };
  }
};

// Mensajes de error personalizados en español
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciales inválidas. Verifique su email y contraseña.',
  ACCOUNT_LOCKED: 'Cuenta bloqueada por múltiples intentos fallidos. Contacte al administrador.',
  ACCOUNT_INACTIVE: 'Su cuenta está inactiva. Contacte al administrador.',
  TOKEN_EXPIRED: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
  TOKEN_INVALID: 'Token de sesión inválido. Por favor, inicie sesión nuevamente.',
  EMAIL_ALREADY_EXISTS: 'Ya existe un usuario con este email.',
  CODE_ALREADY_EXISTS: 'Ya existe un usuario con este código.',
  USER_NOT_FOUND: 'Usuario no encontrado.',
  CURRENT_PASSWORD_INCORRECT: 'La contraseña actual es incorrecta.',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet.',
  SERVER_ERROR: 'Error interno del servidor. Intente nuevamente más tarde.',
} as const;