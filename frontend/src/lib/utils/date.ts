/**
 * Utilidades específicas para manejo de fechas en el sistema
 * Enfocado en las necesidades del control de almacén
 */

// Obtener fecha actual en formato ISO
export const getCurrentDate = (): string => {
  return new Date().toISOString();
};

// Obtener solo la fecha (sin hora) en formato YYYY-MM-DD
export const getDateOnly = (date?: Date | string): string => {
  const dateObj = date ? new Date(date) : new Date();
  return dateObj.toISOString().split('T')[0];
};

// Agregar días a una fecha
export const addDays = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

// Restar días a una fecha
export const subtractDays = (date: Date | string, days: number): Date => {
  return addDays(date, -days);
};

// Diferencia en días entre dos fechas
export const getDaysDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Verificar si una fecha está vencida
export const isExpired = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

// Verificar si una fecha está próxima a vencer (30 días)
export const isNearExpiry = (date: Date | string, daysThreshold: number = 30): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const threshold = addDays(new Date(), daysThreshold);
  return dateObj <= threshold && dateObj >= new Date();
};

// Obtener el inicio del día
export const getStartOfDay = (date?: Date | string): Date => {
  const dateObj = date ? new Date(date) : new Date();
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

// Obtener el final del día
export const getEndOfDay = (date?: Date | string): Date => {
  const dateObj = date ? new Date(date) : new Date();
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

// Obtener el inicio de la semana (lunes)
export const getStartOfWeek = (date?: Date | string): Date => {
  const dateObj = date ? new Date(date) : new Date();
  const day = dateObj.getDay();
  const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
  return getStartOfDay(new Date(dateObj.setDate(diff)));
};

// Obtener el inicio del mes
export const getStartOfMonth = (date?: Date | string): Date => {
  const dateObj = date ? new Date(date) : new Date();
  return getStartOfDay(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
};

// Formatear fecha para inputs HTML
export const formatForInput = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
};

// Validar formato de fecha
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Generar rango de fechas para reportes
export const getDateRangePresets = () => {
  const today = new Date();
  
  return {
    today: {
      start: getStartOfDay(today),
      end: getEndOfDay(today),
      label: 'Hoy',
    },
    yesterday: {
      start: getStartOfDay(subtractDays(today, 1)),
      end: getEndOfDay(subtractDays(today, 1)),
      label: 'Ayer',
    },
    thisWeek: {
      start: getStartOfWeek(today),
      end: getEndOfDay(today),
      label: 'Esta semana',
    },
    thisMonth: {
      start: getStartOfMonth(today),
      end: getEndOfDay(today),
      label: 'Este mes',
    },
    last30Days: {
      start: getStartOfDay(subtractDays(today, 30)),
      end: getEndOfDay(today),
      label: 'Últimos 30 días',
    },
  };
};

// Formatear duración en horas y minutos
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};