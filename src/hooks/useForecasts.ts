
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { ForecastItem, ForecastItemFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';
import { addMonths, startOfMonth } from 'date-fns';

const FORECAST_ITEMS_STORAGE_KEY = 'financasZenForecastItems';

type UseForecastsReturn = {
  forecastItems: ForecastItem[];
  addForecastItem: (data: ForecastItemFormData) => void;
  updateForecastItem: (data: ForecastItem) => void;
  deleteForecastItem: (itemId: string, deleteAllRelated?: boolean) => void;
  getForecastItemById: (itemId: string) => ForecastItem | undefined;
  getForecastTotalsForMonth: (targetDate?: Date) => { forecastedIncome: number; forecastedExpenses: number; };
  getOverallForecastTotals: () => { totalForecastedIncome: number; totalForecastedExpenses: number; };
};

type UseForecastsBackupReturn = {
  forecastItems: ForecastItem[];
  setForecastItems: (value: ForecastItem[] | ((val: ForecastItem[]) => ForecastItem[])) => void;
  isReady: boolean;
};

export function useForecasts(isBackupInstance: true): UseForecastsBackupReturn;
export function useForecasts(isBackupInstance?: false): UseForecastsReturn;
export function useForecasts(isBackupInstance = false): UseForecastsReturn | UseForecastsBackupReturn {
  const [storedForecastItems, setStoredForecastItems, isReady] = useLocalStorage<ForecastItem[]>(
    FORECAST_ITEMS_STORAGE_KEY,
    []
  );

  const [internalForecastItems, setInternalForecastItems] = useState<ForecastItem[]>([]);

  useEffect(() => {
    if (Array.isArray(storedForecastItems)) {
      const validAndNormalizedItems = storedForecastItems
        .reduce<ForecastItem[]>((acc, item) => {
          if (
            item &&
            typeof item.id === 'string' &&
            typeof item.description === 'string' &&
            typeof item.amount === 'number' &&
            (item.type === 'income' || item.type === 'expense') &&
            typeof item.category === 'string' &&
            typeof item.date === 'string' &&
            (item.explicitBankName === undefined || typeof item.explicitBankName === 'string') &&
            (item.creditCardId === undefined || typeof item.creditCardId === 'string') &&
            (item.installmentId === undefined || typeof item.installmentId === 'string') &&
            (item.currentInstallment === undefined || typeof item.currentInstallment === 'number') &&
            (item.totalInstallments === undefined || typeof item.totalInstallments === 'number')
          ) {
            const dateObj = new Date(item.date);
            if (!isNaN(dateObj.getTime())) {
              acc.push({
                ...item,
                date: startOfMonth(dateObj).toISOString(), 
                isFixed: typeof item.isFixed === 'boolean' ? item.isFixed : false,
              });
            }
          }
          return acc;
        }, [])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setInternalForecastItems(validAndNormalizedItems);
    } else {
      setInternalForecastItems([]);
    }
  }, [storedForecastItems]);

  const addForecastItem = useCallback(
    (itemData: ForecastItemFormData) => {
      let newItems: ForecastItem[] = [];
      if (itemData.isInstallment && itemData.currentInstallment && itemData.totalInstallments) {
        const installmentId = uuidv4();
        const firstInstallmentDate = startOfMonth(new Date(itemData.date));

        for (let i = itemData.currentInstallment; i <= itemData.totalInstallments; i++) {
            const monthOffset = i - itemData.currentInstallment;
            const installmentDate = addMonths(firstInstallmentDate, monthOffset);

            newItems.push({
                id: uuidv4(),
                description: itemData.description,
                amount: itemData.amount,
                type: itemData.type,
                category: itemData.category,
                date: installmentDate.toISOString(),
                creditCardId: itemData.creditCardId,
                explicitBankName: itemData.explicitBankName,
                isFixed: false,
                installmentId: installmentId,
                currentInstallment: i,
                totalInstallments: itemData.totalInstallments,
            });
        }
      } else {
        newItems.push({
          id: uuidv4(),
          description: itemData.description,
          amount: Number(itemData.amount),
          type: itemData.type,
          category: itemData.category,
          date: startOfMonth(new Date(itemData.date)).toISOString(),
          creditCardId: itemData.creditCardId ? itemData.creditCardId : undefined,
          explicitBankName: itemData.creditCardId ? undefined : itemData.explicitBankName,
          isFixed: itemData.type === 'expense' ? (itemData.isFixed ?? false) : false,
        });
      }
      setStoredForecastItems(prev => [...prev, ...newItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    },
    [setStoredForecastItems]
  );

  const updateForecastItem = useCallback(
    (updatedItemData: ForecastItem) => {
      setStoredForecastItems(prev =>
        prev
          .map(item => 
            item.id === updatedItemData.id 
            ? { 
                ...updatedItemData, 
                amount: Number(updatedItemData.amount), 
                date: startOfMonth(new Date(updatedItemData.date)).toISOString(),
                creditCardId: updatedItemData.creditCardId ? updatedItemData.creditCardId : undefined,
                explicitBankName: updatedItemData.creditCardId ? undefined : updatedItemData.explicitBankName,
                isFixed: updatedItemData.type === 'expense' ? (updatedItemData.isFixed ?? false) : false,
              } 
            : item
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    },
    [setStoredForecastItems]
  );

  const deleteForecastItem = useCallback(
    (itemId: string, deleteAllRelated: boolean = false) => {
      const itemToDelete = internalForecastItems.find(item => item.id === itemId);
      if (!itemToDelete) return;

      setStoredForecastItems(prev => {
        if (deleteAllRelated && itemToDelete.installmentId) {
          return prev.filter(item => 
              item.installmentId !== itemToDelete.installmentId || 
              (item.installmentId === itemToDelete.installmentId && (item.currentInstallment ?? 0) < (itemToDelete.currentInstallment ?? 0))
          );
        } else {
          return prev.filter(item => item.id !== itemId);
        }
      });
    },
    [internalForecastItems, setStoredForecastItems]
  );

  const getForecastItemById = useCallback(
    (itemId: string) => {
      return internalForecastItems.find(item => item.id === itemId);
    },
    [internalForecastItems]
  );

  const getForecastTotalsForMonth = useCallback((targetDate: Date = new Date()) => {
    const targetMonthStartISO = startOfMonth(targetDate).toISOString();
    let forecastedIncome = 0;
    let forecastedExpenses = 0;

    internalForecastItems.forEach(item => {
      if (item.date === targetMonthStartISO) {
        if (item.type === 'income') {
          forecastedIncome += item.amount;
        } else if (item.type === 'expense') {
          forecastedExpenses += Math.abs(item.amount); 
        }
      }
    });
    return { forecastedIncome, forecastedExpenses };
  }, [internalForecastItems]);

  const getOverallForecastTotals = useCallback(() => {
    let totalForecastedIncome = 0;
    let totalForecastedExpenses = 0;

    internalForecastItems.forEach(item => {
      if (item.type === 'income') {
        totalForecastedIncome += item.amount;
      } else if (item.type === 'expense') {
        totalForecastedExpenses += Math.abs(item.amount);
      }
    });
    return { totalForecastedIncome, totalForecastedExpenses };
  }, [internalForecastItems]);

  if (isBackupInstance) {
    return {
      forecastItems: storedForecastItems,
      setForecastItems: setStoredForecastItems,
      isReady,
    };
  }

  return {
    forecastItems: internalForecastItems,
    addForecastItem,
    updateForecastItem,
    deleteForecastItem,
    getForecastItemById,
    getForecastTotalsForMonth,
    getOverallForecastTotals,
  };
}

    