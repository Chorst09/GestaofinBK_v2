"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    ComposedChart,
    Bar
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    AlertCircle,
    CheckCircle,
    ArrowUp,
    ArrowDown,
    Minus
} from 'lucide-react';

interface TrendData {
    month: string;
    alimentacao: number;
    transporte: number;
    moradia: number;
    lazer: number;
    outros: number;
    total: number;
}

interface CategoryTrend {
    category: string;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
    avgValue: number;
    color: string;
    icon: React.ElementType;
}

interface TrendsAnalysisProps {
    data?: TrendData[];
    period?: '6m' | '12m' | '24m';
}

export function TrendsAnalysis({
    data = [],
    period = '6m'
}: TrendsAnalysisProps) {
    const [selectedPeriod, setSelectedPeriod] = React.useState(period);
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

    // Dados de exemplo
    const defaultData: TrendData[] = [
        { month: 'Jul', alimentacao: 800, transporte: 600, moradia: 1200, lazer: 400, outros: 200, total: 3200 },
        { month: 'Ago', alimentacao: 850, transporte: 580, moradia: 1200, lazer: 450, outros: 220, total: 3300 },
        { month: 'Set', alimentacao: 780, transporte: 620, moradia: 1200, lazer: 380, outros: 180, total: 3160 },
        { month: 'Out', alimentacao: 900, transporte: 650, moradia: 1250, lazer: 500, outros: 250, total: 3550 },
        { month: 'Nov', alimentacao: 820, transporte: 600, moradia: 1200, lazer: 420, outros: 200, total: 3240 },
        { month: 'Dez', alimentacao: 950, transporte: 700, moradia: 1200, lazer: 600, outros: 300, total: 3750 },
    ];

    const trendData = data.length > 0 ? data : defaultData;

    // Análise de tendências por categoria
    const categoryTrends: CategoryTrend[] = React.useMemo(() => {
        const categories = ['alimentacao', 'transporte', 'moradia', 'lazer', 'outros'];
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

        return categories.map((category, index) => {
            const values = trendData.map(d => d[category as keyof TrendData] as number);
            const firstValue = values[0] || 0;
            const lastValue = values[values.length - 1] || 0;
            const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;

            let trend: 'up' | 'down' | 'stable' = 'stable';
            let percentage = 0;

            if (firstValue > 0) {
                percentage = ((lastValue - firstValue) / firstValue) * 100;
                if (Math.abs(percentage) > 5) {
                    trend = percentage > 0 ? 'up' : 'down';
                }
            }

            return {
                category: category.charAt(0).toUpperCase() + category.slice(1),
                trend,
                percentage: Math.abs(percentage),
                avgValue,
                color: colors[index],
                icon: trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus
            };
        });
    }, [trendData]);

    // Tooltip customizado
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-sm mb-2">{label}</p>
                    <div className="space-y-1 text-xs">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex justify-between gap-4">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span className="font-mono">
                                    R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Filtrar dados por categoria selecionada
    const getFilteredData = () => {
        if (selectedCategory === 'all') {
            return trendData;
        }
        return trendData.map(item => ({
            month: item.month,
            [selectedCategory]: item[selectedCategory as keyof TrendData],
            total: item.total
        }));
    };

    const filteredData = getFilteredData();

    // Calcular estatísticas gerais
    const totalTrend = React.useMemo(() => {
        const totals = trendData.map(d => d.total);
        const firstTotal = totals[0] || 0;
        const lastTotal = totals[totals.length - 1] || 0;
        const avgTotal = totals.reduce((sum, val) => sum + val, 0) / totals.length;

        let trend: 'up' | 'down' | 'stable' = 'stable';
        let percentage = 0;

        if (firstTotal > 0) {
            percentage = ((lastTotal - firstTotal) / firstTotal) * 100;
            if (Math.abs(percentage) > 5) {
                trend = percentage > 0 ? 'up' : 'down';
            }
        }

        return { trend, percentage: Math.abs(percentage), avgTotal };
    }, [trendData]);

    return (
        <Card className="w-full">
            <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="font-headline flex items-center gap-2 text-lg sm:text-xl">
                            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            Análise de Tendências
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Acompanhe as tendências dos seus gastos por categoria ao longo do tempo
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as '6m' | '12m' | '24m')}>
                            <SelectTrigger className="w-24 sm:w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6m">6 meses</SelectItem>
                                <SelectItem value="12m">12 meses</SelectItem>
                                <SelectItem value="24m">24 meses</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-32 sm:w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="alimentacao">Alimentação</SelectItem>
                                <SelectItem value="transporte">Transporte</SelectItem>
                                <SelectItem value="moradia">Moradia</SelectItem>
                                <SelectItem value="lazer">Lazer</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Resumo de Tendências */}
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className={`p-3 sm:p-4 rounded-lg border ${totalTrend.trend === 'up'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : totalTrend.trend === 'down'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                            {totalTrend.trend === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                            ) : totalTrend.trend === 'down' ? (
                                <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                                <Minus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )}
                            <span className={`text-sm font-semibold ${totalTrend.trend === 'up'
                                ? 'text-red-700 dark:text-red-300'
                                : totalTrend.trend === 'down'
                                    ? 'text-green-700 dark:text-green-300'
                                    : 'text-blue-700 dark:text-blue-300'
                                }`}>
                                Tendência Geral
                            </span>
                        </div>
                        <p className={`text-lg sm:text-xl font-bold ${totalTrend.trend === 'up'
                            ? 'text-red-700 dark:text-red-300'
                            : totalTrend.trend === 'down'
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-blue-700 dark:text-blue-300'
                            }`}>
                            {totalTrend.trend === 'up' ? '+' : totalTrend.trend === 'down' ? '-' : ''}
                            {totalTrend.percentage.toFixed(1)}%
                        </p>
                        <p className={`text-xs ${totalTrend.trend === 'up'
                            ? 'text-red-600 dark:text-red-400'
                            : totalTrend.trend === 'down'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}>
                            {totalTrend.trend === 'up' ? 'Aumento' : totalTrend.trend === 'down' ? 'Redução' : 'Estável'}
                        </p>
                    </div>

                    <div className="p-3 sm:p-4 rounded-lg border bg-muted">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">Gasto Médio</span>
                        </div>
                        <p className="text-lg sm:text-xl font-bold font-mono">
                            R$ {totalTrend.avgTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">por mês</p>
                    </div>

                    <div className="p-3 sm:p-4 rounded-lg border bg-muted">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold">Categorias Estáveis</span>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                            {categoryTrends.filter(c => c.trend === 'stable').length}
                        </p>
                        <p className="text-xs text-muted-foreground">de {categoryTrends.length}</p>
                    </div>
                </div>

                <Separator />

                {/* Gráfico de Tendências */}
                <div className="space-y-4">
                    <h4 className="font-semibold">
                        {selectedCategory === 'all' ? 'Todas as Categorias' : `Categoria: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
                    </h4>

                    <div className="h-[300px] sm:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            {selectedCategory === 'all' ? (
                                <AreaChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis
                                        dataKey="month"
                                        className="text-xs"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        className="text-xs"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="alimentacao"
                                        stackId="1"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.6}
                                        name="Alimentação"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="transporte"
                                        stackId="1"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.6}
                                        name="Transporte"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="moradia"
                                        stackId="1"
                                        stroke="#f59e0b"
                                        fill="#f59e0b"
                                        fillOpacity={0.6}
                                        name="Moradia"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="lazer"
                                        stackId="1"
                                        stroke="#8b5cf6"
                                        fill="#8b5cf6"
                                        fillOpacity={0.6}
                                        name="Lazer"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="outros"
                                        stackId="1"
                                        stroke="#ef4444"
                                        fill="#ef4444"
                                        fillOpacity={0.6}
                                        name="Outros"
                                    />
                                </AreaChart>
                            ) : (
                                <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis
                                        dataKey="month"
                                        className="text-xs"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        className="text-xs"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        dataKey={selectedCategory}
                                        fill="#3b82f6"
                                        name={selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                                        radius={[2, 2, 0, 0]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey={selectedCategory}
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                                        name="Tendência"
                                    />
                                </ComposedChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                <Separator />

                {/* Análise por Categoria */}
                <div className="space-y-4">
                    <h4 className="font-semibold">Análise Detalhada por Categoria</h4>

                    <div className="grid gap-3 sm:gap-4">
                        {categoryTrends.map((categoryTrend, index) => {
                            const Icon = categoryTrend.icon;
                            return (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: categoryTrend.color }}
                                        />
                                        <span className="font-medium text-sm">{categoryTrend.category}</span>
                                        <Badge
                                            variant={
                                                categoryTrend.trend === 'up' ? 'destructive' :
                                                    categoryTrend.trend === 'down' ? 'default' : 'secondary'
                                            }
                                            className="gap-1"
                                        >
                                            <Icon className="h-3 w-3" />
                                            {categoryTrend.percentage.toFixed(1)}%
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-sm font-semibold">
                                            R$ {categoryTrend.avgValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">média mensal</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Insights e Recomendações */}
                <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        Insights e Recomendações
                    </h4>

                    <div className="grid gap-3 text-sm">
                        {categoryTrends.filter(c => c.trend === 'up' && c.percentage > 10).length > 0 && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="font-medium mb-1 text-red-700 dark:text-red-300">⚠️ Atenção: Categorias em Alta</p>
                                <p className="text-red-600 dark:text-red-400 text-sm">
                                    {categoryTrends.filter(c => c.trend === 'up' && c.percentage > 10).map(c => c.category).join(', ')}
                                    {categoryTrends.filter(c => c.trend === 'up' && c.percentage > 10).length === 1 ? ' está' : ' estão'} com
                                    aumento significativo. Considere revisar esses gastos.
                                </p>
                            </div>
                        )}

                        {categoryTrends.filter(c => c.trend === 'down' && c.percentage > 10).length > 0 && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="font-medium mb-1 text-green-700 dark:text-green-300">✅ Parabéns: Economia Realizada</p>
                                <p className="text-green-600 dark:text-green-400 text-sm">
                                    Você conseguiu reduzir gastos em: {categoryTrends.filter(c => c.trend === 'down' && c.percentage > 10).map(c => c.category).join(', ')}.
                                    Continue assim!
                                </p>
                            </div>
                        )}

                        <div className="p-3 bg-muted rounded-lg">
                            <p className="font-medium mb-1">💡 Dica de Análise</p>
                            <p className="text-muted-foreground text-sm">
                                Tendências estáveis (variação menor que 5%) indicam bom controle financeiro.
                                Monitore regularmente as categorias com maior variação para identificar padrões sazonais.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}