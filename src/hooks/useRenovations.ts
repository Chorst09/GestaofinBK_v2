"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Renovation, RenovationFormData, RenovationStage, RenovationStageFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const RENOVATIONS_STORAGE_KEY = 'financasZenRenovations';

type UseRenovationsReturn = {
  renovations: Renovation[];
  addRenovation: (data: RenovationFormData) => Renovation;
  updateRenovation: (data: Renovation) => void;
  deleteRenovation: (renovationId: string) => void;
  getRenovationById: (renovationId: string) => Renovation | undefined;
  addStageToRenovation: (renovationId: string, stage: RenovationStageFormData) => void;
  updateStage: (renovationId: string, stage: RenovationStage) => void;
  deleteStage: (renovationId: string, stageId: string) => void;
  getActiveRenovations: () => Renovation[];
};

type UseRenovationsBackupReturn = {
  renovations: Renovation[];
  setRenovations: (value: Renovation[] | ((val: Renovation[]) => Renovation[])) => void;
  isReady: boolean;
};

export function useRenovations(isBackupInstance: true): UseRenovationsBackupReturn;
export function useRenovations(isBackupInstance?: false): UseRenovationsReturn;
export function useRenovations(isBackupInstance = false): UseRenovationsReturn | UseRenovationsBackupReturn {
  const [storedRenovations, setStoredRenovations, isReady] = useLocalStorage<Renovation[]>(
    RENOVATIONS_STORAGE_KEY,
    []
  );

  const [internalRenovations, setInternalRenovations] = useState<Renovation[]>([]);

  useEffect(() => {
    if (Array.isArray(storedRenovations)) {
      const validRenovations = storedRenovations.filter(
        renovation =>
          renovation &&
          typeof renovation.id === 'string' &&
          typeof renovation.name === 'string' &&
          typeof renovation.totalBudget === 'number' &&
          typeof renovation.startDate === 'string' &&
          typeof renovation.endDate === 'string'
      );
      
      setInternalRenovations(validRenovations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } else {
      setInternalRenovations([]);
    }
  }, [storedRenovations]);

  const addRenovation = useCallback(
    (renovationData: RenovationFormData) => {
      const now = new Date().toISOString();
      
      // Garantir que os campos de margem estejam presentes
      const safetyMarginPercent = renovationData.safetyMarginPercent ?? 10;
      const adjustedBudget = renovationData.adjustedBudget ?? 
        renovationData.totalBudget + (renovationData.totalBudget * safetyMarginPercent / 100);
      
      const newRenovation: Renovation = {
        id: uuidv4(),
        ...renovationData,
        safetyMarginPercent,
        adjustedBudget,
        stages: [],
        createdAt: now,
        updatedAt: now,
      };
      setStoredRenovations(prev => 
        [...prev, newRenovation].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      return newRenovation;
    },
    [setStoredRenovations]
  );

  const updateRenovation = useCallback(
    (updatedRenovation: Renovation) => {
      setStoredRenovations(prev =>
        prev
          .map(renovation => 
            renovation.id === updatedRenovation.id 
              ? { ...updatedRenovation, updatedAt: new Date().toISOString() }
              : renovation
          )
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    },
    [setStoredRenovations]
  );

  const deleteRenovation = useCallback(
    (renovationId: string) => {
      setStoredRenovations(prev => prev.filter(renovation => renovation.id !== renovationId));
    },
    [setStoredRenovations]
  );

  const getRenovationById = useCallback(
    (renovationId: string) => {
      return internalRenovations.find(renovation => renovation.id === renovationId);
    },
    [internalRenovations]
  );

  const addStageToRenovation = useCallback(
    (renovationId: string, stageData: RenovationStageFormData) => {
      const newStage: RenovationStage = {
        ...stageData,
        id: uuidv4(),
      };

      setStoredRenovations(prev =>
        prev.map(renovation => {
          if (renovation.id === renovationId) {
            return {
              ...renovation,
              stages: [...renovation.stages, newStage].sort((a, b) => a.order - b.order),
              updatedAt: new Date().toISOString(),
            };
          }
          return renovation;
        })
      );
    },
    [setStoredRenovations]
  );

  const updateStage = useCallback(
    (renovationId: string, updatedStage: RenovationStage) => {
      setStoredRenovations(prev =>
        prev.map(renovation => {
          if (renovation.id === renovationId) {
            return {
              ...renovation,
              stages: renovation.stages.map(stage =>
                stage.id === updatedStage.id ? updatedStage : stage
              ),
              updatedAt: new Date().toISOString(),
            };
          }
          return renovation;
        })
      );
    },
    [setStoredRenovations]
  );

  const deleteStage = useCallback(
    (renovationId: string, stageId: string) => {
      setStoredRenovations(prev =>
        prev.map(renovation => {
          if (renovation.id === renovationId) {
            return {
              ...renovation,
              stages: renovation.stages.filter(stage => stage.id !== stageId),
              updatedAt: new Date().toISOString(),
            };
          }
          return renovation;
        })
      );
    },
    [setStoredRenovations]
  );

  const getActiveRenovations = useCallback(() => {
    return internalRenovations.filter(
      renovation => renovation.status === 'in_progress' || renovation.status === 'planned'
    );
  }, [internalRenovations]);

  if (isBackupInstance) {
    return {
      renovations: storedRenovations,
      setRenovations: setStoredRenovations,
      isReady,
    };
  }

  return {
    renovations: internalRenovations,
    addRenovation,
    updateRenovation,
    deleteRenovation,
    getRenovationById,
    addStageToRenovation,
    updateStage,
    deleteStage,
    getActiveRenovations,
  };
}
