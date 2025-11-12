
"use client";

import * as React from 'react';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  format,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useForecasts } from '@/hooks/useForecasts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAllCategories } from '@/hooks/useAllCategories';

interface ComparisonData {
  category: string;
  type: 'income' | 'expense';
  forecasted: number;
  realized: number;
  difference: number;
}

export default function PlannedVsActualPage() {
  const [currentMonth, setCurrentMonth] = React.useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    setCurrentMonth(startOfMonth(new Date()));
  }, []);

  const { transactions } = useTransactions();
  const { forecastItems } = useForecasts();
  const { getCategoryIcon } = useAllCategories();

  const period = React.useMemo(() => ({
    start: startOfMonth(currentMonth!),
    end: endOfMonth(currentMonth!),
  }), [currentMonth]);

  const analysisData = React.useMemo(() => {
    const periodForecasts = forecastItems.filter(f => startOfMonth(parseISO(f.date)).getTime() === period.start.getTime());
    const periodTransactions = transactions.filter(t => isWithinInterval(parseISO(t.date), period));

    const comparisonMap = new Map<string, { forecasted: number; realized: number; type: 'income' | 'expense' }>();

    // Process forecasts
    periodForecasts.forEach(item => {
      const key = item.category;
      if (!comparisonMap.has(key)) {
        comparisonMap.set(key, { forecasted: 0, realized: 0, type: item.type });
      }
      const entry = comparisonMap.get(key)!;
      entry.forecasted += Math.abs(item.amount);
      entry.type = item.type; // Ensure type is set
    });

    // Process transactions
    periodTransactions.forEach(item => {
      const key = item.category;
      if (!comparisonMap.has(key)) {
        comparisonMap.set(key, { forecasted: 0, realized: 0, type: item.type });
      }
      const entry = comparisonMap.get(key)!;
      entry.realized += Math.abs(item.amount);
      entry.type = item.type; // Ensure type is set
    });

    const detailedComparison: ComparisonData[] = Array.from(comparisonMap.entries()).map(([category, data]) => ({
      category,
      type: data.type,
      forecasted: data.forecasted,
      realized: data.realized,
      difference: data.forecasted - data.realized,
    })).sort((a, b) => {
      if (a.type !== b.type) return a.type === 'income' ? -1 : 1;
      return b.forecasted - a.forecasted;
    });

    const totalForecastedIncome = detailedComparison.filter(d => d.type === 'income').reduce((acc, d) => acc + d.forecasted, 0);
    const totalRealizedIncome = detailedComparison.filter(d => d.type === 'income').reduce((acc, d) => acc + d.realized, 0);
    const totalForecastedExpense = detailedComparison.filter(d => d.type === 'expense').reduce((acc, d) => acc + d.forecasted, 0);
    const totalRealizedExpense = detailedComparison.filter(d => d.type === 'expense').reduce((acc, d) => acc + d.realized, 0);

    return {
      detailedComparison,
      totalForecastedIncome,
      totalRealizedIncome,
      totalForecastedExpense,
      totalRealizedExpense,
      totalForecastedBalance: totalForecastedIncome - totalForecastedExpense,
      totalRealizedBalance: totalRealizedIncome - totalRealizedExpense,
    };

  }, [transactions, forecastItems, period]);

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev!, 1) : addMonths(prev!, 1));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular um pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 500));
    // Forçar re-render dos dados
    setCurrentMonth(prev => new Date(prev!.getTime()));
    setIsRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return isNegative ? `- ${absValue}` : absValue;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-headline font-semibold">Previsto vs. Realizado</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Atualizar</span>
          </Button>
        </div>
        <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted">
          <Button variant="ghost" size="icon" onClick={() => changeMonth('prev')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-center w-48 capitalize">
            {currentMonth ? format(currentMonth, 'MMMM yyyy', { locale: ptBR }) : ''}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => changeMonth('next')}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2"><TrendingUp /> Receitas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Previsto:</span> <span className="font-medium">{formatCurrency(analysisData.totalForecastedIncome)}</span></div>
            <div className="flex justify-between"><span>Realizado:</span> <span className="font-medium">{formatCurrency(analysisData.totalRealizedIncome)}</span></div>
            <div className={cn("flex justify-between font-bold", (analysisData.totalRealizedIncome < analysisData.totalForecastedIncome) ? 'text-destructive' : 'text-green-600')}>
              <span>Diferença:</span>
              <span>{formatCurrency(analysisData.totalRealizedIncome - analysisData.totalForecastedIncome)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2"><TrendingDown /> Despesas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Previsto:</span> <span className="font-medium">{formatCurrency(analysisData.totalForecastedExpense)}</span></div>
            <div className="flex justify-between"><span>Realizado:</span> <span className="font-medium">{formatCurrency(analysisData.totalRealizedExpense)}</span></div>
            <div className={cn("flex justify-between font-bold", (analysisData.totalRealizedExpense > analysisData.totalForecastedExpense) ? 'text-destructive' : 'text-green-600')}>
              <span>Diferença:</span>
              <span>{formatCurrency(analysisData.totalForecastedExpense - analysisData.totalRealizedExpense)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">Saldo Final</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Previsto:</span> <span className="font-medium">{formatCurrency(analysisData.totalForecastedBalance)}</span></div>
            <div className="flex justify-between"><span>Realizado:</span> <span className="font-medium">{formatCurrency(analysisData.totalRealizedBalance)}</span></div>
            <div className={cn("flex justify-between font-bold", (analysisData.totalRealizedBalance < analysisData.totalForecastedBalance) ? 'text-destructive' : 'text-green-600')}>
              <span>Diferença:</span>
              <span>{formatCurrency(analysisData.totalRealizedBalance - analysisData.totalForecastedBalance)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Detalhamento por Categoria</CardTitle>
          <CardDescription>Compare suas previsões com os gastos e receitas reais em cada categoria.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Categoria</TableHead>
                  <TableHead className="w-[150px] text-right">Previsto</TableHead>
                  <TableHead className="w-[150px] text-right">Realizado</TableHead>
                  <TableHead className="w-[150px] text-right">Diferença</TableHead>
                  <TableHead className="w-[250px] text-center">Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisData.detailedComparison.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhuma transação ou previsão encontrada para este mês.
                    </TableCell>
                  </TableRow>
                )}
                {analysisData.detailedComparison.filter(d => d.type === 'income').length > 0 && (
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={5} className="font-bold text-green-700">Receitas</TableCell>
                  </TableRow>
                )}
                {analysisData.detailedComparison.filter(d => d.type === 'income').map(item => {
                  const Icon = getCategoryIcon(item.category);
                  const progress = item.forecasted > 0 ? (item.realized / item.forecasted) * 100 : item.realized > 0 ? 100 : 0;
                  return (
                    <TableRow key={`income-${item.category}`}>
                      <TableCell className="font-medium flex items-center gap-2"><Icon size={16} /> {item.category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.forecasted)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.realized)}</TableCell>
                      <TableCell className={cn("text-right font-semibold", item.difference < 0 ? "text-green-600" : item.difference > 0 ? "text-destructive" : "")}>
                        {formatCurrency(-item.difference)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Progress value={progress > 100 ? 100 : progress} className="w-2/3" />
                          <span className="text-xs font-mono w-1/3 text-left">{Math.round(progress)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {analysisData.detailedComparison.filter(d => d.type === 'expense').length > 0 && (
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={5} className="font-bold text-destructive">Despesas</TableCell>
                  </TableRow>
                )}
                {analysisData.detailedComparison.filter(d => d.type === 'expense').map(item => {
                  const Icon = getCategoryIcon(item.category);
                  const progress = item.forecasted > 0 ? (item.realized / item.forecasted) * 100 : item.realized > 0 ? 100 : 0;
                  return (
                    <TableRow key={`expense-${item.category}`}>
                      <TableCell className="font-medium flex items-center gap-2"><Icon size={16} /> {item.category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.forecasted)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.realized)}</TableCell>
                      <TableCell className={cn("text-right font-semibold", item.difference > 0 ? "text-green-600" : item.difference < 0 ? "text-destructive" : "")}>
                        {formatCurrency(item.difference)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Progress value={progress > 100 ? 100 : progress} indicatorClassName={progress > 100 ? "bg-destructive" : "bg-primary"} />
                          <span className="text-xs font-mono w-1/3 text-left">{Math.round(progress)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
