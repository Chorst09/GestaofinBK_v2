"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Navigation, 
  Fuel, 
  DollarSign, 
  Clock, 
  MapPin,
  Car,
  Receipt
} from 'lucide-react';

interface TripSimulatorResultsProps {
  result: {
    vehicle: any;
    origin: string;
    destination: string;
    distance: string;
    duration: string;
    fuelLiters: string;
    fuelCost: string;
    tollCost: string;
    totalCost: string;
  };
}

export function TripSimulatorResults({ result }: TripSimulatorResultsProps) {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Resultado da Simulação
        </CardTitle>
        <CardDescription>
          Custos estimados para sua viagem
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Veículo */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <Car className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Veículo</p>
            <p className="font-semibold">
              {result.vehicle?.name} - {result.vehicle?.brand} {result.vehicle?.model}
            </p>
          </div>
        </div>

        {/* Rota */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-600 mt-1" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Origem</p>
              <p className="text-sm font-medium">{result.origin}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-red-600 mt-1" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Destino</p>
              <p className="text-sm font-medium">{result.destination}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Navigation className="h-4 w-4" />
              <span className="text-xs">Distância</span>
            </div>
            <p className="text-2xl font-bold">{result.distance} km</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Tempo</span>
            </div>
            <p className="text-2xl font-bold">{result.duration}</p>
          </div>
        </div>

        <Separator />

        {/* Custos */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Detalhamento de Custos
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Combustível</p>
                  <p className="text-xs text-muted-foreground">{result.fuelLiters} litros</p>
                </div>
              </div>
              <p className="text-lg font-bold text-blue-600">
                R$ {result.fuelCost}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Pedágios</p>
                  <p className="text-xs text-muted-foreground">Estimativa</p>
                </div>
              </div>
              <p className="text-lg font-bold text-orange-600">
                R$ {result.tollCost}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border-2 border-green-200 dark:border-green-800">
            <div>
              <p className="text-sm text-muted-foreground">Custo Total</p>
              <p className="text-xs text-muted-foreground">Combustível + Pedágios</p>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              R$ {result.totalCost}
            </p>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            ℹ️ Os valores de pedágio são estimativas baseadas em médias de rodovias brasileiras. 
            Consulte as concessionárias para valores exatos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
