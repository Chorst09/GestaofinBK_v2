// Serviço de cálculo de pedágios baseado em concessionárias reais

interface TollPlaza {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  highway: string;
  concessionaire: string;
  values: {
    car: number;
    motorcycle?: number;
    truck?: number;
  };
  km: number; // Quilômetro da rodovia
}

interface TollResult {
  total: number;
  plazas: Array<{
    name: string;
    value: number;
    route: string;
    concessionaire: string;
  }>;
}

// Base de dados de pedágios das principais concessionárias
const TOLL_PLAZAS: TollPlaza[] = [
  // VIA ARAUCÁRIA (PR)
  {
    name: "Pedágio Araucária",
    location: { lat: -25.5934, lng: -49.4093 },
    highway: "BR-476",
    concessionaire: "Via Araucária",
    values: { car: 8.90 },
    km: 20
  },
  {
    name: "Pedágio Contenda",
    location: { lat: -25.6789, lng: -49.5321 },
    highway: "BR-476",
    concessionaire: "Via Araucária",
    values: { car: 8.90 },
    km: 45
  },
  
  // EPR IGUAÇU (PR)
  {
    name: "Pedágio Balsa Nova",
    location: { lat: -25.5789, lng: -49.6321 },
    highway: "BR-277",
    concessionaire: "EPR Iguaçu",
    values: { car: 9.20 },
    km: 42
  },
  {
    name: "Pedágio São Luiz do Purunã",
    location: { lat: -25.4123, lng: -49.7654 },
    highway: "BR-277",
    concessionaire: "EPR Iguaçu",
    values: { car: 9.20 },
    km: 68
  },
  {
    name: "Pedágio Palmeira",
    location: { lat: -25.4289, lng: -50.0123 },
    highway: "BR-277",
    concessionaire: "EPR Iguaçu",
    values: { car: 9.20 },
    km: 98
  },
  
  // ECOVIA (PR)
  {
    name: "Pedágio Ponta Grossa",
    location: { lat: -25.0945, lng: -50.1618 },
    highway: "BR-376",
    concessionaire: "Ecovia",
    values: { car: 10.50 },
    km: 15
  },
  {
    name: "Pedágio São José dos Pinhais",
    location: { lat: -25.5345, lng: -49.2067 },
    highway: "BR-376",
    concessionaire: "Ecovia",
    values: { car: 10.50 },
    km: 45
  },
  
  // ECOCATARATAS (PR)
  {
    name: "Pedágio Céu Azul",
    location: { lat: -25.1456, lng: -53.8456 },
    highway: "BR-277",
    concessionaire: "Ecocataratas",
    values: { car: 8.70 },
    km: 580
  },
  {
    name: "Pedágio Cascavel",
    location: { lat: -24.9556, lng: -53.4556 },
    highway: "BR-277",
    concessionaire: "Ecocataratas",
    values: { car: 8.70 },
    km: 490
  },
  
  // CCR RODONORTE (PR)
  {
    name: "Pedágio Jataizinho",
    location: { lat: -23.2567, lng: -51.1923 },
    highway: "BR-369",
    concessionaire: "CCR RodoNorte",
    values: { car: 9.80 },
    km: 35
  },
  {
    name: "Pedágio Arapongas",
    location: { lat: -23.4189, lng: -51.4256 },
    highway: "BR-369",
    concessionaire: "CCR RodoNorte",
    values: { car: 9.80 },
    km: 65
  },
  
  // CCR VIAOESTE (SP)
  {
    name: "Pedágio Araçariguama",
    location: { lat: -23.4378, lng: -47.0611 },
    highway: "SP-280",
    concessionaire: "CCR ViaOeste",
    values: { car: 7.90 },
    km: 45
  },
  {
    name: "Pedágio Mairinque",
    location: { lat: -23.5456, lng: -47.1834 },
    highway: "SP-280",
    concessionaire: "CCR ViaOeste",
    values: { car: 7.90 },
    km: 60
  },
  
  // CCR AUTOBAN (SP)
  {
    name: "Pedágio Jundiaí",
    location: { lat: -23.1858, lng: -46.8978 },
    highway: "SP-348",
    concessionaire: "CCR AutoBAn",
    values: { car: 8.40 },
    km: 55
  },
  {
    name: "Pedágio Campo Limpo Paulista",
    location: { lat: -23.2067, lng: -46.7856 },
    highway: "SP-348",
    concessionaire: "CCR AutoBAn",
    values: { car: 8.40 },
    km: 70
  },
  
  // CCR NOVADUTRA (SP/RJ)
  {
    name: "Pedágio Arujá",
    location: { lat: -23.3967, lng: -46.3211 },
    highway: "BR-116",
    concessionaire: "CCR NovaDutra",
    values: { car: 9.10 },
    km: 35
  },
  {
    name: "Pedágio Guararema",
    location: { lat: -23.4089, lng: -46.0345 },
    highway: "BR-116",
    concessionaire: "CCR NovaDutra",
    values: { car: 9.10 },
    km: 75
  },
  {
    name: "Pedágio Jacareí",
    location: { lat: -23.2945, lng: -45.9656 },
    highway: "BR-116",
    concessionaire: "CCR NovaDutra",
    values: { car: 9.10 },
    km: 95
  },
  {
    name: "Pedágio Moreira César",
    location: { lat: -23.1234, lng: -45.8234 },
    highway: "BR-116",
    concessionaire: "CCR NovaDutra",
    values: { car: 9.10 },
    km: 125
  },
  {
    name: "Pedágio Queluz",
    location: { lat: -22.5345, lng: -44.7789 },
    highway: "BR-116",
    concessionaire: "CCR NovaDutra",
    values: { car: 9.10 },
    km: 215
  },
  
  // ECOVIAS (SP)
  {
    name: "Pedágio Riacho Grande",
    location: { lat: -23.8234, lng: -46.5123 },
    highway: "SP-160",
    concessionaire: "Ecovias",
    values: { car: 7.20 },
    km: 42
  },
  {
    name: "Pedágio Piassaguera",
    location: { lat: -23.8567, lng: -46.4089 },
    highway: "SP-160",
    concessionaire: "Ecovias",
    values: { car: 7.20 },
    km: 52
  },
  
  // CCR VIARIO (RJ)
  {
    name: "Pedágio Itaboraí",
    location: { lat: -22.7445, lng: -42.8589 },
    highway: "BR-101",
    concessionaire: "CCR ViaRio",
    values: { car: 8.50 },
    km: 35
  },
  {
    name: "Pedágio Rio Bonito",
    location: { lat: -22.7123, lng: -42.6234 },
    highway: "BR-101",
    concessionaire: "CCR ViaRio",
    values: { car: 8.50 },
    km: 55
  },
  
  // CONCER (RJ)
  {
    name: "Pedágio Itatiaia",
    location: { lat: -22.4889, lng: -44.5567 },
    highway: "BR-116",
    concessionaire: "Concer",
    values: { car: 8.80 },
    km: 315
  },
  {
    name: "Pedágio Seropédica",
    location: { lat: -22.7456, lng: -43.7089 },
    highway: "BR-116",
    concessionaire: "Concer",
    values: { car: 8.80 },
    km: 45
  },
  
  // ARTERIS (Diversas)
  {
    name: "Pedágio Registro",
    location: { lat: -24.4889, lng: -47.8456 },
    highway: "BR-116",
    concessionaire: "Arteris Régis Bittencourt",
    values: { car: 9.50 },
    km: 445
  },
  {
    name: "Pedágio Miracatu",
    location: { lat: -24.2789, lng: -47.4623 },
    highway: "BR-116",
    concessionaire: "Arteris Régis Bittencourt",
    values: { car: 9.50 },
    km: 390
  },
  {
    name: "Pedágio Juquitiba",
    location: { lat: -23.9278, lng: -47.0645 },
    highway: "BR-116",
    concessionaire: "Arteris Régis Bittencourt",
    values: { car: 9.50 },
    km: 315
  },
];

