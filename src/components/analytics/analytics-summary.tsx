"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Target,
    BarChart3,
    ArrowRight,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsSummaryProps {
    className?: string;
}

export function AnalyticsSummary({ className }: AnalyticsSummaryProps) {
    // Dados resumidos para o dashboard
    const summaryData = {
        predictionAccuracy: 87.3,
        monthlySavings: 1247,
        savingsGoal: 2000,
        categoriesControlled: 4,
        totalCategories: 5,
        monthlyTrend: 'up' as const,
        trendPercentage: 12.5
    };

    // Dados para mini gráficos
    const monthlyData = [
        { month: 'Jul', value: 3200 },
        { month: 'Ago', value: 3300 },
        { month: 'Set', value: 3160 },
        { month: 'Out', value: 3550 },
        { month: 'Nov', value: 3240 },
        { month: 'Dez', value: 3750 },
    ];

    const categoryData = [
        { name: 'Moradia', value: 1200, color: '#f59e0b' },
        { name: 'Alimentação', value: 850, color: '#10b981' },
        { name: 'Transporte', value: 650, color: '#3b82f6' },
        { name: 'Lazer', value: 500, color: '#8b5cf6' },
        { name: 'Outros', value: 200, color: '#ef4444' }
    ];

    const savingsProgress = (summaryData.monthlySavings / summaryData.savingsGoal) * 100;

    return (
        <div className={className}>
            <div className="grid gap-4 sm:gap-6">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold font-headline flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            Resumo Analytics
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Principais métricas e insights dos seus dados financeiros
                        </p>
                    </div>
                    <Link href="/analytics">
                        <Button size="sm" className="gap-1">
                            Ver Detalhes
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {/* Métricas Principais */}
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Precisão das Previsões */}
                    <Card className="border-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <Badge variant="secondary" className="text-xs">
                                    {summaryData.predictionAccuracy >= 80 ? 'Excelente' : 'Bom'}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                    Precisão das Previsões
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {summaryData.predictionAccuracy}%
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Economia Mensal */}
                    <Card className="border-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <Badge variant="secondary" className="text-xs">
                                    {savingsProgress >= 100 ? 'Meta Atingida' : 'Em Progresso'}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-green-700 dark:text-green-300">
                                    Economia Este Mês
                                </p>
                                <p className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300 font-mono">
                                    R$ {summaryData.monthlySavings.toLocaleString('pt-BR')}
                                </p>
                                <Progress
                                    value={Math.min(savingsProgress, 100)}
                                    className="h-2"
                                />
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    {savingsProgress.toFixed(0)}% da meta (R$ {summaryData.savingsGoal.toLocaleString('pt-BR')})
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Controle de Categorias */}
                    <Card className="border-2 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2">
                                <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <Badge variant="secondary" className="text-xs">
                                    {summaryData.categoriesControlled === summaryData.totalCategories ? 'Perfeito' : 'Bom'}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                    Categorias Controladas
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
                                    {summaryData.categoriesControlled}/{summaryData.totalCategories}
                                </p>
                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                    {((summaryData.categoriesControlled / summaryData.totalCategories) * 100).toFixed(0)}% sob controle
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tendência Mensal */}
                    <Card className={`border-2 ${summaryData.monthlyTrend === 'up'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        }`}>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2">
                                {summaryData.monthlyTrend === 'up' ? (
                                    <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                                ) : (
                                    <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                                )}
                                <Badge variant="secondary" className="text-xs">
                                    {summaryData.monthlyTrend === 'up' ? 'Atenção' : 'Ótimo'}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className={`text-xs font-medium ${summaryData.monthlyTrend === 'up'
                                        ? 'text-red-700 dark:text-red-300'
                                        : 'text-green-700 dark:text-green-300'
                                    }`}>
                                    Tendência Mensal
                                </p>
                                <p className={`text-xl sm:text-2xl font-bold ${summaryData.monthlyTrend === 'up'
                                        ? 'text-red-700 dark:text-red-300'
                                        : 'text-green-700 dark:text-green-300'
                                    }`}>
                                    {summaryData.monthlyTrend === 'up' ? '+' : '-'}{summaryData.trendPercentage}%
                                </p>
                                <p className={`text-xs ${summaryData.monthlyTrend === 'up'
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-green-600 dark:text-green-400'
                                    }`}>
                                    vs mês anterior
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mini Gráficos */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Tendência de Gastos */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base sm:text-lg">Tendência de Gastos (6 meses)</CardTitle>
                            <CardDescription className="text-sm">
                                Evolução dos gastos mensais
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[120px] sm:h-[150px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData}>
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis hide />
                                        <Bar
                                            dataKey="value"
                                            fill="#3b82f6"
                                            radius={[2, 2, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Distribuição por Categoria */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base sm:text-lg">Distribuição por Categoria</CardTitle>
                            <CardDescription className="text-sm">
                                Gastos do mês atual
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="h-[120px] w-[120px] sm:h-[150px] sm:w-[150px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={30}
                                                outerRadius={60}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {categoryData.slice(0, 3).map((category, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <span className="font-medium">{category.name}</span>
                                            </div>
                                            <span className="font-mono text-xs">
                                                R$ {category.value.toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="pt-1 border-t">
                                        <Link href="/analytics" className="text-xs text-primary hover:underline">
                                            Ver todas as categorias →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Insights Rápidos */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            Insights Rápidos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                                    ✅ Controle Excelente
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    Suas previsões estão 87% precisas
                                </p>
                            </div>

                            <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                                    💰 Meta de Economia
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    {savingsProgress >= 100 ? 'Meta atingida!' : `Faltam R$ ${(summaryData.savingsGoal - summaryData.monthlySavings).toLocaleString('pt-BR')}`}
                                </p>
                            </div>

                            <div className="p-3 rounded-lg border bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                                <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">
                                    📊 Próxima Análise
                                </p>
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                    Revisar categoria "Lazer" (+25%)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}