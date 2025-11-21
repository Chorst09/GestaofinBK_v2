"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Supplier, SupplierFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const SUPPLIERS_STORAGE_KEY = 'financasZenSuppliers';

type UseSuppliersReturn = {
  suppliers: Supplier[];
  addSupplier: (data: SupplierFormData) => Supplier;
  updateSupplier: (data: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
  getSupplierById: (supplierId: string) => Supplier | undefined;
};

type UseSuppliersBackupReturn = {
  suppliers: Supplier[];
  setSuppliers: (value: Supplier[] | ((val: Supplier[]) => Supplier[])) => void;
  isReady: boolean;
};

export function useSuppliers(isBackupInstance: true): UseSuppliersBackupReturn;
export function useSuppliers(isBackupInstance?: false): UseSuppliersReturn;
export function useSuppliers(isBackupInstance = false): UseSuppliersReturn | UseSuppliersBackupReturn {
  const [storedSuppliers, setStoredSuppliers, isReady] = useLocalStorage<Supplier[]>(
    SUPPLIERS_STORAGE_KEY,
    []
  );

  const [internalSuppliers, setInternalSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    if (Array.isArray(storedSuppliers)) {
      setInternalSuppliers(storedSuppliers.sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      setInternalSuppliers([]);
    }
  }, [storedSuppliers]);

  const addSupplier = useCallback(
    (supplierData: SupplierFormData) => {
      const newSupplier: Supplier = {
        id: uuidv4(),
        ...supplierData,
      };
      setStoredSuppliers(prev => [...prev, newSupplier].sort((a, b) => a.name.localeCompare(b.name)));
      return newSupplier;
    },
    [setStoredSuppliers]
  );

  const updateSupplier = useCallback(
    (updatedSupplier: Supplier) => {
      setStoredSuppliers(prev =>
        prev
          .map(supplier => supplier.id === updatedSupplier.id ? updatedSupplier : supplier)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    },
    [setStoredSuppliers]
  );

  const deleteSupplier = useCallback(
    (supplierId: string) => {
      setStoredSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));
    },
    [setStoredSuppliers]
  );

  const getSupplierById = useCallback(
    (supplierId: string) => {
      return internalSuppliers.find(supplier => supplier.id === supplierId);
    },
    [internalSuppliers]
  );

  if (isBackupInstance) {
    return {
      suppliers: storedSuppliers,
      setSuppliers: setStoredSuppliers,
      isReady,
    };
  }

  return {
    suppliers: internalSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
  };
}
