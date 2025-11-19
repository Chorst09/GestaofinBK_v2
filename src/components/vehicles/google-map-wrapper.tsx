"use client";

import * as React from 'react';

interface GoogleMapWrapperProps {
  origin: string;
  destination: string;
  onLoad: () => void;
  onError: (error: string) => void;
}

export function GoogleMapWrapper({ origin, destination, onLoad, onError }: GoogleMapWrapperProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);
  const directionsRendererRef = React.useRef<google.maps.DirectionsRenderer | null>(null);
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
          (result, status) => {
            if (!isMountedRef.current) return;

            if (status === 'OK' && result) {
              if (directionsRendererRef.current) {
                directionsRendererRef.current.setDirections(result);
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

    return () => {
      isMountedRef.current = false;
      
      // Cleanup
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
  }, [origin, destination, onLoad, onError]);

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
