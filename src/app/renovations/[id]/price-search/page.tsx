"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRenovations } from '@/hooks/useRenovations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Loader2, TrendingDown, Star, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { searchPrices, getBrazilianStates, getCitiesByState } from '@/lib/price-search-service';
import type { PriceSearchQuery, PriceSearchResponse } from '@/lib/types';

export default function PriceSearchPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const renovationId = params.id as string;
  
  const { getRenovationById } = useRenovations();
  const renovation = getRenovationById(renovationId);

  const [query, setQuery] = React.useState<PriceSearchQuery>({
    productName: '',
    state: 'SP',
    city: 'São Paulo',
  });

  const [results, setResults] = React.useState<PriceSearchResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [cities, setCities] = React.useState<string[]>([]);

  React.useEffect(() => {
    const newCities = getCitiesByState(query.state);
    setCities(newCities);
    if (newCities.length > 0 && !newCities.includes(query.city)) {
      setQuery(prev => ({ ...prev, city: newCities[0] }));
    }
  }, [query.state]);

  if (!renovation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Reforma não encontrada</h2>
        <Button onClick={() => router.push('/renovations')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Reformas
        </Button>
      </div>
    );
  }

  const handleSearch = async () => {
    if (!query.productName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Digite o nome do produto para pesquisar',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await searchPrices(query);
      setResults(response);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro na pesquisa',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'premium':
        return 'Premium';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return quality;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/renovations/${renovationId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Pesquisa de Preços</h1>
          <p className="text-muted-foreground">{renovation.name}</p>
        </div>
      </div>

      {/* Formulário de Pesquisa */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Preços de Produtos</CardTitle>
          <CardDescription>
            Pesquise preços de produtos no mercado atual com suporte a IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Nome do Produto *</Label>
            <Input
              id="product"
              placeholder="Ex: Cimento, Tinta, Piso, Telha..."
              value={query.productName}
              onChange={(e) => setQuery({ ...query, productName: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select
                value={query.state}
                onValueChange={(value) => setQuery({ ...query, state: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getBrazilianStates().map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Select
                value={query.city}
                onValueChange={(value) => setQuery({ ...query, city: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Preço Mínimo (opcional)</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0.00"
                value={query.minPrice || ''}
                onChange={(e) => setQuery({ ...query, minPrice: parseFloat(e.target.value) || undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice">Preço Máximo (opcional)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="0.00"
                value={query.maxPrice || ''}
                onChange={(e) => setQuery({ ...query, maxPrice: parseFloat(e.target.value) || undefined })}
              />
            </div>
          </div>

          <Button onClick={handleSearch} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Pesquisando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Pesquisar Preços
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results && (
        <>
          {/* Insights de IA */}
          {results.aiInsights && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Insights com IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{results.aiInsights}</p>
              </CardContent>
            </Card>
          )}

          {/* Estatísticas */}
          {results.totalResults > 0 && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.totalResults}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {results.averagePrice.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Menor Preço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {results.lowestPrice.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Maior Preço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {results.highestPrice.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Encontrados</CardTitle>
              <CardDescription>
                {results.totalResults === 0 
                  ? 'Nenhum produto encontrado com os critérios especificados'
                  : `${results.totalResults} produto(s) encontrado(s)`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.totalResults === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Tente expandir sua busca ou alterar os filtros</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.results.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <Package className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{product.brand} - {product.model}</h4>
                          <Badge className={getQualityColor(product.quality)}>
                            {getQualityLabel(product.quality)}
                          </Badge>
                          {product.inStock && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Em Estoque
                            </Badge>
                          )}
                        </div>

                        <div className="grid gap-2 text-sm mb-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fornecedor:</span>
                            <span className="font-medium">{product.supplier}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Localização:</span>
                            <span className="font-medium">{product.location.city}, {product.location.state}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Garantia:</span>
                            <span className="font-medium">{product.warranty}</span>
                          </div>
                          {product.rating && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avaliação:</span>
                              <span className="font-medium flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {product.rating}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-lg font-bold text-green-600">
                          R$ {product.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
