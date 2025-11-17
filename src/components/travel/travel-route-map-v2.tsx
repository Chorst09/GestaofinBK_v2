"use client";

import * as React from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Save, 
  Navigation,
  MoveUp,
  MoveDown,
  Edit2
} from 'lucide-react';
import type { TravelRoutePoint } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -14.235,
  lng: -51.925
};

interface TravelRouteMapV2Props {
  travelId: string;
  onSaveRoute: (points: TravelRoutePoint[], routeName: string) => void;
  initialPoints?: TravelRoutePoint[];
  initialRouteName?: string;
}

export function TravelRouteMapV2({ 
  travelId, 
  onSaveRoute, 
  initialPoints = [],
  initialRouteName = ''
}: TravelRouteMapV2Props) {
  const { toast } = useToast();
  const [routeName, setRouteName] = React.useState(initialRouteName);
  const [points, setPoints] = React.useState<TravelRoutePoint[]>(initialPoints);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = React.useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  // Calcular rota quando pontos mudarem
  React.useEffect(() => {
    if (!map || points.length < 2) {
      setDirectionsResponse(null);
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
          setDirectionsResponse(result);
        }
      }
    );
  }, [points, map]);

  const searchPlace = async () => {
    if (!map || !searchQuery.trim()) return;

    const service = new google.maps.places.PlacesService(map);
    
    service.textSearch({ query: searchQuery }, (results, status) => {
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
          map.panTo(location);
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
          description: "Tente buscar com mais detalhes.",
        });
      }
    });
  };

  const removePoint = (pointId: string) => {
    const updatedPoints = points
      .filter(p => p.id !== pointId)
      .map((p, index) => ({ ...p, order: index }));
    setPoints(updatedPoints);
  };

  const movePoint = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === points.length - 1)) {
      return;
    }

    const newPoints = [...points];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newPoints[index], newPoints[targetIndex]] = [newPoints[targetIndex], newPoints[index]];
    newPoints.forEach((p, i) => p.order = i);
    setPoints(newPoints);
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
        description: "Adicione pelo menos 2 pontos.",
      });
      return;
    }

    onSaveRoute(points, routeName);
  };

  if (loadError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Erro ao carregar mapa</h3>
            <p className="text-sm text-muted-foreground">
              Verifique sua chave de API e conexão
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Carregando mapa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
            placeholder="Ex: Roteiro Dia 1"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Buscar Local</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome do local"
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

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={4}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
          {points.map((point, index) => (
            <Marker
              key={point.id}
              position={{ lat: point.lat, lng: point.lng }}
              label={(index + 1).toString()}
            />
          ))}
        </GoogleMap>

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
                    <Badge variant="secondary">{index + 1}</Badge>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-sm truncate">{point.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{point.address}</p>
                    </div>

                    <div className="flex gap-1">
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
  );
}
