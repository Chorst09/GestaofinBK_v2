"use client";

import * as React from 'react';

interface GoogleMapWrapperProps {
  origin: string;
  destination: string;
  tollPlazas?: Array<{ name: string; value: number; route: string; concessionaire: string }>;
  onLoad: () => void;
  onError: (error: string) => void;
}

export function GoogleMapWrapper({ origin, destination, tollPlazas, onLoad, onError }: GoogleMapWrapperProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);
  const directionsRendererRef = React.useRef<google.maps.DirectionsRenderer | null>(null);
  const tollMarkersRef = React.useRef<google.maps.Marker[]>([]);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;

    const initializeMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        // Aguardar Google Maps estar disponível
        if (!window.google || !window.google.maps) {
          await loadGoogleMapsScript();
        }

        if (!isMountedRef.current || !mapContainerRef.current) return;

        // Criar mapa
        const map = new google.maps.Map(mapContainerRef.current, {
          zoom: 7,
          center: { lat: -25.4284, lng: -49.2733 },
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          disableDefaultUI: false,
        });

        mapRef.current = map;

        // Criar renderer
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

        // Calcular rota
        const directionsService = new google.maps.DirectionsService();
        
        directionsService.route(
          {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          async (result, status) => {
            if (!isMountedRef.current) return;

            if (status === 'OK' && result) {
              if (directionsRendererRef.current) {
                directionsRendererRef.current.setDirections(result);
                
                // Adicionar marcadores de pedágios
                if (tollPlazas && tollPlazas.length > 0 && mapRef.current) {
                  await addTollMarkers(tollPlazas, mapRef.current);
                }
                
                onLoad();
              }
            } else {
              onError(`Erro ao calcular rota: ${status}`);
            }
          }
        );
      } catch (error) {
        if (isMountedRef.current) {
          onError('Erro ao inicializar mapa');
          console.error('Map initialization error:', error);
        }
      }
    };

    initializeMap();

    // Função para adicionar marcadores de pedágios
    const addTollMarkers = async (tolls: Array<{ name: string; value: number; route: string; concessionaire: string }>, map: google.maps.Map) => {
      // Limpar marcadores anteriores
      tollMarkersRef.current.forEach(marker => {
        try {
          marker.setMap(null);
        } catch (e) {
          console.error('Error removing marker:', e);
        }
      });
      tollMarkersRef.current = [];

      const geocoder = new google.maps.Geocoder();
      const bounds = new google.maps.LatLngBounds();

      for (const toll of tolls) {
        try {
          // Tentar geocodificar o nome do pedágio
          const searchQuery = `${toll.name}, ${toll.route}, Brasil`;
          
          const result = await new Promise<google.maps.GeocoderResult | null>((resolve) => {
            geocoder.geocode({ address: searchQuery }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                resolve(results[0]);
              } else {
                resolve(null);
              }
            });
          });

          if (result && isMountedRef.current) {
            const marker = new google.maps.Marker({
              position: result.geometry.location,
              map: map,
              title: toll.name,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#f97316',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            });

            // Info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #f97316;">${toll.name}</h3>
                  <p style="margin: 4px 0; font-size: 13px;"><strong>Rodovia:</strong> ${toll.route}</p>
                  <p style="margin: 4px 0; font-size: 13px;"><strong>Concessionária:</strong> ${toll.concessionaire}</p>
                  <p style="margin: 4px 0; font-size: 14px; font-weight: bold; color: #f97316;">R$ ${toll.value.toFixed(2)}</p>
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });

            tollMarkersRef.current.push(marker);
            bounds.extend(result.geometry.location);
          }
        } catch (error) {
          console.error(`Error adding marker for ${toll.name}:`, error);
        }
      }
    };

    initializeMap();

    return () => {
      isMountedRef.current = false;
      
      // Cleanup toll markers
      tollMarkersRef.current.forEach(marker => {
        try {
          marker.setMap(null);
        } catch (e) {
          console.error('Error cleaning up marker:', e);
        }
      });
      tollMarkersRef.current = [];
      
      // Cleanup directions renderer
      if (directionsRendererRef.current) {
        try {
          directionsRendererRef.current.setMap(null);
        } catch (e) {
          console.error('Error cleaning up directions renderer:', e);
        }
        directionsRendererRef.current = null;
      }

      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, [origin, destination, tollPlazas, onLoad, onError]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      data-1p-ignore
      data-lpignore="true"
      data-form-type="other"
      style={{ minHeight: '400px' }}
    />
  );
}

async function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    const script = document.createElement('script');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}
