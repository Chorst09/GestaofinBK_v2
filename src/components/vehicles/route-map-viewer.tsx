"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Navigation, 
  X,
  Fuel,
  DollarSign,
  Clock,
  Receipt
} from 'lucide-react';

interface RouteMapViewerProps {
  route: {
    origin: string;
    destination: string;
    distance: string;
    duration: string;
    fuelCost: string;
    tollCost: string;
    totalCost: string;
    isRoundTrip: boolean;
    vehicleName: string;
    tollPlazas?: Array<{ name: string; value: number; route: string; concessionaire: string }>;
  };
  onClose: () => void;
}

export function RouteMapViewer({ route, onClose }: RouteMapViewerProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<google.maps.Map | null>(null);
  const directionsRendererRef = React.useRef<google.maps.DirectionsRenderer | null>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(false);

  React.useEffect(() => {
    if (!mapRef.current || isInitializing) return;
    
    setIsInitializing(true);

    // Verificar se a API key está configurada
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Chave da API do Google Maps não configurada');
      return;
    }

    // Carregar Google Maps API
    const loadGoogleMaps = () => {
      // Verificar se já está carregado
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setTimeout(() => initMap(), 100);
        return;
      }

      // Verificar se o script já está sendo carregado
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Aguardar o carregamento
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogle);
            initMap();
          }
        }, 100);
        
        // Timeout após 10 segundos
        setTimeout(() => {
          clearInterval(checkGoogle);
          if (!window.google || !window.google.maps) {
            setError('Timeout ao carregar Google Maps');
          }
        }, 10000);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Aguardar um pouco para garantir que tudo está carregado
        setTimeout(() => initMap(), 100);
      };
      script.onerror = () => setError('Erro ao carregar Google Maps');
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) {
        setIsInitializing(false);
        return;
      }
      
      if (typeof window === 'undefined' || !window.google || !window.google.maps) {
        setError('Google Maps não está disponível');
        setIsInitializing(false);
        return;
      }

      try {
        // Limpar mapa anterior se existir
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setMap(null);
        }

        const map = new google.maps.Map(mapRef.current, {
          zoom: 7,
          center: { lat: -25.4284, lng: -49.2733 }, // Curitiba como centro padrão
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#2563eb',
            strokeWeight: 5,
            strokeOpacity: 0.8,
          },
        });

        directionsRendererRef.current = directionsRenderer;

        // Calcular e exibir rota
        directionsService.route(
          {
            origin: route.origin,
            destination: route.destination,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK' && result) {
              if (directionsRendererRef.current) {
                directionsRendererRef.current.setDirections(result);
                setMapLoaded(true);
              }
            } else {
              setError(`Erro ao calcular rota: ${status}`);
            }
            setIsInitializing(false);
          }
        );
      } catch (err) {
        setError('Erro ao inicializar o mapa');
        console.error('Erro ao inicializar mapa:', err);
        setIsInitializing(false);
      }
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [route.origin, route.destination]);

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Visualização da Rota
            </CardTitle>
            <CardDescription>
              {route.origin} → {route.destination}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Mapa */}
        <div 
          ref={mapRef} 
          className="w-full h-[400px] rounded-lg border-2 border-muted bg-muted"
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
        >
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2 p-4">
                <p className="text-sm text-destructive font-medium">{error}</p>
                <p className="text-xs text-muted-foreground">
                  Verifique se a chave da API do Google Maps está configurada corretamente
                </p>
              </div>
            </div>
          ) : !mapLoaded && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Carregando mapa...</p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Informações da Rota */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{route.vehicleName}</Badge>
            {route.isRoundTrip && (
              <Badge variant="secondary">Ida e Volta</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                <Fuel className="h-3 w-3" />
                Combustível
              </div>
              <p className="font-semibold text-blue-600">R$ {route.fuelCost}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Receipt className="h-3 w-3" />
                Pedágios
              </div>
              <p className="font-semibold text-orange-600">R$ {route.tollCost}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">Custo Total</span>
            </div>
            <p className="text-xl font-bold text-green-600">R$ {route.totalCost}</p>
          </div>

          {route.tollPlazas && route.tollPlazas.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Pedágios na Rota ({route.tollPlazas.length})
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {route.tollPlazas.map((toll, index) => (
                  <div key={index} className="flex justify-between items-start text-xs py-1 px-2 bg-muted rounded">
                    <div className="flex-1">
                      <span className="font-medium">{toll.name}</span>
                      <div className="text-muted-foreground">
                        <span>{toll.route}</span>
                      </div>
                    </div>
                    <span className="font-medium ml-2">
                      R$ {toll.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
