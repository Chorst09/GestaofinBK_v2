"use client";

import { useState, useEffect, useCallback } from 'react';
import type { RenovationExpense, RenovationExpenseFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const RENOVATION_EXPENSES_STORAGE_KEY = 'financasZenRenovationExpenses';

type UseRenovationExpensesReturn = {
  renovationExpenses: RenovationExpense[];
  addRenovationExpense: (data: RenovationExpenseFormData) => RenovationExpense;
  updateRenovationExpense: (data: RenovationExpense) => void;
  deleteRenovationExpense: (expenseId: string) => void;
  getRenovationExpenseById: (expenseId: string) => RenovationExpense | undefined;
  getExpensesByRenovation: (renovationId: string) => RenovationExpense[];
  getExpensesByStage: (stageId: string) => RenovationExpense[];
};

type UseRenovationExpensesBackupReturn = {
  renovationExpenses: RenovationExpense[];
  setRenovationExpenses: (value: RenovationExpense[] | ((val: RenovationExpense[]) => RenovationExpense[])) => void;
  isReady: boolean;
};

export function useRenovationExpenses(isBackupInstance: true): UseRenovationExpensesBackupReturn;
export function useRenovationExpenses(isBackupInstance?: false): UseRenovationExpensesReturn;
export function useRenovationExpenses(isBackupInstance = false): UseRenovationExpensesReturn | UseRenovationExpensesBackupReturn {
  const [storedExpenses, setStoredExpenses, isReady] = useLocalStorage<RenovationExpense[]>(
    RENOVATION_EXPENSES_STORAGE_KEY,
    []
  );

  const [internalExpenses, setInternalExpenses] = useState<RenovationExpense[]>([]);

  useEffect(() => {
    if (Array.isArray(storedExpenses)) {
      setInternalExpenses(storedExpenses);
    } else {
      setInternalExpenses([]);
    }
  }, [storedExpenses]);

  const addRenovationExpense = useCallback(
    (expenseData: RenovationExpenseFormData) => {
      const newExpense: RenovationExpense = {
        id: uuidv4(),
        ...expenseData,
      };
      setStoredExpenses(prev => [...prev, newExpense]);
      return newExpense;
    },
    [setStoredExpenses]
  );

  const updateRenovationExpense = useCallback(
    (updatedExpense: RenovationExpense) => {
      setStoredExpenses(prev =>
        prev.map(expense => 
          expense.id === updatedExpense.id ? updatedExpense : expense
        )
      );
    },
    [setStoredExpenses]
  );

  const deleteRenovationExpense = useCallback(
    (expenseId: string) => {
      setStoredExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    },
    [setStoredExpenses]
  );

  const getRenovationExpenseById = useCallback(
    (expenseId: string) => {
      return internalExpenses.find(expense => expense.id === expenseId);
    },
    [internalExpenses]
  );

  const getExpensesByRenovation = useCallback(
    (renovationId: string) => {
      return internalExpenses.filter(expense => expense.renovationId === renovationId);
    },
    [internalExpenses]
  );

  const getExpensesByStage = useCallback(
    (stageId: string) => {
      return internalExpenses.filter(expense => expense.stageId === stageId);
    },
    [internalExpenses]
  );

  if (isBackupInstance) {
    return {
      renovationExpenses: storedExpenses,
      setRenovationExpenses: setStoredExpenses,
      isReady,
    };
  }

  return {
    renovationExpenses: internalExpenses,
    addRenovationExpense,
    updateRenovationExpense,
    deleteRenovationExpense,
    getRenovationExpenseById,
    getExpensesByRenovation,
    getExpensesByStage,
  };
}
