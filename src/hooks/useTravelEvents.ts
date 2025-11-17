"use client";

import { useState, useEffect, useCallback } from 'react';
import type { TravelEvent, TravelEventFormData } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, isWithinInterval, isBefore, isAfter } from 'date-fns';
import type { TravelRoute } from '@/lib/types';

const TRAVEL_EVENTS_STORAGE_KEY = 'financasZenTravelEvents';

type UseTravelEventsReturn = {
  travelEvents: TravelEvent[];
  addTravelEvent: (data: TravelEventFormData) => void;
  updateTravelEvent: (data: TravelEvent) => void;
  deleteTravelEvent: (eventId: string) => void;
  getTravelEventById: (eventId: string) => TravelEvent | undefined;
  getActiveTravelEvents: () => TravelEvent[];
  updateTravelStatus: (eventId: string, status: TravelEvent['status']) => void;
  addRouteToTravel: (travelId: string, route: Omit<TravelRoute, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteRouteFromTravel: (travelId: string, routeId: string) => void;
  getRoutesForTravel: (travelId: string) => TravelRoute[];
};

type UseTravelEventsBackupReturn = {
  travelEvents: TravelEvent[];
  setTravelEvents: (value: TravelEvent[] | ((val: TravelEvent[]) => TravelEvent[])) => void;
  isReady: boolean;
};

export function useTravelEvents(isBackupInstance: true): UseTravelEventsBackupReturn;
export function useTravelEvents(isBackupInstance?: false): UseTravelEventsReturn;
export function useTravelEvents(isBackupInstance = false): UseTravelEventsReturn | UseTravelEventsBackupReturn {
  const [storedTravelEvents, setStoredTravelEvents, isReady] = useLocalStorage<TravelEvent[]>(
    TRAVEL_EVENTS_STORAGE_KEY,
    []
  );

  const [internalTravelEvents, setInternalTravelEvents] = useState<TravelEvent[]>([]);

  useEffect(() => {
    if (Array.isArray(storedTravelEvents)) {
      const validEvents = storedTravelEvents.filter(
        event =>
          event &&
          typeof event.id === 'string' &&
          typeof event.name === 'string' &&
          typeof event.destination === 'string' &&
          typeof event.startDate === 'string' &&
          typeof event.endDate === 'string' &&
          typeof event.totalBudget === 'number' &&
          Array.isArray(event.budgetByCategory)
      );
      
      setInternalTravelEvents(validEvents.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ));
    } else {
      setInternalTravelEvents([]);
    }
  }, [storedTravelEvents]);

  const addTravelEvent = useCallback(
    (eventData: TravelEventFormData) => {
      const newEvent: TravelEvent = {
        id: uuidv4(),
        ...eventData,
      };
      setStoredTravelEvents(prev => 
        [...prev, newEvent].sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
      );
    },
    [setStoredTravelEvents]
  );

  const updateTravelEvent = useCallback(
    (updatedEvent: TravelEvent) => {
      setStoredTravelEvents(prev =>
        prev
          .map(event => event.id === updatedEvent.id ? updatedEvent : event)
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      );
    },
    [setStoredTravelEvents]
  );

  const deleteTravelEvent = useCallback(
    (eventId: string) => {
      setStoredTravelEvents(prev => prev.filter(event => event.id !== eventId));
    },
    [setStoredTravelEvents]
  );

  const getTravelEventById = useCallback(
    (eventId: string) => {
      return internalTravelEvents.find(event => event.id === eventId);
    },
    [internalTravelEvents]
  );

  const getActiveTravelEvents = useCallback(() => {
    const now = new Date();
    return internalTravelEvents.filter(event => {
      const startDate = parseISO(event.startDate);
      const endDate = parseISO(event.endDate);
      return isWithinInterval(now, { start: startDate, end: endDate }) || 
             (isBefore(now, startDate) && event.status === 'planned');
    });
  }, [internalTravelEvents]);

  const updateTravelStatus = useCallback(
    (eventId: string, status: TravelEvent['status']) => {
      setStoredTravelEvents(prev =>
        prev.map(event => 
          event.id === eventId ? { ...event, status } : event
        )
      );
    },
    [setStoredTravelEvents]
  );

  const addRouteToTravel = useCallback(
    (travelId: string, routeData: Omit<TravelRoute, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newRoute: TravelRoute = {
        ...routeData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setStoredTravelEvents(prev =>
        prev.map(event => {
          if (event.id === travelId) {
            return {
              ...event,
              routes: [...(event.routes || []), newRoute],
            };
          }
          return event;
        })
      );
    },
    [setStoredTravelEvents]
  );

  const deleteRouteFromTravel = useCallback(
    (travelId: string, routeId: string) => {
      setStoredTravelEvents(prev =>
        prev.map(event => {
          if (event.id === travelId) {
            return {
              ...event,
              routes: (event.routes || []).filter(route => route.id !== routeId),
            };
          }
          return event;
        })
      );
    },
    [setStoredTravelEvents]
  );

  const getRoutesForTravel = useCallback(
    (travelId: string) => {
      const travel = internalTravelEvents.find(event => event.id === travelId);
      return travel?.routes || [];
    },
    [internalTravelEvents]
  );

  if (isBackupInstance) {
    return {
      travelEvents: storedTravelEvents,
      setTravelEvents: setStoredTravelEvents,
      isReady,
    };
  }

  return {
    travelEvents: internalTravelEvents,
    addTravelEvent,
    updateTravelEvent,
    deleteTravelEvent,
    getTravelEventById,
    getActiveTravelEvents,
    updateTravelStatus,
    addRouteToTravel,
    deleteRouteFromTravel,
    getRoutesForTravel,
  };
}
