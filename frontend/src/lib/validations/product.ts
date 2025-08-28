import { z ,ZodError} from 'zod';
import { PRODUCT_TYPES } from '../config/constants';

/**
 * Esquemas de validación para el módulo de productos
 * Basado en las especificaciones del sistema
 */

// Validación de código de producto
const productCodeSchema = z.string()
  .min(3, 'El código debe tener al menos 3 caracteres')
  .max(20, 'El código no puede exceder 20 caracteres')
  .regex(/^[A-Z0-9_-]+$/, 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos')
  .transform(val => val.toUpperCase().trim());

// Validación de nombre de producto
const productNameSchema = z.string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede exceder 100 caracteres')
  .transform(val => val.trim());

// Validación de tipo de producto
/*
const productTypeSchema = z.enum(['insumo', 'repuesto', 'herramienta', 'otro'], {
  errorMap: () => ({ message: 'Tipo de producto no válido' }),
});
*/
const productTypeSchema = z.enum(['insumo', 'repuesto', 'herramienta', 'otro'], {
  message: 'Tipo de producto no válido'
});
// Validación de números positivos
const positiveNumberSchema = z.number()
  .min(0, 'El valor no puede ser negativo')
  .finite('El valor debe ser un número válido');

// Validación de stock
const stockSchema = z.number()
  .min(0, 'El stock no puede ser negativo')
  .int('El stock debe ser un número entero')
  .finite('El valor debe ser un número válido');

// Validación de fechas
const dateSchema = z.string()
  .refine((date) => !date || !isNaN(Date.parse(date)), {
    message: 'Formato de fecha inválido',
  })
  .optional();

// Validación de URL de imagen
const imageUrlSchema = z.string()
  .url('URL de imagen inválida')
  .refine((url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  }, 'La URL debe apuntar a una imagen válida')
  .optional();

// Esquema principal para crear producto
export const createProductSchema = z.object({
  codigo_producto: productCodeSchema,
  nombre_producto: productNameSchema,
  tipo_producto: productTypeSchema,
  categoria_producto: z.string()
    .max(50, 'La categoría no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  proveedor_producto: z.string()
    .max(100, 'El proveedor no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  costo_unitario: positiveNumberSchema
    .max(999999.99, 'El costo unitario es demasiado alto')
    .optional(),
  precio_referencial: positiveNumberSchema
    .max(999999.99, 'El precio referencial es demasiado alto')
    .optional(),
  ubicacion_fisica: z.string()
    .max(50, 'La ubicación no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  fecha_vencimiento: dateSchema,
  lote_serie: z.string()
    .max(50, 'El lote/serie no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  stock_minimo: stockSchema.optional(),
  stock_maximo: stockSchema.optional(),
  stock_critico: stockSchema.optional(),
  descripcion_producto: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  url_foto_producto: imageUrlSchema,
  magnitud_producto: z.string()
    .min(1, 'La magnitud es requerida')
    .max(10, 'La magnitud no puede exceder 10 caracteres')
    .default('UND'),
  requiere_lote: z.boolean().default(false),
  dias_vida_util: z.number()
    .min(1, 'Los días de vida útil deben ser mayor a 0')
    .max(3650, 'Los días de vida útil no pueden exceder 10 años')
    .int('Los días deben ser un número entero')
    .optional(),
}).refine((data) => {
  // Validar que stock_critico <= stock_minimo <= stock_maximo
  if (data.stock_minimo && data.stock_maximo && data.stock_minimo > data.stock_maximo) {
    return false;
  }
  if (data.stock_critico && data.stock_minimo && data.stock_critico > data.stock_minimo) {
    return false;
  }
  return true;
}, {
  message: 'Stock crítico ≤ Stock mínimo ≤ Stock máximo',
  path: ['stock_minimo'],
}).refine((data) => {
  // Si requiere lote y hay fecha de vencimiento, debe tener días de vida útil
  if (data.requiere_lote && data.fecha_vencimiento && !data.dias_vida_util) {
    return false;
  }
  return true;
}, {
  message: 'Si el producto requiere lote y tiene fecha de vencimiento, debe especificar días de vida útil',
  path: ['dias_vida_util'],
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;

// Esquema para actualizar producto
export const updateProductSchema = createProductSchema.partial().extend({
  id_producto: z.number().min(1, 'ID de producto requerido'),
  estado_producto: z.number().min(0).max(1).optional(),
});

export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

// Esquema para filtros de productos
export const productFiltersSchema = z.object({
  tipo_producto: productTypeSchema.optional(),
  categoria_producto: z.string().optional(),
  proveedor_producto: z.string().optional(),
  estado_producto: z.number().min(0).max(1).optional(),
  stock_bajo: z.boolean().optional(),
  stock_critico: z.boolean().optional(),
  proximos_vencer: z.boolean().optional(),
  vencidos: z.boolean().optional(),
  ubicacion_fisica: z.string().optional(),
  requiere_lote: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type ProductFiltersFormData = z.infer<typeof productFiltersSchema>;

// Esquema para importación de productos desde Excel
export const productImportSchema = z.object({
  codigo_producto: productCodeSchema,
  nombre_producto: productNameSchema,
  tipo_producto: z.string().transform((val) => {
    const normalizedType = val.toLowerCase().trim();
    const validTypes = Object.values(PRODUCT_TYPES);
    
    // Mapear variaciones comunes
    const typeMapping: Record<string, string> = {
      'insumos': 'insumo',
      'repuestos': 'repuesto',
      'herramientas': 'herramienta',
      'otros': 'otro',
      'tool': 'herramienta',
      'tools': 'herramienta',
      'supply': 'insumo',
      'supplies': 'insumo',
      'spare': 'repuesto',
      'spares': 'repuesto',
      'part': 'repuesto',
      'parts': 'repuesto',
    };
    
    const mappedType = typeMapping[normalizedType] || normalizedType;
    
    if (!validTypes.includes(mappedType as any)) {
      throw new z.ZodError([{
        code: 'custom',
        message: `Tipo de producto inválido: ${val}. Debe ser: ${validTypes.join(', ')}`,
        path: ['tipo_producto'],
      }]);
    }
    
    return mappedType;
  }),
  categoria_producto: z.string().optional().transform(val => val || undefined),
  proveedor_producto: z.string().optional().transform(val => val || undefined),
  costo_unitario: z.union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const cleaned = val.replace(/[^\d.-]/g, ''); // Remover caracteres no numéricos excepto punto y guión
        const num = parseFloat(cleaned);
        if (isNaN(num)) return undefined;
        return num;
      }
      return val;
    })
    .optional(),
  precio_referencial: z.union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const cleaned = val.replace(/[^\d.-]/g, '');
        const num = parseFloat(cleaned);
        if (isNaN(num)) return undefined;
        return num;
      }
      return val;
    })
    .optional(),
  stock_minimo: z.union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const num = parseInt(val, 10);
        if (isNaN(num)) return undefined;
        return num;
      }
      return val;
    })
    .optional(),
  stock_maximo: z.union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const num = parseInt(val, 10);
        if (isNaN(num)) return undefined;
        return num;
      }
      return val;
    })
    .optional(),
  stock_critico: z.union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const num = parseInt(val, 10);
        if (isNaN(num)) return undefined;
        return num;
      }
      return val;
    })
    .optional(),
  descripcion_producto: z.string().optional().transform(val => val || undefined),
  magnitud_producto: z.string().default('UND'),
  ubicacion_fisica: z.string().optional().transform(val => val || undefined),
});

