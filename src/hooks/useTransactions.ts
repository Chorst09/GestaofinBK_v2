
"use client";

import { useCallback, useState, useEffect } from 'react';
import type { Transaction, TransactionFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid'; 

const TRANSACTIONS_STORAGE_KEY = 'financasZenTransactions';

type UseTransactionsReturn = {
  transactions: Transaction[];
  addTransaction: (data: TransactionFormData) => void;
  addMultipleTransactions: (data: TransactionFormData[]) => void;
  updateTransaction: (data: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  getTransactionById: (transactionId: string) => Transaction | undefined;
};

type UseTransactionsBackupReturn = {
  transactions: Transaction[];
  setTransactions: (value: Transaction[] | ((val: Transaction[]) => Transaction[])) => void;
  isReady: boolean;
};

export function useTransactions(isBackupInstance: true): UseTransactionsBackupReturn;
export function useTransactions(isBackupInstance?: false): UseTransactionsReturn;
export function useTransactions(isBackupInstance = false): UseTransactionsReturn | UseTransactionsBackupReturn {
  const [storedTransactions, setStoredTransactions, isReady] = useLocalStorage<Transaction[]>(TRANSACTIONS_STORAGE_KEY, []);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const sorted = [...storedTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(sorted);
  }, [storedTransactions]);


  const addTransaction = useCallback((transactionData: TransactionFormData) => {
    const newTransaction: Transaction = {
      id: uuidv4(),
      ...transactionData,
      amount: Number(transactionData.amount),
      cardBrand: transactionData.cardBrand || undefined,
      creditCardId: transactionData.creditCardId || undefined,
      bankAccountId: transactionData.bankAccountId || undefined,
    };
    setStoredTransactions(prevTransactions => [...prevTransactions, newTransaction]);
  }, [setStoredTransactions]);

  const addMultipleTransactions = useCallback((transactionsData: TransactionFormData[]) => {
    const newTransactions: Transaction[] = transactionsData.map(td => ({
        id: uuidv4(),
        ...td,
        amount: Number(td.amount),
        cardBrand: td.cardBrand || undefined,
        creditCardId: td.creditCardId || undefined, 
        bankAccountId: td.bankAccountId || undefined,
    }));
    setStoredTransactions(prevTransactions => [...prevTransactions, ...newTransactions]);
  }, [setStoredTransactions]);

  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    setStoredTransactions(prevTransactions =>
      prevTransactions.map(t => (t.id === updatedTransaction.id 
        ? {
            ...updatedTransaction, 
            amount: Number(updatedTransaction.amount), 
            cardBrand: updatedTransaction.cardBrand || undefined,
            creditCardId: updatedTransaction.creditCardId || undefined,
            bankAccountId: updatedTransaction.bankAccountId || undefined,
          } 
        : t))
    );
  }, [setStoredTransactions]);

  const deleteTransaction = useCallback((transactionId: string) => {
    setStoredTransactions(prevTransactions => prevTransactions.filter(t => t.id !== transactionId));
  }, [setStoredTransactions]);

  const getTransactionById = useCallback((transactionId: string) => {
    return transactions.find(t => t.id === transactionId);
  }, [transactions]);
  
  if (isBackupInstance) {
    return {
      transactions: storedTransactions,
      setTransactions: setStoredTransactions,
      isReady,
    };
  }

  return {
    transactions,
    addTransaction,
    addMultipleTransactions,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
  };
}

    