
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { FixedIncomeAsset, FixedIncomeAssetFormData, VariableIncomeAsset, VariableIncomeAssetFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const FIXED_INCOME_STORAGE_KEY = 'financasZenFixedIncomeAssets';
const VARIABLE_INCOME_STORAGE_KEY = 'financasZenVariableIncomeAssets';

type UseInvestmentsReturn = {
  fixedIncomeAssets: FixedIncomeAsset[];
  addFixedIncomeAsset: (data: FixedIncomeAssetFormData) => void;
  updateFixedIncomeAsset: (data: FixedIncomeAsset) => void;
  deleteFixedIncomeAsset: (assetId: string) => void;
  
  variableIncomeAssets: VariableIncomeAsset[];
  addVariableIncomeAsset: (data: VariableIncomeAssetFormData) => void;
  updateVariableIncomeAsset: (data: VariableIncomeAsset) => void;
  deleteVariableIncomeAsset: (assetId: string) => void;
};

type UseInvestmentsBackupReturn = {
  fixedIncomeAssets: FixedIncomeAsset[];
  setFixedIncomeAssets: (value: FixedIncomeAsset[] | ((val: FixedIncomeAsset[]) => FixedIncomeAsset[])) => void;
  variableIncomeAssets: VariableIncomeAsset[];
  setVariableIncomeAssets: (value: VariableIncomeAsset[] | ((val: VariableIncomeAsset[]) => VariableIncomeAsset[])) => void;
  isReady: boolean;
};

export function useInvestments(isBackupInstance: true): UseInvestmentsBackupReturn;
export function useInvestments(isBackupInstance?: false): UseInvestmentsReturn;
export function useInvestments(isBackupInstance = false): UseInvestmentsReturn | UseInvestmentsBackupReturn {
  const [storedFixed, setStoredFixed, fixedReady] = useLocalStorage<FixedIncomeAsset[]>(FIXED_INCOME_STORAGE_KEY, []);
  const [storedVariable, setStoredVariable, variableReady] = useLocalStorage<VariableIncomeAsset[]>(VARIABLE_INCOME_STORAGE_KEY, []);
  
  const addFixedIncomeAsset = useCallback((assetData: FixedIncomeAssetFormData) => {
    const newAsset: FixedIncomeAsset = { id: uuidv4(), ...assetData };
    setStoredFixed(prev => [...prev, newAsset]);
  }, [setStoredFixed]);

  const updateFixedIncomeAsset = useCallback((updatedAsset: FixedIncomeAsset) => {
    setStoredFixed(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
  }, [setStoredFixed]);

  const deleteFixedIncomeAsset = useCallback((assetId: string) => {
    setStoredFixed(prev => prev.filter(a => a.id !== assetId));
  }, [setStoredFixed]);

  const addVariableIncomeAsset = useCallback((assetData: VariableIncomeAssetFormData) => {
    const newAsset: VariableIncomeAsset = { id: uuidv4(), ...assetData };
    setStoredVariable(prev => [...prev, newAsset]);
  }, [setStoredVariable]);

  const updateVariableIncomeAsset = useCallback((updatedAsset: VariableIncomeAsset) => {
    setStoredVariable(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
  }, [setStoredVariable]);
  
  const deleteVariableIncomeAsset = useCallback((assetId: string) => {
    setStoredVariable(prev => prev.filter(a => a.id !== assetId));
  }, [setStoredVariable]);

  if (isBackupInstance) {
    return {
      fixedIncomeAssets: storedFixed,
      setFixedIncomeAssets: setStoredFixed,
      variableIncomeAssets: storedVariable,
      setVariableIncomeAssets: setStoredVariable,
      isReady: fixedReady && variableReady,
    };
  }

  return {
    fixedIncomeAssets: storedFixed,
    addFixedIncomeAsset,
    updateFixedIncomeAsset,
    deleteFixedIncomeAsset,
    variableIncomeAssets: storedVariable,
    addVariableIncomeAsset,
    updateVariableIncomeAsset,
    deleteVariableIncomeAsset,
  };
}

    