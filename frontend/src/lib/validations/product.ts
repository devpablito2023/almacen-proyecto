// src/lib/validations/product.ts

/**
 * ESQUEMAS DE VALIDACIÓN PARA PRODUCTOS
 */

import { z } from 'zod';
import { VALIDATION_CONFIG, PRODUCT_TYPES ,PRODUCT_TYPES_MUTABLE} from '@/lib/config/constants';

// Validación para productos
export const productSchema = z.object({
  codigo_producto: z
    .string()
    .min(1, 'Código es requerido')
    .max(VALIDATION_CONFIG.PRODUCT_CODE_MAX_LENGTH, 'Código muy largo')
    .regex(/^[A-Z0-9-_]+$/, 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos')
    .transform(val => val.toUpperCase()), // Convertir a mayúsculas automáticamente
  
  nombre_producto: z
    .string()
    .min(1, 'Nombre es requerido')
    .max(VALIDATION_CONFIG.PRODUCT_NAME_MAX_LENGTH, 'Nombre muy largo')
    .transform(val => val.trim()), // Limpiar espacios
  
  tipo_producto: z
    //.enum(PRODUCT_TYPES as [string, ...string[]], {
    .enum(PRODUCT_TYPES_MUTABLE, {
      errorMap: () => ({ message: 'Tipo de producto inválido' })
    }),
  
  categoria_producto: z
    .string()
    .min(1, 'Categoría es requerida')
    .max(50, 'Categoría muy larga'),
  
  descripcion_producto: z
    .string()
    .max(VALIDATION_CONFIG.DESCRIPTION_MAX_LENGTH, 'Descripción muy larga')
    .optional()
    .or(z.literal('')), // Permitir string vacío
  
  stock_minimo: z
    .number({
      required_error: 'Stock mínimo es requerido',
      invalid_type_error: 'Stock mínimo debe ser un número'
    })
    .min(VALIDATION_CONFIG.STOCK_MIN_VALUE, 'Stock mínimo no puede ser negativo')
    .max(VALIDATION_CONFIG.STOCK_MAX_VALUE, 'Stock mínimo muy alto')
    .int('Stock mínimo debe ser un número entero'),
  
  stock_maximo: z
    .number({
      required_error: 'Stock máximo es requerido',
      invalid_type_error: 'Stock máximo debe ser un número'
    })
    .min(1, 'Stock máximo debe ser mayor a 0')
    .max(VALIDATION_CONFIG.STOCK_MAX_VALUE, 'Stock máximo muy alto')
    .int('Stock máximo debe ser un número entero'),
  
  stock_critico: z
    .number({
      required_error: 'Stock crítico es requerido',
      invalid_type_error: 'Stock crítico debe ser un número'
    })
    .min(VALIDATION_CONFIG.STOCK_MIN_VALUE, 'Stock crítico no puede ser negativo')
    .max(VALIDATION_CONFIG.STOCK_MAX_VALUE, 'Stock crítico muy alto')
    .int('Stock crítico debe ser un número entero'),
  
  costo_unitario: z
    .number({
      required_error: 'Costo unitario es requerido',
      invalid_type_error: 'Costo unitario debe ser un número'
    })
    .min(0, 'Costo unitario no puede ser negativo')
    .max(VALIDATION_CONFIG.PRECIO_MAX_VALUE, 'Costo unitario muy alto'),
  
  magnitud_producto: z
    .string()
    .min(1, 'Magnitud es requerida')
    .max(10, 'Magnitud muy larga')
    .default('UND'),
  
  ubicacion_fisica: z
    .string()
    .max(50, 'Ubicación muy larga')
    .optional()
    .or(z.literal('')),
  
  requiere_lote: z
    .boolean()
    .default(false),
    
}).refine(data => data.stock_critico <= data.stock_minimo, {
  message: 'Stock crítico debe ser menor o igual al stock mínimo',
  path: ['stock_critico'],
}).refine(data => data.stock_minimo <= data.stock_maximo, {
  message: 'Stock mínimo debe ser menor o igual al stock máximo',
  path: ['stock_minimo'],
});

// Validación para filtros de búsqueda
export const productFiltersSchema = z.object({
  search: z.string().optional(),
  tipo_producto: z.enum(['', ...PRODUCT_TYPES] as [string, ...string[]]).optional(),
  categoria_producto: z.string().optional(),
  estado_producto: z.number().int().optional(),
  stock_bajo: z.boolean().optional(),
  stock_critico: z.boolean().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(1000).optional().default(20),
  sort_by: z.enum(['nombre_producto', 'codigo_producto', 'created_at', 'stock_minimo']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Validación para importación desde Excel
export const productImportSchema = z.object({
  codigo_producto: z.string().min(1, 'Código requerido'),
  nombre_producto: z.string().min(1, 'Nombre requerido'),
  tipo_producto: z.string().min(1, 'Tipo requerido'),
  categoria_producto: z.string().min(1, 'Categoría requerida'),
  stock_minimo: z.union([z.string(), z.number()]).transform(val => {
    const num = typeof val === 'string' ? parseInt(val) : val;
    return isNaN(num) ? 0 : num;
  }),
  stock_maximo: z.union([z.string(), z.number()]).transform(val => {
    const num = typeof val === 'string' ? parseInt(val) : val;
    return isNaN(num) ? 0 : num;
  }),
  stock_critico: z.union([z.string(), z.number()]).transform(val => {
    const num = typeof val === 'string' ? parseInt(val) : val;
    return isNaN(num) ? 0 : num;
  }),
  magnitud_producto: z.string().optional().default('UND'),
  descripcion_producto: z.string().optional(),
  costo_unitario: z.union([z.string(), z.number()]).transform(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  }).optional().default(0),
});

// Tipos inferidos
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductFiltersData = z.infer<typeof productFiltersSchema>;
export type ProductImportData = z.infer<typeof productImportSchema>;