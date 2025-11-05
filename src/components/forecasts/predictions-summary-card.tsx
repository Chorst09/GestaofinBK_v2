"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    Calendar,
    Coffee,
    UtensilsCrossed,
    Fuel,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useForecasts } from '@/hooks/useForecasts';
import { getCategoryByName } from '@/components/transactions/categories';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PredictionData {
    weeklyExpenses: number;
    weekendExpenses: number;
    foodExpenses: number;
    fuelExpenses: number;
}

export function PredictionsSummaryCard() {
    const { forecastItems } = useForecasts();

    // Estado para o mês selecionado (padrão: mês atual)
    const [selectedMonth, setSelectedMonth] = React.useState(startOfMonth(new Date()));

    // Carregar previsões do localStorage
    const [predictions, setPredictions] = React.useState<PredictionData>({
        weeklyExpenses: 0,
        weekendExpenses: 0,
        foodExpenses: 0,
        fuelExpenses: 0,
    });

    React.useEffect(() => {
        const savedPredictions = localStorage.getItem('financeiro-zen-predictions');
        if (savedPredictions) {
            try {
                const parsed = JSON.parse(savedPredictions);
                setPredictions(parsed);
            } catch (error) {
                console.error('Erro ao carregar previsões salvas:', error);
            }
        }
    }, []);

    // Calcular totais das previsões formais (do sistema) - FILTRADO POR MÊS
    const formalForecasts = React.useMemo(() => {
        let totalIncome = 0;
        let totalExpenses = 0;
        let cardExpenses = 0;

        // Definir intervalo do mês selecionado
        const monthStart = startOfMonth(selectedMonth);
        const monthEnd = endOfMonth(selectedMonth);

        forecastItems.forEach(item => {
            try {
                // Verificar se o item está no mês selecionado
                const itemDate = parseISO(item.date);
                const isInSelectedMonth = isWithinInterval(itemDate, { start: monthStart, end: monthEnd });

                if (!isInSelectedMonth) return; // Pular itens fora do mês selecionado

                if (item.type === 'income') {
                    totalIncome += Math.abs(item.amount);
                } else {
                    totalExpenses += Math.abs(item.amount);
                    // Verificar se é gasto com cartão usando a configuração da categoria
                    const categoryConfig = getCategoryByName(item.category);
                    if (categoryConfig?.isCreditCard || item.creditCardId) {
                        cardExpenses += Math.abs(item.amount);
                    }
                }
            } catch (error) {
                console.error('Erro ao processar data do item de previsão:', error, item);
            }
        });

        return { totalIncome, totalExpenses, cardExpenses };
    }, [forecastItems, selectedMonth]);

    // Calcular totais das previsões personalizadas
    const customPredictions = React.useMemo(() => {
        const weeklyTotal = predictions.weeklyExpenses * 4;
        const weekendTotal = predictions.weekendExpenses * 4;
        const foodTotal = predictions.foodExpenses;
        const fuelTotal = predictions.fuelExpenses;
        const totalCustom = weeklyTotal + weekendTotal + foodTotal + fuelTotal;

        return {
            weeklyTotal,
            weekendTotal,
            foodTotal,
            fuelTotal,
            totalCustom
        };
    }, [predictions]);

    // Funções de navegação mensal
    const goToPreviousMonth = () => {
        setSelectedMonth(prev => startOfMonth(subMonths(prev, 1)));
    };

    const goToNextMonth = () => {
        setSelectedMonth(prev => startOfMonth(addMonths(prev, 1)));
    };

    const goToCurrentMonth = () => {
        setSelectedMonth(startOfMonth(new Date()));
    };

    // Calcular resumo geral
    const summary = React.useMemo(() => {
        const totalPredictedExpenses = formalForecasts.totalExpenses + customPredictions.totalCustom;
        const balance = formalForecasts.totalIncome - totalPredictedExpenses;
        const expenseRatio = formalForecasts.totalIncome > 0 ? (totalPredictedExpenses / formalForecasts.totalIncome) * 100 : 0;

        return {
            totalPredictedExpenses,
            balance,
            expenseRatio,
            status: balance >= 0 ? 'positive' : 'negative'
        };
    }, [formalForecasts, customPredictions]);

    const summaryItems = [
        {
            label: 'Receitas Previstas',
            value: formalForecasts.totalIncome,
            icon: TrendingUp,
            color: 'text-green-800 dark:text-green-200',
            bgColor: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
            type: 'income'
        },
        {
            label: 'Gastos Formais',
            value: formalForecasts.totalExpenses,
            icon: DollarSign,
            color: 'text-blue-800 dark:text-blue-200',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
            type: 'formal'
        },
        {
            label: 'Gastos com Cartões',
            value: formalForecasts.cardExpenses,
            icon: CreditCard,
            color: 'text-purple-800 dark:text-purple-200',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
            type: 'card'
        },
        {
            label: 'Previsões Personalizadas',
            value: customPredictions.totalCustom,
            icon: BarChart3,
            color: 'text-orange-800 dark:text-orange-200',
            bgColor: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
            type: 'custom'
        }
    ];

    const customBreakdown = [
        {
            label: 'Gastos Semanais',
            value: customPredictions.weeklyTotal,
            icon: Calendar,
            color: 'text-blue-800 dark:text-blue-300'
        },
        {
            label: 'Final de Semana',
            value: customPredictions.weekendTotal,
            icon: Coffee,
            color: 'text-purple-800 dark:text-purple-300'
        },
        {
            label: 'Alimentação',
            value: customPredictions.foodTotal,
            icon: UtensilsCrossed,
            color: 'text-green-800 dark:text-green-300'
        },
        {
            label: 'Combustível',
            value: customPredictions.fuelTotal,
            icon: Fuel,
            color: 'text-orange-800 dark:text-orange-300'
        }
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Resumo Mensal de Previsões
                        </CardTitle>
                        <CardDescription>
                            Comparativo mensal entre receitas previstas e todos os tipos de gastos
                        </CardDescription>
                    </div>

                    {/* Controles de Navegação Mensal */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-center min-w-[140px]">
                            <div className="font-semibold text-sm">
                                {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={goToCurrentMonth}
                                className="text-xs h-auto p-1 text-muted-foreground hover:text-foreground"
                            >
                                Mês atual
                            </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={goToNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        {summary.status === 'positive' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Cards de Resumo */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {summaryItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className={`p-4 rounded-lg border-2 ${item.bgColor}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className={`h-4 w-4 ${item.color}`} />
                                    <span className={`text-sm font-semibold ${item.color}`}>{item.label}</span>
                                </div>
                                <div className={`text-lg font-bold font-mono ${item.color}`}>
                                    R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Indicador quando não há dados formais no mês */}
                {formalForecasts.totalIncome === 0 && formalForecasts.totalExpenses === 0 && (
                    <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
                        <p className="text-sm text-muted-foreground text-center">
                            📅 Nenhuma previsão formal encontrada para {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                        </p>
                    </div>
                )}

                <Separator />

                {/* Detalhamento das Previsões Personalizadas */}
                {customPredictions.totalCustom > 0 && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            Detalhamento - Previsões Personalizadas
                        </h4>
                        <div className="grid gap-3 md:grid-cols-2">
                            {customBreakdown.map((item, index) => {
                                const Icon = item.icon;
                                const percentage = customPredictions.totalCustom > 0 ? (item.value / customPredictions.totalCustom) * 100 : 0;

                                return (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/80 dark:bg-muted/40 rounded-lg border border-border">
                                        <div className="flex items-center gap-2">
                                            <Icon className={`h-4 w-4 ${item.color}`} />
                                            <span className={`text-sm font-semibold ${item.color}`}>{item.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-sm font-semibold">
                                                R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {percentage.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <Separator />

                {/* Análise Final */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Análise Financeira
                    </h4>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Saldo Final */}
                        <div className={`p-4 rounded-lg border-2 ${summary.status === 'positive' ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className={`h-4 w-4 ${summary.status === 'positive' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`} />
                                <span className={`text-sm font-semibold ${summary.status === 'positive' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                    Saldo Previsto
                                </span>
                            </div>
                            <div className={`text-xl font-bold font-mono ${summary.status === 'positive' ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                                R$ {Math.abs(summary.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium mt-1">
                                {summary.status === 'positive' ? 'Sobra prevista' : 'Déficit previsto'}
                            </div>
                        </div>

                        {/* Percentual de Gastos */}
                        <div className="p-4 rounded-lg border-2 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="h-4 w-4 text-blue-800 dark:text-blue-200" />
                                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                    Comprometimento da Renda
                                </span>
                            </div>
                            <div className="text-xl font-bold font-mono text-blue-900 dark:text-blue-100">
                                {summary.expenseRatio.toFixed(1)}%
                            </div>
                            <Progress
                                value={Math.min(summary.expenseRatio, 100)}
                                className="mt-2 h-2"
                            />
                            <div className="text-xs text-muted-foreground font-medium mt-1">
                                {summary.expenseRatio > 100 ? 'Gastos excedem receitas' : 'Da receita prevista'}
                            </div>
                        </div>
                    </div>

                    {/* Alertas e Recomendações */}
                    <div className={`p-4 rounded-lg border-2 ${summary.status === 'positive' ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' : 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700'}`}>
                        <div className="flex items-start gap-2">
                            {summary.status === 'positive' ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            )}
                            <div>
                                <p className={`text-sm font-semibold ${summary.status === 'positive' ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
                                    {summary.status === 'positive' ? '✅ Situação Favorável' : '⚠️ Atenção Necessária'}
                                </p>
                                <p className={`text-xs mt-1 font-medium ${summary.status === 'positive' ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                                    {summary.status === 'positive'
                                        ? 'Suas previsões indicam um saldo positivo. Continue monitorando seus gastos para manter este resultado.'
                                        : summary.expenseRatio > 100
                                            ? 'Seus gastos previstos excedem suas receitas. Considere revisar suas previsões ou buscar formas de aumentar a renda.'
                                            : 'Saldo apertado previsto. Monitore de perto os gastos para evitar déficit.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}