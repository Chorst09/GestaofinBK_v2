"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, Fuel, DollarSign, Clock, Navigation, BookmarkIcon } from 'lucide-react';
import { TripSimulatorForm } from '@/components/vehicles/trip-simulator-form';
import { TripSimulatorResults } from '@/components/vehicles/trip-simulator-results';
import { SavedRoutesList } from '@/components/vehicles/saved-routes-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TripSimulatorPage() {
  const router = useRouter();
  const { vehicles } = useVehicles();
  const [simulationResult, setSimulationResult] = React.useState<any>(null);

  if (vehicles.length === 0) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/vehicles')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calculator className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum veículo cadastrado</h3>
            <p className="text-muted-foreground text-center mb-6">
              Cadastre um veículo primeiro para usar o simulador de viagem
            </p>
            <Button onClick={() => router.push('/vehicles')}>
              Ir para Veículos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/vehicles')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Simulador de Viagem
          </h1>
          <p className="text-muted-foreground mt-2">
            Calcule custos de combustível, pedágios e tempo de viagem
          </p>
        </div>
      </div>

      <Tabs defaultValue="simulator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simulator">
            <Calculator className="h-4 w-4 mr-2" />
            Simulador
          </TabsTrigger>
          <TabsTrigger value="saved">
            <BookmarkIcon className="h-4 w-4 mr-2" />
            Rotas Salvas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <TripSimulatorForm
              vehicles={vehicles}
              onSimulate={setSimulationResult}
            />

            {simulationResult && (
              <TripSimulatorResults result={simulationResult} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <SavedRoutesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