/**
 * Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verifica se um ponto está próximo de uma linha (rota)
 */
function isPointNearRoute(
  point: { lat: number; lng: number },
  routePoints: Array<{ lat: number; lng: number }>,
  threshold: number = 5 // km
): boolean {
  for (let i = 0; i < routePoints.length - 1; i++) {
    const start = routePoints[i];
    const end = routePoints[i + 1];
    
    // Calcular distância do ponto ao segmento da rota
    const distToStart = calculateDistance(point.lat, point.lng, start.lat, start.lng);
    const distToEnd = calculateDistance(point.lat, point.lng, end.lat, end.lng);
    const segmentLength = calculateDistance(start.lat, start.lng, end.lat, end.lng);
    
    // Se o ponto está próximo do início ou fim do segmento
    if (distToStart < threshold || distToEnd < threshold) {
      return true;
    }
    
    // Verificar se está próximo do segmento
    if (distToStart + distToEnd < segmentLength + threshold) {
      return true;
    }
  }
  return false;
}

/**
 * Extrai pontos da rota do Google Maps
 */
function extractRoutePoints(route: google.maps.DirectionsRoute): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  
  route.legs.forEach(leg => {
    leg.steps.forEach(step => {
      points.push({
        lat: step.start_location.lat(),
        lng: step.start_location.lng()
      });
      points.push({
        lat: step.end_location.lat(),
        lng: step.end_location.lng()
      });
    });
  });
  
  return points;
}

