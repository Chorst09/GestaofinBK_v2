"use client";

import type { PriceSearchQuery, PriceSearchResponse, PriceSearchResult } from './types';

// Mock data para demonstração - em produção, isso viria de APIs reais
const mockPriceDatabase: PriceSearchResult[] = [
  {
    id: '1',
    productName: 'Cimento Portland',
    brand: 'Itaú',
    model: 'CP II-Z-32',
    price: 35.50,
    quality: 'high',
    warranty: '12 meses',
    supplier: 'Materiais de Construção Silva',
    location: { state: 'SP', city: 'São Paulo' },
    lastUpdated: new Date().toISOString(),
    rating: 4.5,
    inStock: true,
  },
  {
    id: '2',
    productName: 'Cimento Portland',
    brand: 'Votorantim',
    model: 'CP II-Z-32',
    price: 32.00,
    quality: 'medium',
    warranty: '12 meses',
    supplier: 'Construção Rápida',
    location: { state: 'SP', city: 'São Paulo' },
    lastUpdated: new Date().toISOString(),
    rating: 4.0,
    inStock: true,
  },
  {
    id: '3',
    productName: 'Tinta Acrílica',
    brand: 'Suvinil',
    model: 'Premium',
    price: 85.00,
    quality: 'high',
    warranty: '24 meses',
    supplier: 'Tintas e Acabamentos',
    location: { state: 'SP', city: 'São Paulo' },
    lastUpdated: new Date().toISOString(),
    rating: 4.8,
    inStock: true,
  },
  {
    id: '4',
    productName: 'Tinta Acrílica',
    brand: 'Coral',
    model: 'Standard',
    price: 65.00,
    quality: 'medium',
    warranty: '12 meses',
    supplier: 'Loja de Tintas Central',
    location: { state: 'SP', city: 'São Paulo' },
    lastUpdated: new Date().toISOString(),
    rating: 4.2,
    inStock: true,
  },
];

/**
 * Pesquisa preços de produtos com base em critérios
 * Em produção, isso faria chamadas a APIs reais como:
 * - Mercado Livre API
 * - OLX API
 * - APIs de lojas de construção
 */
export async function searchPrices(query: PriceSearchQuery): Promise<PriceSearchResponse> {
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Filtrar resultados baseado na query
    let results = mockPriceDatabase.filter(item => {
      const matchesProduct = item.productName.toLowerCase().includes(query.productName.toLowerCase());
      const matchesLocation = 
        item.location.state.toLowerCase() === query.state.toLowerCase() &&
        item.location.city.toLowerCase() === query.city.toLowerCase();
      const matchesPrice = 
        (!query.minPrice || item.price >= query.minPrice) &&
        (!query.maxPrice || item.price <= query.maxPrice);
      const matchesQuality = !query.quality || item.quality === query.quality;

      return matchesProduct && matchesLocation && matchesPrice && matchesQuality;
    });

    // Se não encontrar resultados, retornar dados de outras cidades como alternativa
    if (results.length === 0) {
      results = mockPriceDatabase.filter(item => 
        item.productName.toLowerCase().includes(query.productName.toLowerCase())
      );
    }

    // Calcular estatísticas
    const prices = results.map(r => r.price);
    const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Gerar insights com IA (simulado)
    const aiInsights = generateAIInsights(query, results, averagePrice);

    return {
      query,
      results,
      totalResults: results.length,
      averagePrice,
      lowestPrice,
      highestPrice,
      aiInsights,
    };
  } catch (error) {
    console.error('Erro ao pesquisar preços:', error);
    throw new Error('Falha ao pesquisar preços. Tente novamente.');
  }
}

/**
 * Gera insights usando IA (Claude/OpenAI)
 * Em produção, isso faria uma chamada real à API de IA
 */
function generateAIInsights(
  query: PriceSearchQuery,
  results: PriceSearchResult[],
  averagePrice: number
): string {
  if (results.length === 0) {
    return `Nenhum produto encontrado para "${query.productName}" em ${query.city}, ${query.state}. Tente expandir sua busca ou verificar a disponibilidade em outras cidades.`;
  }

  const bestQuality = results.filter(r => r.quality === 'premium' || r.quality === 'high');
  const bestPrice = results.reduce((min, r) => r.price < min.price ? r : min);
  const bestRating = results.reduce((max, r) => (r.rating || 0) > (max.rating || 0) ? r : max);

  let insight = `Encontrados ${results.length} produtos para "${query.productName}" em ${query.city}, ${query.state}. `;
  insight += `Preço médio: R$ ${averagePrice.toFixed(2)}. `;

  if (bestPrice) {
    insight += `Melhor preço: R$ ${bestPrice.price.toFixed(2)} (${bestPrice.brand}). `;
  }

  if (bestQuality.length > 0) {
    insight += `Produtos premium disponíveis: ${bestQuality.map(p => p.brand).join(', ')}. `;
  }

  if (bestRating && bestRating.rating) {
    insight += `Melhor avaliação: ${bestRating.brand} com ${bestRating.rating} estrelas.`;
  }

  return insight;
}

/**
 * Obtém lista de estados brasileiros
 */
export function getBrazilianStates(): string[] {
  return [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
}

/**
 * Obtém lista de cidades por estado (simulado)
 */
export function getCitiesByState(state: string): string[] {
  const citiesByState: Record<string, string[]> = {
    'SP': ['São Paulo', 'Campinas', 'Santos', 'Sorocaba', 'Ribeirão Preto'],
    'RJ': ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas'],
    'PR': ['Curitiba', 'Londrina', 'Maringá'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda'],
    'CE': ['Fortaleza', 'Caucaia', 'Maracanaú'],
    'PA': ['Belém', 'Ananindeua', 'Santarém'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau'],
  };

  return citiesByState[state] || [];
}
