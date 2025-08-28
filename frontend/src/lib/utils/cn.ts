import { type ClassValue } from 'clsx';

/**
 * Utility función para combinar class names de manera inteligente
 * Similar a clsx pero más simple para este proyecto
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

/**
 * Utility para crear variantes de componentes
 */
export function createVariants<T extends Record<string, Record<string, string>>>(variants: T) {
  return (props: { [K in keyof T]?: keyof T[K] } & { className?: string }) => {
    const { className, ...variantProps } = props;
    const variantClasses = Object.entries(variantProps)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => variants[key]?.[value as string])
      .filter(Boolean);

    return cn(...variantClasses, className);
  };
}