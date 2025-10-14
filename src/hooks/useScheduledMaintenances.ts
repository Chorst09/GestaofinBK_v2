
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { ScheduledMaintenance, ScheduledMaintenanceFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const SCHEDULED_MAINTENANCES_STORAGE_KEY = 'financasZenScheduledMaintenances';

type UseScheduledMaintenancesReturn = {
  scheduledMaintenances: ScheduledMaintenance[];
  getMaintenancesForVehicle: (vehicleId: string) => ScheduledMaintenance[];
  addMaintenance: (data: ScheduledMaintenanceFormData) => void;
  updateMaintenance: (data: ScheduledMaintenance) => void;
  deleteMaintenance: (maintenanceId: string) => void;
  deleteAllMaintenancesForVehicle: (vehicleId: string) => void;
};

type UseScheduledMaintenancesBackupReturn = {
  scheduledMaintenances: ScheduledMaintenance[];
  setScheduledMaintenances: (value: ScheduledMaintenance[] | ((val: ScheduledMaintenance[]) => ScheduledMaintenance[])) => void;
  isReady: boolean;
};

export function useScheduledMaintenances(isBackupInstance: true): UseScheduledMaintenancesBackupReturn;
export function useScheduledMaintenances(isBackupInstance?: false): UseScheduledMaintenancesReturn;
export function useScheduledMaintenances(isBackupInstance = false): UseScheduledMaintenancesReturn | UseScheduledMaintenancesBackupReturn {
  const [storedMaintenances, setStoredMaintenances, isReady] = useLocalStorage<ScheduledMaintenance[]>(
    SCHEDULED_MAINTENANCES_STORAGE_KEY,
    []
  );

  const [internalMaintenances, setInternalMaintenances] = useState<ScheduledMaintenance[]>([]);

  useEffect(() => {
    if (Array.isArray(storedMaintenances)) {
      const validItems = storedMaintenances.filter(
        item =>
          item &&
          typeof item.id === 'string' &&
          typeof item.vehicleId === 'string' &&
          typeof item.description === 'string' &&
          typeof item.odometer === 'number' &&
          typeof item.date === 'string' &&
          !isNaN(new Date(item.date).getTime()) &&
          (item.quantity === undefined || typeof item.quantity === 'number') &&
          (item.amount === undefined || typeof item.amount === 'number') &&
          (item.nextServiceOdometer === undefined || typeof item.nextServiceOdometer === 'number') &&
          (item.fileDataUri === undefined || typeof item.fileDataUri === 'string') &&
          (item.fileName === undefined || typeof item.fileName === 'string') &&
          (item.fileType === undefined || typeof item.fileType === 'string')
      );
      setInternalMaintenances(validItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else {
      setInternalMaintenances([]);
    }
  }, [storedMaintenances]);

  const addMaintenance = useCallback(
    (maintenanceData: ScheduledMaintenanceFormData) => {
      const newMaintenance: ScheduledMaintenance = {
        id: uuidv4(),
        ...maintenanceData,
      };
      setStoredMaintenances(prev => [...prev, newMaintenance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    },
    [setStoredMaintenances]
  );

  const updateMaintenance = useCallback(
    (updatedMaintenanceData: ScheduledMaintenance) => {
      setStoredMaintenances(prev =>
        prev
          .map(item =>
            item.id === updatedMaintenanceData.id ? updatedMaintenanceData : item
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    },
    [setStoredMaintenances]
  );

  const deleteMaintenance = useCallback(
    (maintenanceId: string) => {
      setStoredMaintenances(prev => prev.filter(item => item.id !== maintenanceId));
    },
    [setStoredMaintenances]
  );
  
  const deleteAllMaintenancesForVehicle = useCallback((vehicleId: string) => {
    setStoredMaintenances(prev => prev.filter(item => item.vehicleId !== vehicleId));
  }, [setStoredMaintenances]);

  const getMaintenancesForVehicle = useCallback(
    (vehicleId: string): ScheduledMaintenance[] => {
      return internalMaintenances.filter(item => item.vehicleId === vehicleId);
    },
    [internalMaintenances]
  );

  if (isBackupInstance) {
    return {
      scheduledMaintenances: storedMaintenances,
      setScheduledMaintenances: setStoredMaintenances,
      isReady,
    };
  }

  return {
    scheduledMaintenances: internalMaintenances,
    getMaintenancesForVehicle,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    deleteAllMaintenancesForVehicle,
  };
}

    