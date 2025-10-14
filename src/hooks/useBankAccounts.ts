
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { BankAccount, BankAccountFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const BANK_ACCOUNTS_STORAGE_KEY = 'financasZenBankAccounts';

type UseBankAccountsReturn = {
  bankAccounts: BankAccount[];
  addBankAccount: (data: BankAccountFormData) => void;
  updateBankAccount: (data: BankAccount) => void;
  deleteBankAccount: (accountId: string) => void;
  getBankAccountById: (accountId: string) => BankAccount | undefined;
};

type UseBankAccountsBackupReturn = {
  bankAccounts: BankAccount[];
  setBankAccounts: (value: BankAccount[] | ((val: BankAccount[]) => BankAccount[])) => void;
  isReady: boolean;
};

export function useBankAccounts(isBackupInstance: true): UseBankAccountsBackupReturn;
export function useBankAccounts(isBackupInstance?: false): UseBankAccountsReturn;
export function useBankAccounts(isBackupInstance = false): UseBankAccountsReturn | UseBankAccountsBackupReturn {
  const [storedBankAccounts, setStoredBankAccounts, isReady] = useLocalStorage<BankAccount[]>(
    BANK_ACCOUNTS_STORAGE_KEY,
    []
  );

  const [internalBankAccounts, setInternalBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    if (Array.isArray(storedBankAccounts)) {
      const validItems = storedBankAccounts.filter(
        item =>
          item &&
          typeof item.id === 'string' &&
          typeof item.bankName === 'string' &&
          ['checking', 'savings', 'investment', 'other'].includes(item.accountType) &&
          typeof item.balance === 'number' &&
          (item.overdraftLimit === undefined || (typeof item.overdraftLimit === 'number' && item.overdraftLimit >= 0)) &&
          (item.logoKey === undefined || typeof item.logoKey === 'string') &&
          (item.photoUrl === undefined || typeof item.photoUrl === 'string')
      ).map(item => ({
        ...item,
        balance: Number(item.balance),
        overdraftLimit: item.overdraftLimit !== undefined ? Number(item.overdraftLimit) : undefined,
      }));
      setInternalBankAccounts(validItems.sort((a,b) => a.bankName.localeCompare(b.bankName)));
    } else {
      setInternalBankAccounts([]);
    }
  }, [storedBankAccounts]);

  const addBankAccount = useCallback(
    (accountData: BankAccountFormData) => {
      const newBankAccount: BankAccount = {
        id: uuidv4(),
        ...accountData,
        balance: Number(accountData.balance),
        overdraftLimit: accountData.overdraftLimit !== undefined ? Number(accountData.overdraftLimit) : undefined,
        logoKey: accountData.logoKey || undefined,
        photoUrl: accountData.photoUrl || undefined,
      };
      setStoredBankAccounts(prev => [...prev, newBankAccount].sort((a,b) => a.bankName.localeCompare(b.bankName)));
    },
    [setStoredBankAccounts]
  );

  const updateBankAccount = useCallback(
    (updatedAccountData: BankAccount) => {
      setStoredBankAccounts(prev =>
        prev
          .map(account =>
            account.id === updatedAccountData.id
              ? {
                  ...updatedAccountData,
                  balance: Number(updatedAccountData.balance),
                  overdraftLimit: updatedAccountData.overdraftLimit !== undefined && updatedAccountData.overdraftLimit !== null && updatedAccountData.overdraftLimit !== '' ? Number(updatedAccountData.overdraftLimit) : undefined,
                }
              : account
          )
          .sort((a,b) => a.bankName.localeCompare(b.bankName))
      );
    },
    [setStoredBankAccounts]
  );

  const deleteBankAccount = useCallback(
    (accountId: string) => {
      setStoredBankAccounts(prev => prev.filter(account => account.id !== accountId));
    },
    [setStoredBankAccounts]
  );

  const getBankAccountById = useCallback(
    (accountId: string): BankAccount | undefined => {
      return internalBankAccounts.find(account => account.id === accountId);
    },
    [internalBankAccounts]
  );

  if (isBackupInstance) {
    return {
      bankAccounts: storedBankAccounts,
      setBankAccounts: setStoredBankAccounts,
      isReady,
    };
  }

  return {
    bankAccounts: internalBankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    getBankAccountById,
  };
}
