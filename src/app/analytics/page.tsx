"use client";

import * as React from 'react';
import { ComparisonChart } from '@/components/analytics/comparison-chart';
import { MonthlyReport } from '@/components/analytics/monthly-report';
import { TrendsAnalysis } from '@/components/analytics/trends-analysis';
import { SmartAlerts } from '@/components/analytics/smart-alerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BarChart3,
    TrendingUp,
    FileText,
    Activity,
    Calendar,
    Target,
    DollarSign,
    AlertTriangle,
    Download,
    RefreshCw
} from 'lucide-react';

export default function AnalyticsPage() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [lastUpdated, setLastUpdated] = React.useState(new Date());

    // Simular carregamento de dados
    const refreshData = async () => {
        setIsLoading(true);
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLastUpdated(new Date());
        setIsLoading(false);
    };

    // Dados de exemplo para demonstração
    const dashboardStats = [
        {
            title: 'Precisão das Previsões',
            value: '87.3%',
            change: '+2.1%',
            trend: 'up' as const,
            icon: Target,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        },
        {
            title: 'Economia Realizada',
            value: 'R$ 1.247',
            change: '+R$ 320',
            trend: 'up' as const,
            icon: DollarSign,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        },
        {
            title: 'Categorias Controladas',
            value: '4 de 5',
            change: '+1',
            trend: 'up' as const,
            icon: Activity,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
        },
        {
            title: 'Alertas Ativos',
            value: '2',
            change: '-1',
            trend: 'down' as const,
            icon: AlertTriangle,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
        }
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold font-headline flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        Analytics Financeiro
                    </h1>
                    <p className="text-muted-foreground">
                        Análise completa dos seus dados financeiros com insights e tendências
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshData}
                        disabled={isLoading}
                        className="gap-1"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden xs:inline">Atualizar</span>
                    </Button>
                    <Button size="sm" className="gap-1">
                        <Download className="h-4 w-4" />
                        <span className="hidden xs:inline">Exportar</span>
                    </Button>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {dashboardStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className={`border-2 ${stat.bgColor}`}>
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                            {stat.title}
                                        </p>
                                        <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>
                                            {stat.value}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {stat.trend === 'up' ? (
                                                <TrendingUp className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                                            )}
                                            <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {stat.change}
                                            </span>
                                        </div>
                                    </div>
                                    <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Última Atualização */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                        Última atualização: {lastUpdated.toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
                <Badge variant="secondary" className="gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Dados atualizados
                </Badge>
            </div>

            {/* Analytics Tabs */}
            <Tabs defaultValue="comparison" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="comparison" className="gap-1 text-xs sm:text-sm">
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">Comparação</span>
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="gap-1 text-xs sm:text-sm">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">Relatórios</span>
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="gap-1 text-xs sm:text-sm">
                        <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">Tendências</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="comparison" className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Previsões vs Gastos Reais</h2>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Compare suas previsões com os gastos efetivos para avaliar a precisão do seu planejamento financeiro.
                        </p>
                    </div>
                    <ComparisonChart />

                    {/* Gráficos adicionais de comparação */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <ComparisonChart
                            title="Tendência Linear"
                            type="line"
                        />
                        <ComparisonChart
                            title="Análise de Área"
                            type="area"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Relatórios Detalhados</h2>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Relatórios mensais e anuais com análise completa das suas finanças, incluindo categorização de gastos e metas de economia.
                        </p>
                    </div>
                    <MonthlyReport />
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Análise de Tendências</h2>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Identifique padrões e tendências nos seus gastos por categoria ao longo do tempo para otimizar seu orçamento.
                        </p>
                    </div>
                    <TrendsAnalysis />
                </TabsContent>
            </Tabs>

            {/* Alertas Inteligentes */}
            <SmartAlerts />

            {/* Insights Rápidos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Insights Rápidos
                    </CardTitle>
                    <CardDescription>
                        Principais descobertas baseadas na análise dos seus dados
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                                🎯 Meta de Economia
                            </h4>
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Você está 12% acima da sua meta mensal de economia. Parabéns!
                            </p>
                        </div>

                        <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                                📊 Categoria Destaque
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                Alimentação teve a maior redução de gastos (-15%) este mês.
                            </p>
                        </div>

                        <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                            <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                                ⚠️ Atenção Necessária
                            </h4>
                            <p className="text-sm text-orange-600 dark:text-orange-400">
                                Gastos com lazer aumentaram 25% comparado ao mês anterior.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}