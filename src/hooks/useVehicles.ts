

"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Vehicle, VehicleFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const VEHICLES_STORAGE_KEY = 'financasZenVehicles';

type UseVehiclesReturn = {
  vehicles: Vehicle[];
  addVehicle: (data: VehicleFormData) => void;
  updateVehicle: (data: Vehicle) => void;
  deleteVehicle: (vehicleId: string) => void;
  getVehicleById: (vehicleId: string) => Vehicle | undefined;
};

type UseVehiclesBackupReturn = {
  vehicles: Vehicle[];
  setVehicles: (value: Vehicle[] | ((val: Vehicle[]) => Vehicle[])) => void;
  isReady: boolean;
};

export function useVehicles(isBackupInstance: true): UseVehiclesBackupReturn;
export function useVehicles(isBackupInstance?: false): UseVehiclesReturn;
export function useVehicles(isBackupInstance = false): UseVehiclesReturn | UseVehiclesBackupReturn {
  const [storedVehicles, setStoredVehicles, isReady] = useLocalStorage<Vehicle[]>(
    VEHICLES_STORAGE_KEY,
    []
  );

  const [internalVehicles, setInternalVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (Array.isArray(storedVehicles)) {
      const validItems = storedVehicles.filter(
        item =>
          item &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.brand === 'string' &&
          typeof item.model === 'string' &&
          typeof item.year === 'number' &&
          (typeof item.plate === 'string' || item.plate === undefined) &&
          (typeof item.color === 'string' || item.color === undefined) &&
          (typeof item.purchaseOdometer === 'number' || item.purchaseOdometer === undefined || item.purchaseOdometer === null || item.purchaseOdometer === '') &&
          (typeof item.photoUrl === 'string' || item.photoUrl === undefined) &&
          (typeof item.logoKey === 'string' || item.logoKey === undefined)
      ).map(item => ({
        ...item,
        year: Number(item.year),
        purchaseOdometer: item.purchaseOdometer !== undefined && item.purchaseOdometer !== null && item.purchaseOdometer !== '' ? Number(item.purchaseOdometer) : undefined,
      }));
      setInternalVehicles(validItems.sort((a,b) => a.name.localeCompare(b.name)));
    } else {
      setInternalVehicles([]);
    }
  }, [storedVehicles]);

  const addVehicle = useCallback(
    (vehicleData: VehicleFormData) => {
      const newVehicle: Vehicle = {
        id: uuidv4(),
        ...vehicleData,
        year: Number(vehicleData.year),
        color: vehicleData.color || undefined,
        purchaseOdometer: vehicleData.purchaseOdometer !== undefined && vehicleData.purchaseOdometer !== null && vehicleData.purchaseOdometer !== '' ? Number(vehicleData.purchaseOdometer) : undefined,
        photoUrl: vehicleData.photoUrl || undefined,
        logoKey: vehicleData.logoKey || undefined,
      };
      setStoredVehicles(prev => [...prev, newVehicle].sort((a,b) => a.name.localeCompare(b.name)));
    },
    [setStoredVehicles]
  );

  const updateVehicle = useCallback(
    (updatedVehicleData: Vehicle) => {
      setStoredVehicles(prev =>
        prev
          .map(vehicle => {
            if (vehicle.id === updatedVehicleData.id) {
              // Explicitly construct the updated vehicle object to ensure all fields are preserved
              return {
                id: updatedVehicleData.id,
                name: updatedVehicleData.name,
                brand: updatedVehicleData.brand,
                model: updatedVehicleData.model,
                year: Number(updatedVehicleData.year),
                plate: updatedVehicleData.plate || undefined,
                color: updatedVehicleData.color || undefined,
                purchaseOdometer: updatedVehicleData.purchaseOdometer !== undefined && updatedVehicleData.purchaseOdometer !== null && updatedVehicleData.purchaseOdometer !== '' ? Number(updatedVehicleData.purchaseOdometer) : undefined,
                photoUrl: updatedVehicleData.photoUrl || undefined,
                logoKey: updatedVehicleData.logoKey || undefined,
              };
            }
            return vehicle;
          })
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    },
    [setStoredVehicles]
  );

  const deleteVehicle = useCallback(
    (vehicleId: string) => {
      setStoredVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
    },
    [setStoredVehicles]
  );

  const getVehicleById = useCallback(
    (vehicleId: string): Vehicle | undefined => {
      return internalVehicles.find(vehicle => vehicle.id === vehicleId);
    },
    [internalVehicles]
  );

  if (isBackupInstance) {
    return {
      vehicles: storedVehicles,
      setVehicles: setStoredVehicles,
      isReady,
    };
  }

  return {
    vehicles: internalVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicleById,
  };
}
