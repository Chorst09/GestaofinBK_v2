
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { CustomCategory, CustomCategoryFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const CUSTOM_CATEGORIES_STORAGE_KEY = 'financasZenCustomCategories';

type UseCategoriesReturn = {
  customCategories: CustomCategory[];
  addCategory: (data: CustomCategoryFormData) => void;
  updateCategory: (data: CustomCategory) => void;
  deleteCategory: (categoryId: string) => void;
  getCategoryById: (categoryId: string) => CustomCategory | undefined;
  getCategoryByName: (categoryName: string) => CustomCategory | undefined;
};

type UseCategoriesBackupReturn = {
  customCategories: CustomCategory[];
  setCustomCategories: (value: CustomCategory[] | ((val: CustomCategory[]) => CustomCategory[])) => void;
  isReady: boolean;
};

export function useCategories(isBackupInstance: true): UseCategoriesBackupReturn;
export function useCategories(isBackupInstance?: false): UseCategoriesReturn;
export function useCategories(isBackupInstance = false): UseCategoriesReturn | UseCategoriesBackupReturn {
  const [storedCategories, setStoredCategories, isReady] = useLocalStorage<CustomCategory[]>(
    CUSTOM_CATEGORIES_STORAGE_KEY,
    []
  );

  const [internalCategories, setInternalCategories] = useState<CustomCategory[]>([]);

  useEffect(() => {
    if (Array.isArray(storedCategories)) {
      const validItems = storedCategories.filter(
        item =>
          item &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          (item.type === 'income' || item.type === 'expense') &&
          typeof item.icon === 'string'
      );
      setInternalCategories(validItems.sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      setInternalCategories([]);
    }
  }, [storedCategories]);

  const addCategory = useCallback(
    (categoryData: CustomCategoryFormData) => {
      const newCategory: CustomCategory = {
        id: uuidv4(),
        ...categoryData,
      };
      setStoredCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
    },
    [setStoredCategories]
  );

  const updateCategory = useCallback(
    (updatedCategoryData: CustomCategory) => {
      setStoredCategories(prev =>
        prev
          .map(category => (category.id === updatedCategoryData.id ? updatedCategoryData : category))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    },
    [setStoredCategories]
  );

  const deleteCategory = useCallback(
    (categoryId: string) => {
      setStoredCategories(prev => prev.filter(category => category.id !== categoryId));
    },
    [setStoredCategories]
  );
  
  const getCategoryById = useCallback(
    (categoryId: string): CustomCategory | undefined => {
      return internalCategories.find(c => c.id === categoryId);
    },
    [internalCategories]
  );

  const getCategoryByName = useCallback(
    (categoryName: string): CustomCategory | undefined => {
        return internalCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    },
    [internalCategories]
  );

  if (isBackupInstance) {
    return {
      customCategories: storedCategories,
      setCustomCategories: setStoredCategories,
      isReady,
    };
  }

  return {
    customCategories: internalCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByName,
  };
}
