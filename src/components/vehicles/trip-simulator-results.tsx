"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSimulatedRoutes } from '@/hooks/useSimulatedRoutes';
import { RouteMapViewer } from './route-map-viewer';
import { 
  Navigation, 
  Fuel, 
  DollarSign, 
  Clock, 
  MapPin,
  Car,
  Receipt,
  Save
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
    isRoundTrip?: boolean;
    tollPlazas?: Array<{ name: string; value: number; route: string; concessionaire: string }>;
  };
}

export function TripSimulatorResults({ result }: TripSimulatorResultsProps) {
  const { toast } = useToast();
  const { addRoute } = useSimulatedRoutes();
  const [isSaving, setIsSaving] = React.useState(false);
  const [showMap, setShowMap] = React.useState(false);

  const handleSaveRoute = () => {
    setIsSaving(true);
    try {
      addRoute({
        vehicleId: result.vehicle.id,
        vehicleName: result.vehicle.name,
        origin: result.origin,
        destination: result.destination,
        distance: result.distance,
        duration: result.duration,
        fuelLiters: result.fuelLiters,
        fuelCost: result.fuelCost,
        tollCost: result.tollCost,
        totalCost: result.totalCost,
        isRoundTrip: result.isRoundTrip || false,
        tollPlazas: result.tollPlazas,
      });

      toast({
        title: "Rota salva com sucesso!",
        description: `A rota de ${result.origin} para ${result.destination} foi salva.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar rota",
        description: "Não foi possível salvar a rota. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
          {result.isRoundTrip && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
              <Badge variant="secondary">Ida e Volta</Badge>
              <span className="text-xs text-muted-foreground">Valores calculados para viagem completa</span>
            </div>
          )}
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

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Pedágios</p>
                    <p className="text-xs text-muted-foreground">
                      {result.tollPlazas && result.tollPlazas.length > 0 
                        ? `${result.tollPlazas.length} praça${result.tollPlazas.length !== 1 ? 's' : ''}${result.isRoundTrip ? ' (ida e volta)' : ''}`
                        : 'Nenhum pedágio detectado'
                      }
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-orange-600">
                  R$ {result.tollCost}
                </p>
              </div>
              
              {result.tollPlazas && result.tollPlazas.length > 0 && (
                <div className="space-y-1 pl-4 max-h-48 overflow-y-auto">
                  {result.tollPlazas.map((toll, index) => (
                    <div key={index} className="flex justify-between items-start text-xs py-1 border-b border-muted last:border-0">
                      <div className="flex-1">
                        <span className="font-medium">{toll.name}</span>
                        <div className="text-muted-foreground">
                          <span>{toll.route}</span>
                          <span className="mx-1">•</span>
                          <span className="text-blue-600 dark:text-blue-400">{toll.concessionaire}</span>
                        </div>
                      </div>
                      <span className="font-medium ml-2">
                        R$ {toll.value.toFixed(2)}{result.isRoundTrip && ' x2'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
            ℹ️ {result.tollPlazas && result.tollPlazas.length > 0 
              ? 'Pedágios detectados automaticamente na rota. Valores podem variar conforme categoria do veículo.'
              : 'Nenhum pedágio detectado nesta rota. Valores podem variar conforme a rota escolhida.'
            }
          </p>
        </div>

        <Separator />

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleSaveRoute}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Rota'}
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => setShowMap(!showMap)}
          >
            <MapPin className="mr-2 h-4 w-4" />
            {showMap ? 'Ocultar Mapa' : 'Visualizar Rota'}
          </Button>
        </div>

        {/* Visualizador de Mapa */}
        {showMap && (
          <div className="mt-4">
            <RouteMapViewer
              route={{
                origin: result.origin,
                destination: result.destination,
                distance: result.distance,
                duration: result.duration,
                fuelCost: result.fuelCost,
                tollCost: result.tollCost,
                totalCost: result.totalCost,
                isRoundTrip: result.isRoundTrip || false,
                vehicleName: result.vehicle.name,
                tollPlazas: result.tollPlazas,
              }}
              onClose={() => setShowMap(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
