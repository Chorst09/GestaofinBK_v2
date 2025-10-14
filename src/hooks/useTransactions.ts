
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
    // Migração: adicionar campo status para transações existentes que não o possuem
    const migratedTransactions = storedTransactions.map(transaction => ({
      ...transaction,
      status: transaction.status || 'paid' // Default para 'paid' se não existir
    })) as Transaction[];
    
    // Verificar se alguma migração foi necessária
    const needsMigration = storedTransactions.some(t => !(t as any).status);
    if (needsMigration) {
      setStoredTransactions(migratedTransactions);
    }
    
    const sorted = [...migratedTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(sorted);
  }, [storedTransactions, setStoredTransactions]);


  const addTransaction = useCallback((transactionData: TransactionFormData) => {
    const newTransaction: Transaction = {
      id: uuidv4(),
      ...transactionData,
      amount: Number(transactionData.amount),
      status: transactionData.status || 'paid',
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
        status: td.status || 'paid',
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
            status: updatedTransaction.status || 'paid',
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

    