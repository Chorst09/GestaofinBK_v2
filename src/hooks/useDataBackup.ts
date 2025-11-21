
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
import { useTravelEvents } from './useTravelEvents';
import { useRenovations } from './useRenovations';
import { useRenovationExpenses } from './useRenovationExpenses';
import { useSuppliers } from './useSuppliers';
import { useMaterials } from './useMaterials';
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
  const { travelEvents, setTravelEvents, isReady: travelReady } = useTravelEvents(true);
  const { renovations, setRenovations, isReady: renovationsReady } = useRenovations(true);
  const { renovationExpenses, setRenovationExpenses, isReady: renovationExpensesReady } = useRenovationExpenses(true);
  const { suppliers, setSuppliers, isReady: suppliersReady } = useSuppliers(true);
  const { materials, setMaterials, isReady: materialsReady } = useMaterials(true);

  const isDataLoaded = transactionsReady && bankAccountsReady && creditCardsReady && forecastItemsReady && vehiclesReady && vehicleExpensesReady && maintenancesReady && goalsReady && categoriesReady && investmentsReady && travelReady && renovationsReady && renovationExpensesReady && suppliersReady && materialsReady;

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
    travelEvents,
    renovations,
    renovationExpenses,
    suppliers,
    materials,
    cashFlowEntries: [], // TODO: Implementar hook useCashFlowEntries
  }), [transactions, bankAccounts, creditCards, forecastItems, vehicles, vehicleExpenses, scheduledMaintenances, financialGoals, goalContributions, customCategories, fixedIncomeAssets, variableIncomeAssets, travelEvents, renovations, renovationExpenses, suppliers, materials]);

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
    setTravelEvents(backupData.travelEvents || []);
    setRenovations(backupData.renovations || []);
    setRenovationExpenses(backupData.renovationExpenses || []);
    setSuppliers(backupData.suppliers || []);
    setMaterials(backupData.materials || []);
  }, [setTransactions, setBankAccounts, setCreditCards, setForecastItems, setVehicles, setVehicleExpenses, setScheduledMaintenances, setFinancialGoals, setGoalContributions, setCustomCategories, setFixedIncomeAssets, setVariableIncomeAssets, setTravelEvents, setRenovations, setRenovationExpenses, setSuppliers, setMaterials]);

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
        // Mostrar toast apenas para erros que não são de configuração
        if (!error.includes("não está configurado") && !error.includes("não configuradas")) {
            toast({
                variant: 'destructive',
                title: "Erro no Google Drive",
                description: error,
            });
        }
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
        const errorMessage = e.message || "Erro desconhecido";
        
        // Se for erro de configuração, não mostrar como erro crítico
        if (errorMessage.includes("não configuradas") || errorMessage.includes("não está configurado")) {
          console.warn("Google Drive backup desabilitado - credenciais não configuradas");
          setError(null); // Não mostrar erro, apenas avisar no console
        } 
        // Se for erro de rede, não bloquear o app
        else if (errorMessage.includes("NETWORK_ERROR") || errorMessage.includes("502") || errorMessage.includes("503") || errorMessage.includes("Bad Gateway")) {
          console.warn("Google Drive temporariamente indisponível. Sistema funcionando com armazenamento local.");
          setError(null); // Não mostrar erro, sistema continua funcionando
        } 
        else {
          setError("Não foi possível conectar ao Google Drive. Verifique a configuração e sua conexão.");
        }
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

    let promptOption: string | undefined = forceConsent ? 'consent' : undefined;

    if (isPermissionError) {
        promptOption = 'consent select_account';
    } else if (forceConsent) {
        promptOption = 'consent select_account';
    }

    try {
      if (isPermissionError) {
          // The most aggressive flow for permission errors.
          await GoogleDriveService.revokeCurrentToken();
      }
      
      // Se o Google Drive foi desabilitado, tentar reabilitar
      GoogleDriveService.resetGoogleDrive();
      
      GoogleDriveService.handleAuthClick({ prompt: promptOption });

    } catch (e: any) {
      console.error("Login failed:", e);
      const errorMessage = e.message || "O processo de login falhou.";
      
      // Se for erro de configuração, mostrar mensagem mais amigável
      if (errorMessage.includes("não está configurado") || errorMessage.includes("não configuradas")) {
        // Tentar forçar reinicialização
        try {
          await GoogleDriveService.forceReinitialize(updateAuthState);
          GoogleDriveService.handleAuthClick({ prompt: promptOption });
        } catch (reinitError) {
          setError("Backup no Google Drive não configurado. O sistema funciona normalmente com armazenamento local.");
          toast({ 
            title: "Backup Local Ativo", 
            description: "O Google Drive não está configurado. Seus dados estão sendo salvos localmente no navegador." 
          });
        }
      } else if (errorMessage.includes("Não foi possível conectar") || errorMessage.includes("Verifique sua conexão")) {
        setError(errorMessage);
        toast({ 
          variant: 'destructive',
          title: "Erro de Conexão", 
          description: "Não foi possível conectar ao Google Drive. Verifique sua conexão com a internet." 
        });
      } else {
        setError(errorMessage);
        toast({ 
          variant: 'destructive',
          title: "Erro no Login", 
          description: errorMessage 
        });
      }
    }
  }, [error, toast, updateAuthState]);

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
      setTravelEvents,
      setRenovations,
      setRenovationExpenses,
      setSuppliers,
      setMaterials,
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

    