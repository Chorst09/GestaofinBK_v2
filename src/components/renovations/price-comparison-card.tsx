"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingDown, TrendingUp, DollarSign, Award } from 'lucide-react';
import type { SupplierQuote } from '@/lib/types';
import { comparePriceQuotes } from '@/lib/renovation-helpers';

interface PriceComparisonCardProps {
  materialName: string;
  quantity: number;
  unit: string;
  quotes: SupplierQuote[];
  onSelectQuote?: (quote: SupplierQuote) => void;
  selectedQuoteId?: string;
}

export function PriceComparisonCard({
  materialName,
  quantity,
  unit,
  quotes,
  onSelectQuote,
  selectedQuoteId,
}: PriceComparisonCardProps) {
  if (quotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{materialName}</CardTitle>
          <CardDescription>Nenhuma cotação cadastrada</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const comparison = comparePriceQuotes(quotes);
  const { bestQuote, worstQuote, averagePrice, savings } = comparison;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{materialName}</CardTitle>
            <CardDescription>
              {quantity} {unit} • {quotes.length} {quotes.length === 1 ? 'cotação' : 'cotações'}
            </CardDescription>
          </div>
          {savings > 0 && (
            <Badge variant="default" className="bg-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              Economize R$ {savings.toFixed(2)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted rounded-lg text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Melhor Preço</div>
            <div className="font-semibold text-green-600">
              R$ {bestQuote?.totalPrice.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Preço Médio</div>
            <div className="font-semibold">R$ {averagePrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Pior Preço</div>
            <div className="font-semibold text-red-600">
              R$ {worstQuote?.totalPrice.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Lista de Cotações */}
        <div className="space-y-2">
          {quotes
            .sort((a, b) => a.totalPrice - b.totalPrice)
            .map((quote, index) => {
              const isBest = quote.supplierId === bestQuote?.supplierId;
              const isWorst = quote.supplierId === worstQuote?.supplierId;
              const isSelected = quote.supplierId === selectedQuoteId;
              const diffFromBest = quote.totalPrice - (bestQuote?.totalPrice || 0);
              const diffPercent = bestQuote
                ? ((diffFromBest / bestQuote.totalPrice) * 100)
                : 0;

              return (
                <div
                  key={quote.supplierId}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : isBest
                      ? 'border-green-200 bg-green-50 dark:bg-green-950'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{quote.supplierName}</span>
                        {isBest && (
                          <Badge variant="default" className="bg-green-600 text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Melhor
                          </Badge>
                        )}
                        {isSelected && (
                          <Badge variant="default" className="text-xs">
                            Selecionado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Unitário:</span>
                          <span className="ml-1 font-medium">
                            R$ {quote.unitPrice.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <span className="ml-1 font-semibold">
                            R$ {quote.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {!isBest && diffFromBest > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                          <TrendingUp className="h-3 w-3" />
                          <span>
                            R$ {diffFromBest.toFixed(2)} mais caro ({diffPercent.toFixed(1)}%)
                          </span>
                        </div>
                      )}

                      {quote.notes && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {quote.notes}
                        </div>
                      )}

                      <div className="mt-1 text-xs text-muted-foreground">
                        Cotado em {new Date(quote.quotedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    {onSelectQuote && !isSelected && (
                      <Button
                        size="sm"
                        variant={isBest ? 'default' : 'outline'}
                        onClick={() => onSelectQuote(quote)}
                        className="ml-2"
                      >
                        Selecionar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Análise */}
        {quotes.length >= 2 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  Análise de Economia
                </div>
                <div className="text-blue-700 dark:text-blue-300 mt-1">
                  Escolhendo o melhor fornecedor, você economiza{' '}
                  <span className="font-semibold">R$ {savings.toFixed(2)}</span>
                  {worstQuote && bestQuote && (
                    <span>
                      {' '}({((savings / worstQuote.totalPrice) * 100).toFixed(1)}% de desconto)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
