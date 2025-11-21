"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Material, MaterialFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const MATERIALS_STORAGE_KEY = 'financasZenMaterials';

type UseMaterialsReturn = {
  materials: Material[];
  addMaterial: (data: MaterialFormData) => Material;
  updateMaterial: (data: Material) => void;
  deleteMaterial: (materialId: string) => void;
  getMaterialById: (materialId: string) => Material | undefined;
  getMaterialsByRenovation: (renovationId: string) => Material[];
  getMaterialsByStage: (stageId: string) => Material[];
};

type UseMaterialsBackupReturn = {
  materials: Material[];
  setMaterials: (value: Material[] | ((val: Material[]) => Material[])) => void;
  isReady: boolean;
};

export function useMaterials(isBackupInstance: true): UseMaterialsBackupReturn;
export function useMaterials(isBackupInstance?: false): UseMaterialsReturn;
export function useMaterials(isBackupInstance = false): UseMaterialsReturn | UseMaterialsBackupReturn {
  const [storedMaterials, setStoredMaterials, isReady] = useLocalStorage<Material[]>(
    MATERIALS_STORAGE_KEY,
    []
  );

  const [internalMaterials, setInternalMaterials] = useState<Material[]>([]);

  useEffect(() => {
    if (Array.isArray(storedMaterials)) {
      setInternalMaterials(storedMaterials);
    } else {
      setInternalMaterials([]);
    }
  }, [storedMaterials]);

  const addMaterial = useCallback(
    (materialData: MaterialFormData) => {
      const totalPrice = materialData.quantity * materialData.unitPrice;
      const newMaterial: Material = {
        id: uuidv4(),
        ...materialData,
        totalPrice,
      };
      setStoredMaterials(prev => [...prev, newMaterial]);
      return newMaterial;
    },
    [setStoredMaterials]
  );

  const updateMaterial = useCallback(
    (updatedMaterial: Material) => {
      const recalculated = {
        ...updatedMaterial,
        totalPrice: updatedMaterial.quantity * updatedMaterial.unitPrice,
      };
      setStoredMaterials(prev =>
        prev.map(material => 
          material.id === recalculated.id ? recalculated : material
        )
      );
    },
    [setStoredMaterials]
  );

  const deleteMaterial = useCallback(
    (materialId: string) => {
      setStoredMaterials(prev => prev.filter(material => material.id !== materialId));
    },
    [setStoredMaterials]
  );

  const getMaterialById = useCallback(
    (materialId: string) => {
      return internalMaterials.find(material => material.id === materialId);
    },
    [internalMaterials]
  );

  const getMaterialsByRenovation = useCallback(
    (renovationId: string) => {
      return internalMaterials.filter(material => material.renovationId === renovationId);
    },
    [internalMaterials]
  );

  const getMaterialsByStage = useCallback(
    (stageId: string) => {
      return internalMaterials.filter(material => material.stageId === stageId);
    },
    [internalMaterials]
  );

  if (isBackupInstance) {
    return {
      materials: storedMaterials,
      setMaterials: setStoredMaterials,
      isReady,
    };
  }

  return {
    materials: internalMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterialById,
    getMaterialsByRenovation,
    getMaterialsByStage,
  };
}
