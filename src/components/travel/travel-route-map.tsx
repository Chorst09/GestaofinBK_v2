"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Save, 
  Navigation,
  Clock,
  MoveUp,
  MoveDown,
  Edit2
} from 'lucide-react';
import type { TravelRoutePoint } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TravelRouteMapProps {
  travelId: string;
  onSaveRoute: (points: TravelRoutePoint[], routeName: string) => void;
  initialPoints?: TravelRoutePoint[];
  initialRouteName?: string;
}

export function TravelRouteMap({ 
  travelId, 
  onSaveRoute, 
  initialPoints = [],
  initialRouteName = ''
}: TravelRouteMapProps) {
  const { toast } = useToast();
  const [routeName, setRouteName] = React.useState(initialRouteName);
  const [points, setPoints] = React.useState<TravelRoutePoint[]>(initialPoints);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingPoint, setEditingPoint] = React.useState<TravelRoutePoint | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = React.useState<google.maps.DirectionsRenderer | null>(null);
  const [markers, setMarkers] = React.useState<google.maps.Marker[]>([]);

  // Inicializar Google Maps
  React.useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = () => {
      const newMap = new google.maps.Map(mapRef.current!, {
        center: { lat: -14.235, lng: -51.925 }, // Centro do Brasil
        zoom: 4,
        mapTypeControl: true,
        streetViewControl: false,
      });

      const renderer = new google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: false,
      });

      setMap(newMap);
      setDirectionsRenderer(renderer);
    };

    if (typeof google !== 'undefined') {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [map]);

  // Atualizar rota no mapa quando os pontos mudarem
  React.useEffect(() => {
    if (!map || !directionsRenderer || points.length < 2) {
      // Limpar marcadores se houver menos de 2 pontos
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    
    const origin = { lat: points[0].lat, lng: points[0].lng };
    const destination = { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng };
    const waypoints = points.slice(1, -1).map(point => ({
      location: { lat: point.lat, lng: point.lng },
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [points, map, directionsRenderer]);

  const searchPlace = async () => {
    if (!map || !searchQuery.trim()) return;

    const service = new google.maps.places.PlacesService(map);
    
    service.textSearch(
      {
        query: searchQuery,
      },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const place = results[0];
          const location = place.geometry?.location;
          
          if (location) {
            const newPoint: TravelRoutePoint = {
              id: `point-${Date.now()}`,
              name: place.name || searchQuery,
              address: place.formatted_address || '',
              lat: location.lat(),
              lng: location.lng(),
              order: points.length,
            };

            setPoints([...points, newPoint]);
            setSearchQuery('');
            
            // Centralizar mapa no novo ponto
            map.setCenter(location);
            map.setZoom(12);

            toast({
              title: "Ponto adicionado!",
              description: `${newPoint.name} foi adicionado à rota.`,
            });
          }
        } else {
          toast({
            variant: "destructive",
            title: "Local não encontrado",
            description: "Tente buscar com mais detalhes ou um endereço completo.",
          });
        }
      }
    );
  };

  const removePoint = (pointId: string) => {
    const updatedPoints = points
      .filter(p => p.id !== pointId)
      .map((p, index) => ({ ...p, order: index }));
    setPoints(updatedPoints);
  };

  const movePoint = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === points.length - 1)
    ) {
      return;
    }

    const newPoints = [...points];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newPoints[index], newPoints[targetIndex]] = [newPoints[targetIndex], newPoints[index]];
    
    // Atualizar ordem
    newPoints.forEach((p, i) => p.order = i);
    setPoints(newPoints);
  };

  const handleEditPoint = (point: TravelRoutePoint) => {
    setEditingPoint({ ...point });
    setIsEditDialogOpen(true);
  };

  const saveEditedPoint = () => {
    if (!editingPoint) return;

    const updatedPoints = points.map(p => 
      p.id === editingPoint.id ? editingPoint : p
    );
    setPoints(updatedPoints);
    setIsEditDialogOpen(false);
    setEditingPoint(null);
    
    toast({
      title: "Ponto atualizado!",
      description: "As informações do ponto foram atualizadas.",
    });
  };

  const handleSaveRoute = () => {
    if (!routeName.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Por favor, dê um nome para a rota.",
      });
      return;
    }

    if (points.length < 2) {
      toast({
        variant: "destructive",
        title: "Pontos insuficientes",
        description: "Adicione pelo menos 2 pontos para criar uma rota.",
      });
      return;
    }

    onSaveRoute(points, routeName);
    toast({
      title: "Rota salva!",
      description: `A rota "${routeName}" foi salva com sucesso.`,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Planejamento de Rota
          </CardTitle>
          <CardDescription>
            Crie e visualize o roteiro da sua viagem no mapa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Rota</Label>
            <Input
              placeholder="Ex: Roteiro Dia 1 - Centro Histórico"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Buscar Local</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o nome do local ou endereço"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPlace()}
              />
              <Button onClick={searchPlace} type="button">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Mapa */}
          <div 
            ref={mapRef} 
            className="w-full h-[400px] rounded-lg border"
          />

          {/* Lista de Pontos */}
          {points.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pontos da Rota ({points.length})</Label>
                <Button onClick={handleSaveRoute} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rota
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {points.map((point, index) => (
                  <Card key={point.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-1">
                        {index + 1}
                      </Badge>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h4 className="font-semibold text-sm truncate">{point.name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{point.address}</p>
                        {point.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{point.notes}</p>
                        )}
                        {(point.arrivalTime || point.departureTime) && (
                          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                            {point.arrivalTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Chegada: {new Date(point.arrivalTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {point.departureTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Saída: {new Date(point.departureTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditPoint(point)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => movePoint(index, 'up')}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => movePoint(index, 'down')}
                          disabled={index === points.length - 1}
                        >
                          <MoveDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removePoint(point.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ponto</DialogTitle>
            <DialogDescription>
              Adicione informações adicionais sobre este ponto da rota
            </DialogDescription>
          </DialogHeader>
          
          {editingPoint && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Local</Label>
                <Input
                  value={editingPoint.name}
                  onChange={(e) => setEditingPoint({ ...editingPoint, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  placeholder="Adicione observações sobre este local..."
                  value={editingPoint.notes || ''}
                  onChange={(e) => setEditingPoint({ ...editingPoint, notes: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário de Chegada</Label>
                  <Input
                    type="time"
                    value={editingPoint.arrivalTime ? new Date(editingPoint.arrivalTime).toTimeString().slice(0, 5) : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const date = new Date();
                        const [hours, minutes] = e.target.value.split(':');
                        date.setHours(parseInt(hours), parseInt(minutes));
                        setEditingPoint({ ...editingPoint, arrivalTime: date.toISOString() });
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário de Saída</Label>
                  <Input
                    type="time"
                    value={editingPoint.departureTime ? new Date(editingPoint.departureTime).toTimeString().slice(0, 5) : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const date = new Date();
                        const [hours, minutes] = e.target.value.split(':');
                        date.setHours(parseInt(hours), parseInt(minutes));
                        setEditingPoint({ ...editingPoint, departureTime: date.toISOString() });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveEditedPoint}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