export type ProductImportFormData = z.infer<typeof productImportSchema>;

// Validaciones auxiliares
/*
export const validateProductCode = (code: string): { valid: boolean; message?: string } => {
  try {
    productCodeSchema.parse(code);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, message: error.errors[0]?.message };
    }
    return { valid: false, message: 'Código de producto inválido' };
  }
};
*/
export const validateProductCode = (code: string): { valid: boolean; message?: string } => {
  try {
    productCodeSchema.parse(code);
    return { valid: true };
  } catch (error) {
    // Verificación más específica del error de Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]; // Los errores de Zod están en 'issues', no en 'errors'
      return { valid: false, message: firstError?.message || 'Código de producto inválido' };
    }
    return { valid: false, message: 'Código de producto inválido' };
  }
};


export const validateProductType = (type: string): boolean => {
  return Object.values(PRODUCT_TYPES).includes(type as any);
};

// Mensajes de error personalizados
export const PRODUCT_ERROR_MESSAGES = {
  CODE_ALREADY_EXISTS: 'Ya existe un producto con este código',
  PRODUCT_NOT_FOUND: 'Producto no encontrado',
  PRODUCT_HAS_STOCK: 'No se puede eliminar un producto que tiene stock',
  INVALID_STOCK_LEVELS: 'Los niveles de stock no son válidos (crítico ≤ mínimo ≤ máximo)',
  IMPORT_FILE_INVALID: 'Archivo de importación inválido',
  IMPORT_NO_DATA: 'El archivo no contiene datos válidos',
  PRODUCT_INACTIVE: 'El producto está inactivo',
} as const;