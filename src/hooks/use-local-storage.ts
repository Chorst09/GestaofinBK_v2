
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const CUSTOM_STORAGE_EVENT_NAME = 'local-storage-change';

/**
 * A robust, SSR-safe hook for using localStorage that syncs state across
 * all components using the same key, avoiding hydration errors and providing
 * user feedback on storage errors.
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();

  // Effect for initial hydration from localStorage.
  // This runs only once on the client-side after mount.
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsReady(true);
      return;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsReady(true);
    }
  }, [key]);

  // This effect listens for storage events to sync state.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (event: Event) => {
      const eventKey = (event as StorageEvent).key || (event as CustomEvent).detail?.key;

      if (eventKey === key) {
        try {
          const item = window.localStorage.getItem(key);
          if (item) {
            setStoredValue(JSON.parse(item));
          } else {
            setStoredValue(initialValue);
          }
        } catch (error) {
          console.warn(`Error re-reading localStorage key "${key}" on storage event:`, error);
        }
      }
    };

    // 'storage' event syncs across tabs/windows.
    window.addEventListener('storage', handleStorageChange);
    // Custom event syncs within the same tab/window.
    window.addEventListener(CUSTOM_STORAGE_EVENT_NAME, handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CUSTOM_STORAGE_EVENT_NAME, handleStorageChange);
    };
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === 'undefined') return;
      
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Manually dispatch a custom event to notify other instances of this hook.
        window.dispatchEvent(new CustomEvent(CUSTOM_STORAGE_EVENT_NAME, { detail: { key } }));
      } catch (error: any) {
        console.warn(`Error setting localStorage key "${key}":`, error);
        
        if (error.name === 'QuotaExceededError' || (error.code && (error.code === 22 || error.code === 1014))) {
            toast({
                variant: "destructive",
                title: "Erro de Armazenamento",
                description: "Não foi possível salvar. O armazenamento do navegador está cheio. Tente usar imagens menores ou limpe dados de outros sites.",
                duration: 9000,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Erro Inesperado",
                description: "Não foi possível salvar a alteração no armazenamento do navegador.",
            });
        }
      }
    },
    [key, storedValue, toast]
  );

  return [storedValue, setValue, isReady];
}

export default useLocalStorage;
