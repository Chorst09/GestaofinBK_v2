import { NextRequest, NextResponse } from 'next/server';
import type { PriceSearchQuery, PriceSearchResponse, PriceSearchResult } from '@/lib/types';

// Mock data para demonstração
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
  {
    id: '5',
    productName: 'Piso Cerâmico',
    brand: 'Portinari',
    model: 'Retificado 60x60',
    price: 120.00,
    quality: 'high',
    warranty: '24 meses',
    supplier: 'Cerâmica Premium',
    location: { state: 'SP', city: 'São Paulo' },
    lastUpdated: new Date().toISOString(),
    rating: 4.7,
    inStock: true,
  },
  {
    id: '6',
    productName: 'Piso Cerâmico',
    brand: 'Brasital',
    model: 'Simples 45x45',
    price: 45.00,
    quality: 'low',
    warranty: '12 meses',
    supplier: 'Materiais Econômicos',
    location: { state: 'SP', city: 'São Paulo' },
    lastUpdated: new Date().toISOString(),
    rating: 3.5,
    inStock: true,
  },
  {
    id: '7',
    productName: 'Telha Cerâmica',
    brand: 'Brasital',
    model: 'Francesa',
    price: 2.50,
    quality: 'medium',
    warranty: '10 anos',
    supplier: 'Telhas Brasil',
    location: { state: 'SP', city: 'São Paulo' },
    lastUpdated: new Date().toISOString(),
    rating: 4.1,
    inStock: true,
  },
  {
    id: '8',
    productName: 'Telha Cerâmica',
    brand: 'Imiporcelana',
    model: 'Portuguesa',
    price: 3.20,
    quality: 'high',
    warranty: '15 anos',
    supplier: 'Cerâmica Premium',
    location: { state: 'SP', city: 'São Paulo' },
    lastUpdated: new Date().toISOString(),
    rating: 4.6,
    inStock: true,
  },
];

export async function POST(request: NextRequest) {
  try {
    const query: PriceSearchQuery = await request.json();

    console.log('[Web Search] Pesquisando produtos:', query.productName);

    if (!query.productName || !query.state || !query.city) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

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

    if (results.length === 0) {
      console.log('[Web Search] Nenhum resultado na cidade, buscando em outras cidades...');
      results = mockPriceDatabase.filter(item => 
        item.productName.toLowerCase().includes(query.productName.toLowerCase())
      );
    }

    const prices = results.map(r => r.price);
    const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;

    console.log('[Web Search] Encontrados', results.length, 'produtos');

    const response: PriceSearchResponse = {
      query,
      results,
      totalResults: results.length,
      averagePrice,
      lowestPrice,
      highestPrice,
      aiInsights: '',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Web Search] Erro na pesquisa:', error);
    return NextResponse.json(
      { error: 'Erro ao pesquisar preços' },
      { status: 500 }
    );
  }
}
