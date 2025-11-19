"use client";

import { useState, useEffect, useCallback } from 'react';
import type { SimulatedTripRoute } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { v4 as uuidv4 } from 'uuid';

const SIMULATED_ROUTES_STORAGE_KEY = 'financasZenSimulatedRoutes';

export function useSimulatedRoutes() {
  const [storedRoutes, setStoredRoutes, isReady] = useLocalStorage<SimulatedTripRoute[]>(
    SIMULATED_ROUTES_STORAGE_KEY,
    []
  );

  const [routes, setRoutes] = useState<SimulatedTripRoute[]>([]);

  useEffect(() => {
    if (Array.isArray(storedRoutes)) {
      setRoutes(storedRoutes);
    }
  }, [storedRoutes]);

  const addRoute = useCallback(
    (routeData: Omit<SimulatedTripRoute, 'id' | 'createdAt'>) => {
      const newRoute: SimulatedTripRoute = {
        id: uuidv4(),
        ...routeData,
        createdAt: new Date().toISOString(),
      };
      setStoredRoutes(prev => [newRoute, ...prev]);
      return newRoute;
    },
    [setStoredRoutes]
  );

  const deleteRoute = useCallback(
    (routeId: string) => {
      setStoredRoutes(prev => prev.filter(route => route.id !== routeId));
    },
    [setStoredRoutes]
  );

  const getRoutesByVehicle = useCallback(
    (vehicleId: string) => {
      return routes.filter(route => route.vehicleId === vehicleId);
    },
    [routes]
  );

  return {
    routes,
    addRoute,
    deleteRoute,
    getRoutesByVehicle,
    isReady,
  };
}
