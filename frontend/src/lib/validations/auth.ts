// src/lib/validations/auth.ts

/**
 * ESQUEMAS DE VALIDACIÓN PARA AUTENTICACIÓN
 * Usando Zod para validación robusta de formularios
 */

import { z } from 'zod';
import { VALIDATION_CONFIG } from '@/lib/config/constants';

// Validación para login
export const loginSchema = z.object({
  email_usuario: z
    .string()
    .min(1, 'Email es requerido')
    .email('Formato de email inválido')
    .max(VALIDATION_CONFIG.EMAIL_MAX_LENGTH, 'Email muy largo'),
  
  password: z
    .string()
    .min(VALIDATION_CONFIG.PASSWORD_MIN_LENGTH, `Contraseña debe tener al menos ${VALIDATION_CONFIG.PASSWORD_MIN_LENGTH} caracteres`)
    .max(VALIDATION_CONFIG.PASSWORD_MAX_LENGTH, 'Contraseña muy larga'),
  
  remember_me: z.boolean().optional(),
});

// Validación para cambio de contraseña
export const changePasswordSchema = z.object({
  current_password: z
    .string()
    .min(1, 'Contraseña actual requerida'),
  
  new_password: z
    .string()
    .min(VALIDATION_CONFIG.PASSWORD_MIN_LENGTH, `Nueva contraseña debe tener al menos ${VALIDATION_CONFIG.PASSWORD_MIN_LENGTH} caracteres`)
    .max(VALIDATION_CONFIG.PASSWORD_MAX_LENGTH, 'Nueva contraseña muy larga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número'),
  
  confirm_password: z
    .string()
    .min(1, 'Confirmar contraseña es requerido'),
    
}).refine(data => data.new_password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
}).refine(data => data.current_password !== data.new_password, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['new_password'],
});

// Validación para reset de contraseña
export const resetPasswordSchema = z.object({
  email_usuario: z
    .string()
    .min(1, 'Email es requerido')
    .email('Formato de email inválido')
    .max(VALIDATION_CONFIG.EMAIL_MAX_LENGTH, 'Email muy largo'),
});

// Validación para perfil de usuario
export const userProfileSchema = z.object({
  nombre_usuario: z
    .string()
    .min(VALIDATION_CONFIG.USERNAME_MIN_LENGTH, 'Nombre muy corto')
    .max(VALIDATION_CONFIG.USERNAME_MAX_LENGTH, 'Nombre muy largo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email_usuario: z
    .string()
    .min(1, 'Email es requerido')
    .email('Formato de email inválido')
    .max(VALIDATION_CONFIG.EMAIL_MAX_LENGTH, 'Email muy largo'),
  
  area_usuario: z
    .string()
    .min(1, 'Área es requerida')
    .max(50, 'Área muy larga'),
});

// Tipos inferidos de los esquemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;