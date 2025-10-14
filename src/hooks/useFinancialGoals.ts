
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { FinancialGoal, FinancialGoalFormData, GoalContribution, GoalContributionFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const GOALS_STORAGE_KEY = 'financasZenFinancialGoals';
const CONTRIBUTIONS_STORAGE_KEY = 'financasZenGoalContributions';

type UseFinancialGoalsReturn = {
  goals: FinancialGoal[];
  addGoal: (data: FinancialGoalFormData) => void;
  updateGoal: (data: FinancialGoal) => void;
  deleteGoal: (goalId: string) => void;
  getGoalById: (goalId: string) => FinancialGoal | undefined;
  goalContributions: GoalContribution[];
  addContribution: (data: GoalContributionFormData) => void;
  deleteContribution: (contributionId: string) => void;
  getContributionsForGoal: (goalId: string) => GoalContribution[];
};

type UseFinancialGoalsBackupReturn = {
  financialGoals: FinancialGoal[];
  setFinancialGoals: (value: FinancialGoal[] | ((val: FinancialGoal[]) => FinancialGoal[])) => void;
  goalContributions: GoalContribution[];
  setGoalContributions: (value: GoalContribution[] | ((val: GoalContribution[]) => GoalContribution[])) => void;
  isReady: boolean;
};

export function useFinancialGoals(isBackupInstance: true): UseFinancialGoalsBackupReturn;
export function useFinancialGoals(isBackupInstance?: false): UseFinancialGoalsReturn;
export function useFinancialGoals(isBackupInstance = false): UseFinancialGoalsReturn | UseFinancialGoalsBackupReturn {
  const [storedGoals, setStoredGoals, goalsReady] = useLocalStorage<FinancialGoal[]>(GOALS_STORAGE_KEY, []);
  const [storedContributions, setStoredContributions, contributionsReady] = useLocalStorage<GoalContribution[]>(CONTRIBUTIONS_STORAGE_KEY, []);

  const [internalGoals, setInternalGoals] = useState<FinancialGoal[]>([]);
  const [internalContributions, setInternalContributions] = useState<GoalContribution[]>([]);

  useEffect(() => {
    if (Array.isArray(storedGoals)) {
      setInternalGoals(storedGoals.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
    } else {
      setInternalGoals([]);
    }
  }, [storedGoals]);

  useEffect(() => {
    if(Array.isArray(storedContributions)) {
      setInternalContributions(storedContributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else {
      setInternalContributions([]);
    }
  }, [storedContributions]);

  // Goal Management
  const addGoal = useCallback((goalData: FinancialGoalFormData) => {
    const newGoal: FinancialGoal = { id: uuidv4(), ...goalData };
    setStoredGoals(prev => [...prev, newGoal]);
  }, [setStoredGoals]);

  const updateGoal = useCallback((updatedGoal: FinancialGoal) => {
    setStoredGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  }, [setStoredGoals]);

  const deleteGoal = useCallback((goalId: string) => {
    setStoredGoals(prev => prev.filter(g => g.id !== goalId));
    // Also delete associated contributions
    setStoredContributions(prev => prev.filter(c => c.goalId !== goalId));
  }, [setStoredGoals, setStoredContributions]);
  
  const getGoalById = useCallback((goalId: string): FinancialGoal | undefined => {
    return internalGoals.find(g => g.id === goalId);
  }, [internalGoals]);

  // Contribution Management
  const addContribution = useCallback((contributionData: GoalContributionFormData) => {
    const newContribution: GoalContribution = { id: uuidv4(), ...contributionData };
    setStoredContributions(prev => [...prev, newContribution]);
  }, [setStoredContributions]);
  
  const deleteContribution = useCallback((contributionId: string) => {
    setStoredContributions(prev => prev.filter(c => c.id !== contributionId));
  }, [setStoredContributions]);

  const getContributionsForGoal = useCallback((goalId: string): GoalContribution[] => {
    return internalContributions.filter(c => c.goalId === goalId);
  }, [internalContributions]);


  if (isBackupInstance) {
    return {
      financialGoals: storedGoals,
      setFinancialGoals: setStoredGoals,
      goalContributions: storedContributions,
      setGoalContributions: setStoredContributions,
      isReady: goalsReady && contributionsReady,
    };
  }

  return {
    goals: internalGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoalById,
    goalContributions: internalContributions,
    addContribution,
    deleteContribution,
    getContributionsForGoal,
  };
}

    