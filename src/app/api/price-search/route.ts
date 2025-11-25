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

async function generateAIInsights(
  query: PriceSearchQuery,
  results: PriceSearchResult[],
  averagePrice: number,
  lowestPrice: number,
  highestPrice: number
): Promise<string> {
  if (results.length === 0) {
    return `Nenhum produto encontrado para "${query.productName}" em ${query.city}, ${query.state}. Tente expandir sua busca ou verificar a disponibilidade em outras cidades.`;
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return generateLocalInsights(query, results, averagePrice, lowestPrice, highestPrice);
    }

    const productSummary = results
      .slice(0, 5)
      .map(p => `${p.brand} ${p.model}: R$ ${p.price.toFixed(2)} (${p.quality}, ${p.rating} ⭐)`)
      .join('\n');

    const prompt = `Você é um especialista em compras de materiais de construção. Analise os seguintes dados de preços e forneça uma recomendação concisa e prática em português:

Produto procurado: ${query.productName}
Localização: ${query.city}, ${query.state}
Preço médio: R$ ${averagePrice.toFixed(2)}
Preço mínimo: R$ ${lowestPrice.toFixed(2)}
Preço máximo: R$ ${highestPrice.toFixed(2)}
Total de opções: ${results.length}

Produtos encontrados:
${productSummary}

Forneça uma análise breve (máximo 3 linhas) com:
1. Melhor custo-benefício
2. Dica de economia
3. Recomendação de qualidade vs preço`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em análise de preços de materiais de construção. Forneça recomendações práticas e diretas.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return generateLocalInsights(query, results, averagePrice, lowestPrice, highestPrice);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || generateLocalInsights(query, results, averagePrice, lowestPrice, highestPrice);
  } catch (error) {
    console.error('Erro ao gerar insights com IA:', error);
    return generateLocalInsights(query, results, averagePrice, lowestPrice, highestPrice);
  }
}

function generateLocalInsights(
  query: PriceSearchQuery,
  results: PriceSearchResult[],
  averagePrice: number,
  lowestPrice: number,
  highestPrice: number
): string {
  const bestQuality = results.filter(r => r.quality === 'premium' || r.quality === 'high');
  const bestPrice = results.reduce((min, r) => r.price < min.price ? r : min);
  const bestRating = results.reduce((max, r) => (r.rating || 0) > (max.rating || 0) ? r : max);
  const economyOption = results.filter(r => r.quality === 'low' || r.quality === 'medium').sort((a, b) => a.price - b.price)[0];

  let insight = `📊 Encontrados ${results.length} produtos. `;
  
  if (bestPrice && economyOption) {
    const savings = ((bestPrice.price - economyOption.price) / bestPrice.price * 100).toFixed(0);
    insight += `💰 Economize até ${savings}% escolhendo ${economyOption.brand}. `;
  }

  if (bestRating && bestRating.rating) {
    insight += `⭐ Melhor avaliação: ${bestRating.brand} (${bestRating.rating} estrelas). `;
  }

  if (bestQuality.length > 0) {
    insight += `✨ Opções premium: ${bestQuality.map(p => p.brand).slice(0, 2).join(', ')}.`;
  }

  return insight;
}

export async function POST(request: NextRequest) {
  try {
    const query: PriceSearchQuery = await request.json();

    // Validar query
    if (!query.productName || !query.state || !query.city) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    // Filtrar resultados
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

    // Se não encontrar, buscar em outras cidades
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

    // Gerar insights com IA
    const aiInsights = await generateAIInsights(query, results, averagePrice, lowestPrice, highestPrice);

    const response: PriceSearchResponse = {
      query,
      results,
      totalResults: results.length,
      averagePrice,
      lowestPrice,
      highestPrice,
      aiInsights,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro na pesquisa de preços:', error);
    return NextResponse.json(
      { error: 'Erro ao pesquisar preços' },
      { status: 500 }
    );
  }
}
