
"use client";

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { useTransactions } from './useTransactions';
import { useBankAccounts } from './useBankAccounts';
import { useCreditCards } from './useCreditCards';
import { useForecasts } from './useForecasts';
import { useVehicles } from './useVehicles';
import { useVehicleExpenses } from './useVehicleExpenses';
import { useScheduledMaintenances } from './useScheduledMaintenances';
import { useFinancialGoals } from './useFinancialGoals';
import { useCategories } from './useCategories';
import { useInvestments } from './useInvestments';
import type { BackupData, UserProfile, Transaction, BankAccount, CreditCard, ForecastItem, Vehicle, VehicleExpense, ScheduledMaintenance, FinancialGoal, GoalContribution, CustomCategory, FixedIncomeAsset, VariableIncomeAsset, DataBackupContextType } from '@/lib/types';
import * as GoogleDriveService from '@/lib/google-drive-service';
import { useToast } from '@/hooks/use-toast';

// Create the context
const DataBackupContext = createContext<DataBackupContextType | null>(null);

// Create the provider component
export function DataBackupProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const { transactions, setTransactions, isReady: transactionsReady } = useTransactions(true);
  const { bankAccounts, setBankAccounts, isReady: bankAccountsReady } = useBankAccounts(true);
  const { creditCards, setCreditCards, isReady: creditCardsReady } = useCreditCards(true);
  const { forecastItems, setForecastItems, isReady: forecastItemsReady } = useForecasts(true);
  const { vehicles, setVehicles, isReady: vehiclesReady } = useVehicles(true);
  const { vehicleExpenses, setVehicleExpenses, isReady: vehicleExpensesReady } = useVehicleExpenses(true);
  const { scheduledMaintenances, setScheduledMaintenances, isReady: maintenancesReady } = useScheduledMaintenances(true);
  const { financialGoals, setFinancialGoals, goalContributions, setGoalContributions, isReady: goalsReady } = useFinancialGoals(true);
  const { customCategories, setCustomCategories, isReady: categoriesReady } = useCategories(true);
  const { fixedIncomeAssets, setFixedIncomeAssets, variableIncomeAssets, setVariableIncomeAssets, isReady: investmentsReady } = useInvestments(true);

  const isDataLoaded = transactionsReady && bankAccountsReady && creditCardsReady && forecastItemsReady && vehiclesReady && vehicleExpensesReady && maintenancesReady && goalsReady && categoriesReady && investmentsReady;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const backupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  const getLatestBackupData = useCallback((): BackupData => ({
    transactions,
    bankAccounts,
    creditCards,
    forecastItems,
    vehicles,
    vehicleExpenses,
    scheduledMaintenances,
    financialGoals,
    goalContributions,
    customCategories,
    fixedIncomeAssets,
    variableIncomeAssets,
  }), [transactions, bankAccounts, creditCards, forecastItems, vehicles, vehicleExpenses, scheduledMaintenances, financialGoals, goalContributions, customCategories, fixedIncomeAssets, variableIncomeAssets]);

  const restoreAllData = useCallback((backupData: BackupData) => {
    if (!backupData) return;
    setTransactions(backupData.transactions || []);
    setBankAccounts(backupData.bankAccounts || []);
    setCreditCards(backupData.creditCards || []);
    setForecastItems(backupData.forecastItems || []);
    setVehicles(backupData.vehicles || []);
    setVehicleExpenses(backupData.vehicleExpenses || []);
    setScheduledMaintenances(backupData.scheduledMaintenances || []);
    setFinancialGoals(backupData.financialGoals || []);
    setGoalContributions(backupData.goalContributions || []);
    setCustomCategories(backupData.customCategories || []);
    setFixedIncomeAssets(backupData.fixedIncomeAssets || []);
    setVariableIncomeAssets(backupData.variableIncomeAssets || []);
  }, [setTransactions, setBankAccounts, setCreditCards, setForecastItems, setVehicles, setVehicleExpenses, setScheduledMaintenances, setFinancialGoals, setGoalContributions, setCustomCategories, setFixedIncomeAssets, setVariableIncomeAssets]);

  const saveToDrive = useCallback(async (options?: { showSuccessToast?: boolean }) => {
    if (!isLoggedIn) return;
    setIsSaving(true);
    setError(null);
    try {
      const data = getLatestBackupData();
      await GoogleDriveService.saveToDrive(data);
      setLastBackupDate(new Date());
      if (options?.showSuccessToast) {
        toast({ title: "Backup Concluído", description: "Seus dados foram salvos com sucesso no Google Drive." });
      }
    } catch (e: any) {
      const errorMessage = e.message || "Falha ao salvar o backup no Google Drive.";
      console.error("Backup failed:", e);
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Erro de Backup', description: errorMessage });
    } finally {
      setIsSaving(false);
    }
  }, [isLoggedIn, getLatestBackupData, toast]);

  useEffect(() => {
    if (!isMountedRef.current) {
        isMountedRef.current = true;
        return;
    }
    if (!isLoggedIn || !isDataLoaded) return;
    
    if (backupTimerRef.current) {
        clearTimeout(backupTimerRef.current);
    }
    
    backupTimerRef.current = setTimeout(() => {
        saveToDrive({ showSuccessToast: false });
    }, 2500); // Debounce backups by 2.5 seconds

    return () => {
        if (backupTimerRef.current) {
            clearTimeout(backupTimerRef.current);
        }
    };
  }, [transactions, bankAccounts, creditCards, forecastItems, vehicles, vehicleExpenses, scheduledMaintenances, financialGoals, goalContributions, customCategories, fixedIncomeAssets, variableIncomeAssets, isLoggedIn, saveToDrive, isDataLoaded]);

  const updateAuthState = useCallback((isAuthorized: boolean, profile?: UserProfile, data?: BackupData | null, error?: string) => {
    const isTransitioningToLoggedIn = !isLoggedIn && isAuthorized;
    
    setIsLoggedIn(isAuthorized);
    setUserProfile(profile || null);
    
    if (isAuthorized) {
        setError(null);
    } else if (error) {
        setError(error);
    }

    if (isAuthorized && data) {
        restoreAllData(data);
        setLastBackupDate(new Date());
        if (isTransitioningToLoggedIn) {
            toast({
                title: "Dados Carregados",
                description: "Suas informações foram restauradas do Google Drive.",
            });
        }
    } else if (isTransitioningToLoggedIn && !data) {
        toast({
            title: "Nenhum backup encontrado",
            description: "Iniciando um novo backup no seu Google Drive. Suas alterações serão salvas automaticamente.",
        });
        saveToDrive({ showSuccessToast: false });
    }
    
    if (!isAuthorized) {
        setLastBackupDate(null);
    }
  }, [isLoggedIn, restoreAllData, toast, saveToDrive]);

  useEffect(() => {
    const init = async () => {
      try {
        await GoogleDriveService.initClient(updateAuthState);
      } catch (e: any) {
        console.error("Initialization failed:", e);
        setError("Não foi possível conectar ao Google Drive. Verifique a configuração e sua conexão.");
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [updateAuthState]);

  const login = useCallback(async (forceConsent = false) => {
    // Check for the error *before* clearing it to correctly determine the login flow.
    const isPermissionError = error && error.startsWith("PERMISSION_DENIED");
    
    setError(null);

    try {
      let prompt: string | undefined = forceConsent ? 'consent' : undefined;

      if (isPermissionError) {
          // The most aggressive flow for permission errors.
          await GoogleDriveService.revokeCurrentToken();
          prompt = 'consent select_account';
      } else if (forceConsent) {
          prompt = 'consent select_account';
      }
      
      GoogleDriveService.handleAuthClick({ prompt });

    } catch (e: any) {
      console.error("Login failed:", e);
      setError(e.message || "O processo de login falhou.");
    }
  }, [error]);

  const logout = useCallback(async () => {
    setError(null);
    await GoogleDriveService.saveDataAndSignOut(getLatestBackupData());
  }, [getLatestBackupData]);

  const restoreFromBackup = useCallback(async () => {
    if (!isLoggedIn) {
      toast({ variant: 'destructive', title: 'Não conectado', description: 'Faça login para restaurar um backup.' });
      return;
    }
    setIsRestoring(true);
    setError(null);
    try {
      const data = await GoogleDriveService.loadFromDrive();
      if (data) {
        restoreAllData(data);
        setLastBackupDate(new Date()); // Assume last backup date is now
        toast({ title: 'Sucesso', description: 'Seus dados foram restaurados do Google Drive.' });
      } else {
        toast({ title: 'Backup não encontrado', description: 'Nenhum arquivo de backup encontrado. Suas alterações serão salvas em um novo arquivo.' });
      }
    } catch (e: any) {
      console.error("Restore failed:", e);
      setError(e.message || "Falha ao restaurar o backup.");
      toast({ variant: 'destructive', title: 'Erro de Restauração', description: e.message });
    } finally {
      setIsRestoring(false);
    }
  }, [isLoggedIn, restoreAllData, toast]);

  const value: DataBackupContextType = {
    isLoggedIn,
    isInitializing,
    isSaving,
    isRestoring,
    isDataLoaded,
    login,
    logout,
    restoreFromBackup,
    saveToDrive,
    userProfile,
    lastBackupDate,
    error,
    getLatestBackupData,
    restoreFunctions: {
      setTransactions,
      setBankAccounts,
      setCreditCards,
      setForecastItems,
      setVehicles,
      setVehicleExpenses,
      setScheduledMaintenances,
      setFinancialGoals,
      setGoalContributions,
      setCustomCategories,
      setFixedIncomeAssets,
      setVariableIncomeAssets,
    },
  };

  return React.createElement(DataBackupContext.Provider, { value: value }, children);
}

// Create the consumer hook
export function useDataBackup() {
    const context = useContext(DataBackupContext);
    if (context === null) {
        throw new Error("useDataBackup must be used within a DataBackupProvider");
    }
    return context;
}

    