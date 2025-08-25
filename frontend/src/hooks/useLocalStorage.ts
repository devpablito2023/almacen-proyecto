"use client";
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para manejar localStorage de manera reactiva
 * Incluye soporte para SSR y manejo de errores
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error leyendo localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para establecer valor
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Permitir valor como función para tener la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Disparar evento personalizado para sincronizar entre tabs
        window.dispatchEvent(new CustomEvent('local-storage', {
          detail: { key, newValue: valueToStore }
        }));
      }
    } catch (error) {
      console.warn(`Error guardando en localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Función para remover valor
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('local-storage', {
          detail: { key, newValue: undefined }
        }));
      }
    } catch (error) {
      console.warn(`Error removiendo localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Escuchar cambios en localStorage (sincronización entre tabs)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('detail' in e) {
        // Evento personalizado de nuestro hook
        const { key: eventKey, newValue } = e.detail;
        if (eventKey === key) {
          setStoredValue(newValue ?? initialValue);
        }
      } else {
        // Evento nativo de storage
        if (e.key === key) {
          try {
            const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
            setStoredValue(newValue);
          } catch (error) {
            console.warn(`Error parseando valor de localStorage para key "${key}":`, error);
            setStoredValue(initialValue);
          }
        }
      }
    };

    // Escuchar eventos nativos de storage (cambios desde otras tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar nuestros eventos personalizados (cambios desde la misma tab)
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook simplificado para valores booleanos
 */
export function useLocalStorageBoolean(key: string, initialValue = false) {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
  
  const toggleValue = useCallback(() => {
    setValue(prev => !prev);
  }, [setValue]);

  return [value, setValue, toggleValue, removeValue] as const;
}

/**
 * Hook para arrays con utilidades adicionales
 */
export function useLocalStorageArray<T>(key: string, initialValue: T[] = []) {
  const [array, setArray, removeArray] = useLocalStorage<T[]>(key, initialValue);

  const addItem = useCallback((item: T) => {
    setArray(prev => [...prev, item]);
  }, [setArray]);

  const removeItem = useCallback((index: number) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  }, [setArray]);

  const removeItemByValue = useCallback((item: T) => {
    setArray(prev => prev.filter(i => i !== item));
  }, [setArray]);

  const updateItem = useCallback((index: number, newItem: T) => {
    setArray(prev => prev.map((item, i) => i === index ? newItem : item));
  }, [setArray]);

  const clearArray = useCallback(() => {
    setArray([]);
  }, [setArray]);

  return {
    array,
    setArray,
    addItem,
    removeItem,
    removeItemByValue,
    updateItem,
    clearArray,
    removeArray,
  };
}

/**
 * Hook para objetos con utilidades de merge
 */
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string, 
  initialValue: T
) {
  const [object, setObject, removeObject] = useLocalStorage<T>(key, initialValue);

  const updateObject = useCallback((updates: Partial<T>) => {
    setObject(prev => ({ ...prev, ...updates }));
  }, [setObject]);

  const resetObject = useCallback(() => {
    setObject(initialValue);
  }, [setObject, initialValue]);

  return [object, setObject, updateObject, resetObject, removeObject] as const;
}

/**
 * Hook para manejar preferencias de usuario
 */
export function useUserPreferences() {
  const [preferences, setPreferences, updatePreferences] = useLocalStorageObject(
    'user-preferences',
    {
      theme: 'light' as 'light' | 'dark',
      language: 'es' as string,
      pageSize: 10 as number,
      sidebarCollapsed: false as boolean,
      notifications: true as boolean,
    }
  );

  return {
    preferences,
    setPreferences,
    updatePreferences,
    setTheme: (theme: 'light' | 'dark') => updatePreferences({ theme }),
    setLanguage: (language: string) => updatePreferences({ language }),
    setPageSize: (pageSize: number) => updatePreferences({ pageSize }),
    setSidebarCollapsed: (collapsed: boolean) => updatePreferences({ sidebarCollapsed: collapsed }),
    setNotifications: (enabled: boolean) => updatePreferences({ notifications: enabled }),
  };
}