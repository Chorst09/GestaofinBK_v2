"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Trash2, 
  Eye,
  Navigation,
  Clock
} from 'lucide-react';
import type { TravelRoute } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

interface SavedRoutesListProps {
  routes: TravelRoute[];
  onDeleteRoute: (routeId: string) => void;
  onViewRoute: (route: TravelRoute) => void;
}

export function SavedRoutesList({ routes, onDeleteRoute, onViewRoute }: SavedRoutesListProps) {
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  if (routes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Navigation className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma rota salva</h3>
          <p className="text-muted-foreground text-center">
            Crie sua primeira rota para começar a planejar seu roteiro
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {routes.map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    {route.name}
                  </CardTitle>
                  <CardDescription>
                    {route.points.length} {route.points.length === 1 ? 'ponto' : 'pontos'} • 
                    Criada em {format(new Date(route.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewRoute(route)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
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
            <CardContent>
              <div className="space-y-2">
                {route.points.map((point, index) => (
                  <div key={point.id} className="flex items-start gap-3 text-sm">
                    <Badge variant="secondary" className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">{point.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate ml-5">{point.address}</p>
                      {point.notes && (
                        <p className="text-xs text-muted-foreground mt-1 ml-5">{point.notes}</p>
                      )}
                      {(point.arrivalTime || point.departureTime) && (
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground ml-5">
                          {point.arrivalTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(point.arrivalTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {point.departureTime && (
                            <span className="flex items-center gap-1">
                              → {new Date(point.departureTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta rota? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteTarget) {
                  onDeleteRoute(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
