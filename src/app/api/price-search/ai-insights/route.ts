import { NextRequest, NextResponse } from 'next/server';
import type { PriceSearchQuery, PriceSearchResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { query, results, averagePrice, lowestPrice, highestPrice } = await request.json();

    if (!results || results.length === 0) {
      return NextResponse.json({
        insights: `Nenhum produto encontrado para "${query.productName}" em ${query.city}, ${query.state}.`,
      });
    }

    // Tentar usar OpenAI se a chave estiver disponível
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const insights = await generateAIInsightsWithOpenAI(
          query,
          results,
          averagePrice,
          lowestPrice,
          highestPrice,
          apiKey
        );
        return NextResponse.json({ insights });
      } catch (error) {
        console.error('Erro ao usar OpenAI:', error);
        // Continuar com fallback local
      }
    }

    // Fallback para insights locais
    const insights = generateLocalInsights(query, results, averagePrice, lowestPrice, highestPrice);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Erro ao gerar insights:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar insights' },
      { status: 500 }
    );
  }
}

async function generateAIInsightsWithOpenAI(
  query: PriceSearchQuery,
  results: PriceSearchResult[],
  averagePrice: number,
  lowestPrice: number,
  highestPrice: number,
  apiKey: string
): Promise<string> {
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
          content: 'Você é um assistente especializado em análise de preços de materiais de construção. Forneça recomendações práticas e diretas em português.',
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
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Resposta vazia da OpenAI');
  }

  return content;
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
  const economyOption = results
    .filter(r => r.quality === 'low' || r.quality === 'medium')
    .sort((a, b) => a.price - b.price)[0];

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
