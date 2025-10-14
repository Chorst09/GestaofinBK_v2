
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { CreditCard, CreditCardFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const CREDIT_CARDS_STORAGE_KEY = 'financasZenCreditCards';

type UseCreditCardsReturn = {
    creditCards: CreditCard[];
    addCreditCard: (data: CreditCardFormData) => void;
    updateCreditCard: (data: CreditCard) => void;
    deleteCreditCard: (cardId: string) => void;
    getCreditCardById: (cardId: string) => CreditCard | undefined;
};

type UseCreditCardsBackupReturn = {
    creditCards: CreditCard[];
    setCreditCards: (value: CreditCard[] | ((val: CreditCard[]) => CreditCard[])) => void;
    isReady: boolean;
};

export function useCreditCards(isBackupInstance: true): UseCreditCardsBackupReturn;
export function useCreditCards(isBackupInstance?: false): UseCreditCardsReturn;
export function useCreditCards(isBackupInstance = false): UseCreditCardsReturn | UseCreditCardsBackupReturn {
  const [storedCreditCards, setStoredCreditCards, isReady] = useLocalStorage<CreditCard[]>(
    CREDIT_CARDS_STORAGE_KEY,
    []
  );

  const [internalCreditCards, setInternalCreditCards] = useState<CreditCard[]>([]);

  useEffect(() => {
    if (Array.isArray(storedCreditCards)) {
      const validItems = storedCreditCards.filter(
        item =>
          item &&
          typeof item.id === 'string' &&
          typeof item.bankName === 'string' &&
          typeof item.cardFlag === 'string' &&
          typeof item.dueDateDay === 'number' &&
          item.dueDateDay >= 1 && item.dueDateDay <= 31 &&
          (item.creditLimit === undefined || (typeof item.creditLimit === 'number' && item.creditLimit >= 0)) &&
          (item.logoKey === undefined || typeof item.logoKey === 'string') &&
          (item.photoUrl === undefined || typeof item.photoUrl === 'string')
      ).map(item => ({
        ...item,
        creditLimit: item.creditLimit !== undefined ? Number(item.creditLimit) : undefined,
      }));
      setInternalCreditCards(validItems.sort((a,b) => a.bankName.localeCompare(b.bankName)));
    } else {
      setInternalCreditCards([]);
    }
  }, [storedCreditCards]);

  const addCreditCard = useCallback(
    (cardData: CreditCardFormData) => {
      const newCreditCard: CreditCard = {
        id: uuidv4(),
        ...cardData,
        dueDateDay: Number(cardData.dueDateDay),
        creditLimit: cardData.creditLimit !== undefined ? Number(cardData.creditLimit) : undefined,
        logoKey: cardData.logoKey || undefined,
        photoUrl: cardData.photoUrl || undefined,
      };
      setStoredCreditCards(prev => [...prev, newCreditCard].sort((a,b) => a.bankName.localeCompare(b.bankName)));
    },
    [setStoredCreditCards]
  );

  const updateCreditCard = useCallback(
    (updatedCardData: CreditCard) => {
      setStoredCreditCards(prev =>
        prev
          .map(card =>
            card.id === updatedCardData.id
              ? {
                  ...updatedCardData,
                  dueDateDay: Number(updatedCardData.dueDateDay),
                  creditLimit: updatedCardData.creditLimit !== undefined && updatedCardData.creditLimit !== null && updatedCardData.creditLimit !== '' ? Number(updatedCardData.creditLimit) : undefined,
                }
              : card
          )
          .sort((a,b) => a.bankName.localeCompare(b.bankName))
      );
    },
    [setStoredCreditCards]
  );

  const deleteCreditCard = useCallback(
    (cardId: string) => {
      setStoredCreditCards(prev => prev.filter(card => card.id !== cardId));
    },
    [setStoredCreditCards]
  );

  const getCreditCardById = useCallback(
    (cardId: string): CreditCard | undefined => {
      return internalCreditCards.find(card => card.id === cardId);
    },
    [internalCreditCards]
  );

  if (isBackupInstance) {
    return {
      creditCards: storedCreditCards,
      setCreditCards: setStoredCreditCards,
      isReady,
    };
  }

  return {
    creditCards: internalCreditCards,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    getCreditCardById,
  };
}