/**
 * Calcula os pedágios baseado na rota traçada pelo Google Maps
 */
export function calculateTollsFromRoute(
  route: google.maps.DirectionsRoute,
  vehicleType: 'car' | 'motorcycle' | 'truck' = 'car'
): TollResult {
  const routePoints = extractRoutePoints(route);
  const foundTolls: Array<{
    name: string;
    value: number;
    route: string;
    concessionaire: string;
  }> = [];
  
  // Verificar cada pedágio cadastrado
  TOLL_PLAZAS.forEach(toll => {
    if (isPointNearRoute(toll.location, routePoints, 8)) {
      const value = toll.values[vehicleType] || toll.values.car;
      foundTolls.push({
        name: toll.name,
        value: value,
        route: toll.highway,
        concessionaire: toll.concessionaire
      });
    }
  });
  
  // Ordenar por ordem de aparição na rota (aproximado)
  // Calcular distância do início da rota para cada pedágio
  const origin = routePoints[0];
  foundTolls.sort((a, b) => {
    const tollA = TOLL_PLAZAS.find(t => t.name === a.name);
    const tollB = TOLL_PLAZAS.find(t => t.name === b.name);
    if (!tollA || !tollB) return 0;
    
    const distA = calculateDistance(origin.lat, origin.lng, tollA.location.lat, tollA.location.lng);
    const distB = calculateDistance(origin.lat, origin.lng, tollB.location.lat, tollB.location.lng);
    return distA - distB;
  });
  
  const total = foundTolls.reduce((sum, toll) => sum + toll.value, 0);
  
  return {
    total,
    plazas: foundTolls
  };
}

/**
 * Estimativa de pedágios quando não há rota traçada
 */
export function estimateTolls(distanceKm: number): TollResult {
  // Estimativa genérica: 1 pedágio a cada 100km
  const numTolls = Math.floor(distanceKm / 100);
  const avgTollValue = 9.00;
  
  const plazas = Array.from({ length: numTolls }, (_, i) => ({
    name: `Pedágio ${i + 1}`,
    value: avgTollValue,
    route: 'Estimativa',
    concessionaire: 'Estimativa'
  }));
  
  return {
    total: numTolls * avgTollValue,
    plazas
  };
}
