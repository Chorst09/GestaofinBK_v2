"use client";

import * as React from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calculator, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle } from '@/lib/types';
import { calculateTollsFromRoute } from '@/lib/toll-service';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -14.235,
  lng: -51.925
};

interface TripSimulatorFormProps {
  vehicles: Vehicle[];
  onSimulate: (result: any) => void;
}

export function TripSimulatorForm({ vehicles, onSimulate }: TripSimulatorFormProps) {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = React.useState<string>('');
  const [fuelConsumption, setFuelConsumption] = React.useState<string>('');
  const [fuelPrice, setFuelPrice] = React.useState<string>('');
  const [origin, setOrigin] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [isRoundTrip, setIsRoundTrip] = React.useState(false);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = React.useState<google.maps.DirectionsResult | null>(null);
  const [autoFuelData, setAutoFuelData] = React.useState<{ avgConsumption: number; lastPrice: number } | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Buscar dados do veículo quando selecionado
  React.useEffect(() => {
    if (!selectedVehicle) {
      setAutoFuelData(null);
      return;
    }

    // Buscar dados do localStorage
    const vehicleExpensesKey = 'financasZenVehicleExpenses';
    const storedExpenses = localStorage.getItem(vehicleExpensesKey);
    
    if (storedExpenses) {
      try {
        const expenses = JSON.parse(storedExpenses);
        const vehicleExpenses = expenses.filter((exp: any) => 
          exp.vehicleId === selectedVehicle && exp.expenseType === 'fuel'
        );

        if (vehicleExpenses.length > 0) {
          // Ordenar por data (mais recente primeiro)
          vehicleExpenses.sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          // Calcular média de consumo (Km/L)
          const expensesWithConsumption = vehicleExpenses.filter((exp: any) => 
            exp.liters && exp.liters > 0
          );

          let avgConsumption = 0;
          if (expensesWithConsumption.length >= 2) {
            // Calcular diferença de km entre abastecimentos
            const consumptions: number[] = [];
            for (let i = 0; i < expensesWithConsumption.length - 1; i++) {
              const current = expensesWithConsumption[i];
              const previous = expensesWithConsumption[i + 1];
              const kmDiff = current.odometer - previous.odometer;
              const liters = current.liters;
              if (kmDiff > 0 && liters > 0) {
                consumptions.push(kmDiff / liters);
              }
            }
            if (consumptions.length > 0) {
              avgConsumption = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
            }
          }

          // Último preço por litro
          const lastExpense = vehicleExpenses[0];
          const lastPrice = lastExpense.liters > 0 
            ? lastExpense.amount / lastExpense.liters 
            : 0;

          if (avgConsumption > 0 && lastPrice > 0) {
            setAutoFuelData({
              avgConsumption: parseFloat(avgConsumption.toFixed(2)),
              lastPrice: parseFloat(lastPrice.toFixed(2))
            });
            setFuelConsumption(avgConsumption.toFixed(2));
            setFuelPrice(lastPrice.toFixed(2));
            
            toast({
              title: "Dados carregados!",
              description: `Consumo médio: ${avgConsumption.toFixed(1)} Km/L • Último preço: R$ ${lastPrice.toFixed(2)}/L`,
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do veículo:', error);
      }
    }
  }, [selectedVehicle, toast]);

  const calculateRoute = async () => {
    if (!origin || !destination) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha origem e destino",
      });
      return;
    }

    if (!selectedVehicle || !fuelConsumption || !fuelPrice) {
      toast({
        variant: "destructive",
        title: "Dados do veículo",
        description: "Selecione o veículo e preencha consumo e preço do combustível",
      });
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirectionsResponse(result);

          const route = result.routes[0];
          const leg = route.legs[0];
          
          let distanceKm = (leg.distance?.value || 0) / 1000;
          let durationSeconds = leg.duration?.value || 0;
          const consumption = parseFloat(fuelConsumption);
          const price = parseFloat(fuelPrice);

          // Se for ida e volta, dobrar distância e tempo
          const tripMultiplier = isRoundTrip ? 2 : 1;
          distanceKm = distanceKm * tripMultiplier;
          durationSeconds = durationSeconds * tripMultiplier;

          // Calcular combustível
          const litersNeeded = distanceKm / consumption;
          const fuelCost = litersNeeded * price;

          // Calcular pedágios baseado na rota real traçada
          const tollData = calculateTollsFromRoute(route, 'car');
          const tollCost = tollData.total * tripMultiplier;

          const simulationResult = {
            vehicle: vehicles.find(v => v.id === selectedVehicle),
            origin: leg.start_address,
            destination: leg.end_address,
            distance: distanceKm.toFixed(1),
            duration: formatDuration(durationSeconds),
            fuelLiters: litersNeeded.toFixed(2),
            fuelCost: fuelCost.toFixed(2),
            tollCost: tollCost.toFixed(2),
            totalCost: (fuelCost + tollCost).toFixed(2),
            route: result,
            isRoundTrip,
            tollPlazas: tollData.plazas.map(p => ({
              ...p,
              concessionaire: p.concessionaire
            })),
          };

          onSimulate(simulationResult);
          
          const tollCount = tollData.plazas.length;
          toast({
            title: "Rota calculada!",
            description: `${distanceKm.toFixed(0)} km${isRoundTrip ? ' (ida e volta)' : ''} • ${tollCount} pedágio${tollCount !== 1 ? 's' : ''} • R$ ${(fuelCost + tollCost).toFixed(2)}`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro ao calcular rota",
            description: "Verifique os endereços informados",
          });
        }
      }
    );
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Configurar Simulação
        </CardTitle>
        <CardDescription>
          Preencha os dados para calcular os custos da viagem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Veículo</Label>
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o veículo" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} - {vehicle.brand} {vehicle.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Consumo (Km/L)
              {autoFuelData && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  • Média calculada
                </span>
              )}
            </Label>
            <Input
              type="number"
              step="0.1"
              placeholder="12.5"
              value={fuelConsumption}
              onChange={(e) => setFuelConsumption(e.target.value)}
              className={autoFuelData ? 'border-green-300 dark:border-green-700' : ''}
            />
            {autoFuelData && (
              <p className="text-xs text-muted-foreground">
                Baseado em {autoFuelData.avgConsumption} Km/L. Ajuste para consumo em estrada.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Preço Combustível (R$/L)
              {autoFuelData && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  • Último abastecimento
                </span>
              )}
            </Label>
            <Input
              type="number"
              step="0.01"
              placeholder="5.50"
              value={fuelPrice}
              onChange={(e) => setFuelPrice(e.target.value)}
              className={autoFuelData ? 'border-green-300 dark:border-green-700' : ''}
            />
            {autoFuelData && (
              <p className="text-xs text-muted-foreground">
                Último preço pago: R$ {autoFuelData.lastPrice}/L
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Origem</Label>
          <Input
            placeholder="Ex: São Paulo, SP"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Destino</Label>
          <Input
            placeholder="Ex: Rio de Janeiro, RJ"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="space-y-0.5">
            <Label>Ida e Volta</Label>
            <p className="text-xs text-muted-foreground">
              Calcular custos para viagem de ida e volta
            </p>
          </div>
          <Switch
            checked={isRoundTrip}
            onCheckedChange={setIsRoundTrip}
          />
        </div>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={4}
          onLoad={onLoad}
        >
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>

        <Button onClick={calculateRoute} className="w-full">
          <Calculator className="mr-2 h-4 w-4" />
          Calcular Viagem
        </Button>
      </CardContent>
    </Card>
  );
}
