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
            <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-primary" />
                        <CardTitle className="font-headline text-sm sm:text-base">
                            Resumo Mensal
                        </CardTitle>
                        {summary.status === 'positive' ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        )}
                    </div>

                    {/* Controles de Navegação Mensal */}
                    <div className="flex items-center gap-0.5 bg-muted rounded p-0.5">
                        <Button variant="ghost" size="sm" onClick={goToPreviousMonth} className="h-6 w-6 p-0">
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <div className="text-center min-w-[80px] sm:min-w-[100px]">
                            <div className="font-semibold text-xs capitalize">
                                {format(selectedMonth, 'MMM yyyy', { locale: ptBR })}
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={goToNextMonth} className="h-6 w-6 p-0">
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-2 px-3 sm:px-4 pb-3">
                {/* Cards de Resumo */}
                <div className="grid gap-1.5 grid-cols-2 lg:grid-cols-4">
                    {summaryItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className={`p-1.5 rounded border ${item.bgColor}`}>
                                <div className="flex items-center gap-1 mb-0.5">
                                    <Icon className={`h-3 w-3 ${item.color}`} />
                                    <span className={`text-xs font-semibold ${item.color} truncate`}>{item.label}</span>
                                </div>
                                <div className={`text-xs font-bold font-mono ${item.color}`}>
                                    R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Detalhamento das Previsões Personalizadas - Compacto */}
                {customPredictions.totalCustom > 0 && (
                    <div className="grid gap-1.5 grid-cols-2 pt-1 border-t">
                        {customBreakdown.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="flex items-center justify-between p-1 bg-muted/50 rounded">
                                    <div className="flex items-center gap-1">
                                        <Icon className={`h-3 w-3 ${item.color}`} />
                                        <span className={`text-xs font-medium ${item.color} truncate`}>{item.label}</span>
                                    </div>
                                    <span className={`font-mono text-xs font-semibold ${item.color}`}>
                                        R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Saldo Final - Compacto */}
                <div className={`flex items-center justify-between p-1.5 rounded border ${summary.status === 'positive' ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'}`}>
                    <span className={`text-xs font-semibold ${summary.status === 'positive' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                        Saldo: {summary.status === 'positive' ? 'Positivo' : 'Negativo'}
                    </span>
                    <span className={`text-xs font-bold font-mono ${summary.status === 'positive' ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                        R$ {Math.abs(summary.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </CardContent>
        </Card >
    );
}