
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { VehicleExpense, VehicleExpenseFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const VEHICLE_EXPENSES_STORAGE_KEY = 'financasZenVehicleExpenses';

type UseVehicleExpensesReturn = {
  vehicleExpenses: VehicleExpense[];
  addVehicleExpense: (data: VehicleExpenseFormData) => void;
  updateVehicleExpense: (data: VehicleExpense) => void;
  deleteVehicleExpense: (expenseId: string) => void;
  getExpensesForVehicle: (vehicleId: string) => VehicleExpense[];
  deleteExpensesForVehicle: (vehicleId: string) => void;
  deleteAllMaintenanceForVehicle: (vehicleId: string) => void;
};

type UseVehicleExpensesBackupReturn = {
  vehicleExpenses: VehicleExpense[];
  setVehicleExpenses: (value: VehicleExpense[] | ((val: VehicleExpense[]) => VehicleExpense[])) => void;
  isReady: boolean;
};

export function useVehicleExpenses(isBackupInstance: true): UseVehicleExpensesBackupReturn;
export function useVehicleExpenses(isBackupInstance?: false): UseVehicleExpensesReturn;
export function useVehicleExpenses(isBackupInstance = false): UseVehicleExpensesReturn | UseVehicleExpensesBackupReturn {
  const [storedExpenses, setStoredExpenses, isReady] = useLocalStorage<VehicleExpense[]>(
    VEHICLE_EXPENSES_STORAGE_KEY,
    []
  );

  const [internalExpenses, setInternalExpenses] = useState<VehicleExpense[]>([]);

  useEffect(() => {
    if (Array.isArray(storedExpenses)) {
      const validItems = storedExpenses.filter(
        item =>
          item &&
          typeof item.id === 'string' &&
          typeof item.vehicleId === 'string' &&
          typeof item.date === 'string' &&
          typeof item.description === 'string' &&
          typeof item.amount === 'number' &&
          ['fuel', 'maintenance', 'documents', 'insurance', 'other'].includes(item.expenseType) &&
          typeof item.odometer === 'number' &&
          (item.liters === undefined || typeof item.liters === 'number' || item.liters === null || item.liters === '') &&
          (item.station === undefined || typeof item.station === 'string') &&
          (item.fuelType === undefined || ['alcohol', 'common_gasoline', 'additive_gasoline', 'premium_gasoline'].includes(item.fuelType)) &&
          (item.maintenanceType === undefined || typeof item.maintenanceType === 'string') &&
          (item.quantity === undefined || typeof item.quantity === 'number' || item.quantity === null || item.quantity === '') &&
          (item.fileDataUri === undefined || typeof item.fileDataUri === 'string') &&
          (item.fileName === undefined || typeof item.fileName === 'string') &&
          (item.fileType === undefined || typeof item.fileType === 'string')
      ).map(item => ({
          ...item,
          liters: item.liters !== undefined && item.liters !== null && item.liters !== '' ? Number(item.liters) : undefined,
          quantity: item.quantity !== undefined && item.quantity !== null && item.quantity !== '' ? Number(item.quantity) : undefined,
      }));
      setInternalExpenses(validItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else {
      setInternalExpenses([]);
    }
  }, [storedExpenses]);

  const addVehicleExpense = useCallback(
    (expenseData: VehicleExpenseFormData) => {
      const newExpense: VehicleExpense = {
        id: uuidv4(),
        ...expenseData,
        amount: Number(expenseData.amount),
        odometer: Number(expenseData.odometer),
        liters: expenseData.liters !== undefined && expenseData.liters !== null && expenseData.liters !== '' ? Number(expenseData.liters) : undefined,
        station: expenseData.station || undefined,
        fuelType: expenseData.fuelType || undefined,
        maintenanceType: expenseData.maintenanceType || undefined,
        quantity: expenseData.quantity !== undefined && expenseData.quantity !== null && expenseData.quantity !== '' ? Number(expenseData.quantity) : undefined,
        fileDataUri: expenseData.fileDataUri || undefined,
        fileName: expenseData.fileName || undefined,
        fileType: expenseData.fileType || undefined,
      };
      setStoredExpenses(prev => [...prev, newExpense].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    },
    [setStoredExpenses]
  );

  const updateVehicleExpense = useCallback(
    (updatedExpenseData: VehicleExpense) => {
      setStoredExpenses(prev =>
        prev
          .map(expense =>
            expense.id === updatedExpenseData.id
              ? {
                  ...updatedExpenseData,
                  liters: updatedExpenseData.liters !== undefined && updatedExpenseData.liters !== null && updatedExpenseData.liters !== '' ? Number(updatedExpenseData.liters) : undefined,
                  quantity: updatedExpenseData.quantity !== undefined && updatedExpenseData.quantity !== null && updatedExpenseData.quantity !== '' ? Number(updatedExpenseData.quantity) : undefined,
                }
              : expense
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    },
    [setStoredExpenses]
  );

  const deleteVehicleExpense = useCallback(
    (expenseId: string) => {
      setStoredExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    },
    [setStoredExpenses]
  );

  const getExpensesForVehicle = useCallback(
    (vehicleId: string): VehicleExpense[] => {
      return internalExpenses.filter(expense => expense.vehicleId === vehicleId);
    },
    [internalExpenses]
  );
  
  const deleteExpensesForVehicle = useCallback(
    (vehicleId: string) => {
       setStoredExpenses(prev => prev.filter(expense => expense.vehicleId !== vehicleId));
    },
    [setStoredExpenses]
  );

  const deleteAllMaintenanceForVehicle = useCallback(
    (vehicleId: string) => {
       setStoredExpenses(prev => prev.filter(expense => {
           return expense.vehicleId !== vehicleId || expense.expenseType !== 'maintenance';
       }));
    },
    [setStoredExpenses]
  );

  if (isBackupInstance) {
    return {
      vehicleExpenses: storedExpenses,
      setVehicleExpenses: setStoredExpenses,
      isReady,
    };
  }

  return {
    vehicleExpenses: internalExpenses,
    addVehicleExpense,
    updateVehicleExpense,
    deleteVehicleExpense,
    getExpensesForVehicle,
    deleteExpensesForVehicle,
    deleteAllMaintenanceForVehicle,
  };
}
