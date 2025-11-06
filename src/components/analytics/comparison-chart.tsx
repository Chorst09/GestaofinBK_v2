"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';

interface ComparisonData {
    month: string;
    predicted: number;
    actual: number;
    difference: number;
    category: string;
}

interface ComparisonChartProps {
    data?: ComparisonData[];
    title?: string;
    type?: 'bar' | 'line' | 'area';
}

export function ComparisonChart({
    data = [],
    title = "Previsões vs Gastos Reais",
    type = 'bar'
}: ComparisonChartProps) {
    // Dados de exemplo se não fornecidos
    const defaultData: ComparisonData[] = [
        { month: 'Jan', predicted: 2500, actual: 2750, difference: -250, category: 'Geral' },
        { month: 'Fev', predicted: 2600, actual: 2400, difference: 200, category: 'Geral' },
        { month: 'Mar', predicted: 2550, actual: 2680, difference: -130, category: 'Geral' },
        { month: 'Abr', predicted: 2700, actual: 2590, difference: 110, category: 'Geral' },
        { month: 'Mai', predicted: 2650, actual: 2820, difference: -170, category: 'Geral' },
        { month: 'Jun', predicted: 2800, actual: 2750, difference: 50, category: 'Geral' },
    ];

    const chartData = data.length > 0 ? data : defaultData;

    // Cálculos de estatísticas
    const totalPredicted = chartData.reduce((sum, item) => sum + item.predicted, 0);
    const totalActual = chartData.reduce((sum, item) => sum + item.actual, 0);
    const totalDifference = totalActual - totalPredicted;
    const accuracy = totalPredicted > 0 ? ((totalPredicted - Math.abs(totalDifference)) / totalPredicted) * 100 : 0;
    const avgMonthlyDifference = chartData.length > 0 ? totalDifference / chartData.length : 0;

    // Tooltip customizado
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const predicted = payload.find((p: any) => p.dataKey === 'predicted')?.value || 0;
            const actual = payload.find((p: any) => p.dataKey === 'actual')?.value || 0;
            const difference = actual - predicted;

            return (
                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-sm mb-2">{label}</p>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between gap-4">
                            <span className="text-blue-600 dark:text-blue-400">Previsto:</span>
                            <span className="font-mono">R$ {predicted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-green-600 dark:text-green-400">Real:</span>
                            <span className="font-mono">R$ {actual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <Separator className="my-1" />
                        <div className="flex justify-between gap-4">
                            <span className={difference >= 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                                Diferença:
                            </span>
                            <span className={`font-mono font-semibold ${difference >= 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                                {difference >= 0 ? '+' : ''}R$ {difference.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 20, right: 30, left: 20, bottom: 5 }
        };

        switch (type) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
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
                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="Previsto"
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Real"
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        />
                    </LineChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
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
                            dataKey="predicted"
                            stackId="1"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                            name="Previsto"
                        />
                        <Area
                            type="monotone"
                            dataKey="actual"
                            stackId="2"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                            name="Real"
                        />
                    </AreaChart>
                );

            default: // bar
                return (
                    <BarChart {...commonProps}>
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
                            dataKey="predicted"
                            fill="#3b82f6"
                            name="Previsto"
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="actual"
                            fill="#10b981"
                            name="Real"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                );
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="font-headline flex items-center gap-2 text-lg sm:text-xl">
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            {title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Comparação entre valores previstos e gastos reais por mês
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Estatísticas Resumidas */}
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="p-3 sm:p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Precisão</span>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-300">
                            {accuracy.toFixed(1)}%
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">das previsões</p>
                    </div>

                    <div className="p-3 sm:p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Total Previsto</span>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300 font-mono">
                            R$ {(totalPredicted / 1000).toFixed(1)}k
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">últimos 6 meses</p>
                    </div>

                    <div className="p-3 sm:p-4 rounded-lg border bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Total Real</span>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-300 font-mono">
                            R$ {(totalActual / 1000).toFixed(1)}k
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">gastos efetivos</p>
                    </div>

                    <div className={`p-3 sm:p-4 rounded-lg border ${totalDifference >= 0
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className={`h-4 w-4 ${totalDifference >= 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-green-600 dark:text-green-400'
                                }`} />
                            <span className={`text-sm font-semibold ${totalDifference >= 0
                                    ? 'text-red-700 dark:text-red-300'
                                    : 'text-green-700 dark:text-green-300'
                                }`}>
                                Diferença
                            </span>
                        </div>
                        <p className={`text-lg sm:text-xl font-bold font-mono ${totalDifference >= 0
                                ? 'text-red-700 dark:text-red-300'
                                : 'text-green-700 dark:text-green-300'
                            }`}>
                            {totalDifference >= 0 ? '+' : ''}R$ {(totalDifference / 1000).toFixed(1)}k
                        </p>
                        <p className={`text-xs ${totalDifference >= 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                            {totalDifference >= 0 ? 'acima do previsto' : 'economia realizada'}
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Gráfico */}
                <div className="h-[300px] sm:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>

                {/* Insights */}
                <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Insights da Análise
                    </h4>

                    <div className="grid gap-3 text-sm">
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="font-medium mb-1">📊 Precisão das Previsões</p>
                            <p className="text-muted-foreground">
                                Suas previsões têm uma precisão de <strong>{accuracy.toFixed(1)}%</strong>.
                                {accuracy >= 80 ? ' Excelente controle!' : accuracy >= 60 ? ' Bom controle, pode melhorar.' : ' Revise suas estimativas.'}
                            </p>
                        </div>

                        <div className="p-3 bg-muted rounded-lg">
                            <p className="font-medium mb-1">💰 Diferença Média Mensal</p>
                            <p className="text-muted-foreground">
                                Em média, você {avgMonthlyDifference >= 0 ? 'gasta' : 'economiza'} <strong>
                                    R$ {Math.abs(avgMonthlyDifference).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </strong> {avgMonthlyDifference >= 0 ? 'a mais' : 'a menos'} do que previsto por mês.
                            </p>
                        </div>

                        {totalDifference < 0 && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="font-medium mb-1 text-green-700 dark:text-green-300">🎉 Parabéns!</p>
                                <p className="text-green-600 dark:text-green-400 text-sm">
                                    Você economizou <strong>R$ {Math.abs(totalDifference).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                                    nos últimos meses comparado às suas previsões!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}