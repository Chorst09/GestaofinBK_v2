"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RouteMapViewer } from './route-map-viewer';
import { 
  Navigation, 
  Trash2, 
  MapPin, 
  Clock, 
  DollarSign,
  Car,
  ArrowRight,
  Eye
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSimulatedRoutes } from '@/hooks/useSimulatedRoutes';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function SavedRoutesList() {
  const { routes, deleteRoute } = useSimulatedRoutes();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [viewingRoute, setViewingRoute] = React.useState<string | null>(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteRoute(deleteTarget);
    toast({
      title: "Rota excluída",
      description: "A rota foi removida com sucesso.",
    });
    setDeleteTarget(null);
  };

  if (routes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Navigation className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma rota salva</h3>
          <p className="text-muted-foreground text-center">
            Simule uma viagem e salve a rota para visualizá-la aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <Card key={route.id} className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  {route.origin} <ArrowRight className="h-4 w-4" /> {route.destination}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Car className="h-3 w-3" />
                  {route.vehicleName}
                  {route.isRoundTrip && (
                    <Badge variant="secondary" className="ml-2">Ida e Volta</Badge>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingRoute(viewingRoute === route.id ? null : route.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(route.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Navigation className="h-3 w-3" />
                  Distância
                </div>
                <p className="font-semibold">{route.distance} km</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Tempo
                </div>
                <p className="font-semibold">{route.duration}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  Combustível
                </div>
                <p className="font-semibold text-blue-600">R$ {route.fuelCost}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  Pedágios
                </div>
                <p className="font-semibold text-orange-600">R$ {route.tollCost}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  Total
                </div>
                <p className="font-semibold text-green-600">R$ {route.totalCost}</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Salva em {format(parseISO(route.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>

            {/* Visualizador de Mapa */}
            {viewingRoute === route.id && (
              <div className="mt-4">
                <RouteMapViewer
                  route={{
                    origin: route.origin,
                    destination: route.destination,
                    distance: route.distance,
                    duration: route.duration,
                    fuelCost: route.fuelCost,
                    tollCost: route.tollCost,
                    totalCost: route.totalCost,
                    isRoundTrip: route.isRoundTrip,
                    vehicleName: route.vehicleName,
                    tollPlazas: route.tollPlazas,
                  }}
                  onClose={() => setViewingRoute(null)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta rota salva? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
