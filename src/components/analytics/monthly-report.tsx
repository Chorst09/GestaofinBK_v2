"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import {
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Target,
    Download,
    FileText,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CategoryData {
    name: string;
    value: number;
    color: string;
    percentage: number;
}

interface MonthlyData {
    month: string;
    income: number;
    expenses: number;
    savings: number;
    categories: CategoryData[];
}

interface MonthlyReportProps {
    data?: MonthlyData[];
    currentMonth?: Date;
}

export function MonthlyReport({
    data = [],
    currentMonth = new Date()
}: MonthlyReportProps) {
    const [selectedMonth, setSelectedMonth] = React.useState(currentMonth);
    const [viewType, setViewType] = React.useState<'monthly' | 'yearly'>('monthly');

    // Dados de exemplo
    const defaultMonthlyData: MonthlyData[] = [
        {
            month: '2024-01',
            income: 5000,
            expenses: 3200,
            savings: 1800,
            categories: [
                { name: 'Alimentação', value: 800, color: '#10b981', percentage: 25 },
                { name: 'Transporte', value: 600, color: '#3b82f6', percentage: 18.75 },
                { name: 'Moradia', value: 1200, color: '#f59e0b', percentage: 37.5 },
                { name: 'Lazer', value: 400, color: '#8b5cf6', percentage: 12.5 },
                { name: 'Outros', value: 200, color: '#ef4444', percentage: 6.25 }
            ]
        },
        {
            month: '2024-02',
            income: 5200,
            expenses: 3400,
            savings: 1800,
            categories: [
                { name: 'Alimentação', value: 850, color: '#10b981', percentage: 25 },
                { name: 'Transporte', value: 650, color: '#3b82f6', percentage: 19.12 },
                { name: 'Moradia', value: 1200, color: '#f59e0b', percentage: 35.29 },
                { name: 'Lazer', value: 500, color: '#8b5cf6', percentage: 14.71 },
                { name: 'Outros', value: 200, color: '#ef4444', percentage: 5.88 }
            ]
        }
    ];

    const reportData = data.length > 0 ? data : defaultMonthlyData;

    // Encontrar dados do mês selecionado
    const selectedMonthKey = format(selectedMonth, 'yyyy-MM');
    const currentData = reportData.find(d => d.month === selectedMonthKey) || reportData[0];

    // Navegação de mês
    const goToPreviousMonth = () => {
        setSelectedMonth(prev => subMonths(prev, 1));
    };

    const goToNextMonth = () => {
        setSelectedMonth(prev => addMonths(prev, 1));
    };

    const goToCurrentMonth = () => {
        setSelectedMonth(new Date());
    };

    // Cálculos
    const savingsRate = currentData.income > 0 ? (currentData.savings / currentData.income) * 100 : 0;
    const expenseRate = currentData.income > 0 ? (currentData.expenses / currentData.income) * 100 : 0;

    // Tooltip customizado para gráfico de pizza
    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-sm mb-1">{data.name}</p>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between gap-4">
                            <span>Valor:</span>
                            <span className="font-mono">R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span>Percentual:</span>
                            <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Dados para gráfico anual
    const yearlyData = React.useMemo(() => {
        return reportData.map(item => ({
            month: format(new Date(item.month + '-01'), 'MMM', { locale: ptBR }),
            receitas: item.income,
            gastos: item.expenses,
            economia: item.savings
        }));
    }, [reportData]);

    const exportReport = () => {
        // Implementar exportação de relatório
        console.log('Exportando relatório...');
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="font-headline flex items-center gap-2 text-lg sm:text-xl">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            Relatórios Financeiros
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Análise detalhada dos seus gastos e receitas
                        </CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={exportReport} className="gap-1 text-xs sm:text-sm">
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">Exportar</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'monthly' | 'yearly')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="monthly">Mensal</TabsTrigger>
                        <TabsTrigger value="yearly">Anual</TabsTrigger>
                    </TabsList>

                    <TabsContent value="monthly" className="space-y-6">
                        {/* Navegação do Mês */}
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousMonth}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="text-center">
                                <h3 className="text-lg font-semibold">
                                    {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goToCurrentMonth}
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Ir para mês atual
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextMonth}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Resumo Financeiro */}
                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="p-3 sm:p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">Receitas</span>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300 font-mono">
                                    R$ {currentData.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="p-3 sm:p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">Gastos</span>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-300 font-mono">
                                    R$ {currentData.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    {expenseRate.toFixed(1)}% da receita
                                </p>
                            </div>

                            <div className="p-3 sm:p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Economia</span>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-300 font-mono">
                                    R$ {currentData.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    {savingsRate.toFixed(1)}% da receita
                                </p>
                            </div>

                            <div className="p-3 sm:p-4 rounded-lg border bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Meta</span>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-300">
                                    {savingsRate >= 20 ? '✅' : savingsRate >= 10 ? '⚠️' : '❌'}
                                </p>
                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                    {savingsRate >= 20 ? 'Excelente!' : savingsRate >= 10 ? 'Bom' : 'Melhorar'}
                                </p>
                            </div>
                        </div>

                        {/* Gráfico de Categorias */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <h4 className="font-semibold">Gastos por Categoria</h4>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={currentData.categories}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {currentData.categories.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomPieTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold">Detalhamento</h4>
                                <div className="space-y-3">
                                    {currentData.categories.map((category, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <span className="font-medium text-sm">{category.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-sm font-semibold">
                                                    R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {category.percentage.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="yearly" className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold">Visão Anual - {format(selectedMonth, 'yyyy')}</h4>

                            <div className="h-[300px] sm:h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                        <Tooltip
                                            formatter={(value: number) => [
                                                `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                                                ''
                                            ]}
                                        />
                                        <Legend />
                                        <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[2, 2, 0, 0]} />
                                        <Bar dataKey="gastos" fill="#ef4444" name="Gastos" radius={[2, 2, 0, 0]} />
                                        <Bar dataKey="economia" fill="#3b82f6" name="Economia" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Resumo Anual */}
                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
                            <div className="p-4 rounded-lg border bg-muted">
                                <h5 className="font-semibold mb-2">Total de Receitas</h5>
                                <p className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
                                    R$ {yearlyData.reduce((sum, item) => sum + item.receitas, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg border bg-muted">
                                <h5 className="font-semibold mb-2">Total de Gastos</h5>
                                <p className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
                                    R$ {yearlyData.reduce((sum, item) => sum + item.gastos, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg border bg-muted">
                                <h5 className="font-semibold mb-2">Total Economizado</h5>
                                <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                                    R$ {yearlyData.reduce((sum, item) => sum + item.economia, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}