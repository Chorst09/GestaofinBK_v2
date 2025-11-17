"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTravelEvents } from '@/hooks/useTravelEvents';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { TravelRouteMap } from '@/components/travel/travel-route-map';
import { SavedRoutesList } from '@/components/travel/saved-routes-list';
import type { TravelRoutePoint, TravelRoute } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TravelRoutesPage() {
  const params = useParams();
  const router = useRouter();
  const travelId = params.id as string;
  const { toast } = useToast();
  
  const {
    getTravelEventById,
    addRouteToTravel,
    deleteRouteFromTravel,
    getRoutesForTravel,
  } = useTravelEvents();

  const travel = getTravelEventById(travelId);
  const routes = getRoutesForTravel(travelId);
  
  const [viewingRoute, setViewingRoute] = React.useState<TravelRoute | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>('new');

  if (!travel) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold mb-4">Viagem não encontrada</h2>
        <Button onClick={() => router.push('/travel')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Viagens
        </Button>
      </div>
    );
  }

  const handleSaveRoute = (points: TravelRoutePoint[], routeName: string) => {
    addRouteToTravel(travelId, {
      travelId,
      name: routeName,
      points,
    });
    
    setActiveTab('saved');
  };

  const handleDeleteRoute = (routeId: string) => {
    deleteRouteFromTravel(travelId, routeId);
    toast({
      title: "Rota excluída",
      description: "A rota foi removida com sucesso.",
    });
  };

  const handleViewRoute = (route: TravelRoute) => {
    setViewingRoute(route);
    setActiveTab('view');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/travel')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Rotas - {travel.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            {travel.destination}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Rota
          </TabsTrigger>
          <TabsTrigger value="saved">
            Rotas Salvas ({routes.length})
          </TabsTrigger>
          <TabsTrigger value="view" disabled={!viewingRoute}>
            Visualizar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6">
          <TravelRouteMap
            travelId={travelId}
            onSaveRoute={handleSaveRoute}
          />
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <SavedRoutesList
            routes={routes}
            onDeleteRoute={handleDeleteRoute}
            onViewRoute={handleViewRoute}
          />
        </TabsContent>

        <TabsContent value="view" className="mt-6">
          {viewingRoute && (
            <TravelRouteMap
              travelId={travelId}
              onSaveRoute={() => {}}
              initialPoints={viewingRoute.points}
              initialRouteName={viewingRoute.name}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
