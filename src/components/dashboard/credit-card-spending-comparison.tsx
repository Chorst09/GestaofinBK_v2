"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, subMonths, parseISO, isWithinInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Transaction, ForecastItem } from '@/lib/types';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useForecasts } from '@/hooks/useForecasts';
import { useTransactions } from '@/hooks/useTransactions';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CreditCardSpendingComparisonProps {
  currentMonth?: Date;
}

interface ComparisonDataPoint {
  month: string;
  monthLabel: string;
  forecasted: number;
  actual: number;
  difference: number;
}

const chartConfig = {
  forecasted: {
    label: "Previsto",
    color: "hsl(var(--chart-2))",
  },
  actual: {
    label: "Realizado", 
    color: "hsl(var(--chart-1))",
  },
  difference: {
    label: "Diferença",
    color: "hsl(var(--chart-3))",
  },
};

export function CreditCardSpendingComparison({ currentMonth = new Date() }: CreditCardSpendingComparisonProps) {
  const { creditCards } = useCreditCards();
  const { forecastItems } = useForecasts();
  const { transactions } = useTransactions();

  const comparisonData = React.useMemo(() => {
    // Generate last 6 months including current month
    const months: Date[] = [];
    for (let i = 5; i >= 0; i--) {
      months.push(subMonths(startOfMonth(currentMonth), i));
    }

    const data: ComparisonDataPoint[] = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthKey = monthStart.toISOString();
      const monthLabel = format(monthStart, 'MMM/yy', { locale: ptBR });

      // Get all forecasted credit card expenses for this month
      const forecastedAmount = forecastItems
        .filter(item => 
          item.type === 'expense' &&
          item.creditCardId &&
          item.date === monthKey
        )
        .reduce((sum, item) => sum + Math.abs(item.amount), 0);

      // Get all actual credit card expenses for this month
      const actualAmount = transactions
        .filter(transaction => {
          if (transaction.type !== 'expense' || !transaction.creditCardId) {
            return false;
          }
          try {
            const transactionDate = parseISO(transaction.date);
            return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
          } catch {
            return false;
          }
        })
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

      const difference = actualAmount - forecastedAmount;

      return {
        month: monthKey,
        monthLabel,
        forecasted: forecastedAmount,
        actual: actualAmount,
        difference,
      };
    });

    return data.filter(d => d.forecasted > 0 || d.actual > 0);
  }, [forecastItems, transactions, currentMonth, creditCards]);

  const summary = React.useMemo(() => {
    const totalForecasted = comparisonData.reduce((sum, d) => sum + d.forecasted, 0);
    const totalActual = comparisonData.reduce((sum, d) => sum + d.actual, 0);
    const totalDifference = totalActual - totalForecasted;
    const accuracy = totalForecasted > 0 ? ((totalForecasted - Math.abs(totalDifference)) / totalForecasted) * 100 : 0;

    return {
      totalForecasted,
      totalActual,
      totalDifference,
      accuracy: Math.max(0, accuracy),
    };
  }, [comparisonData]);

  if (comparisonData.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Previsto vs Realizado
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
            Comparação entre gastos previstos e realizados com cartões de crédito
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <TrendingUp className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
            Nenhum dado disponível para comparação.<br />
            <span className="text-sm">Adicione previsões e transações com cartões para visualizar este gráfico.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  const getDifferenceIcon = (difference: number) => {
    if (difference > 0) return <TrendingUp className="h-3 w-3" />;
    if (difference < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getDifferenceVariant = (difference: number) => {
    if (difference > 0) return "destructive" as const;
    if (difference < 0) return "default" as const;
    return "secondary" as const;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          Previsto vs Realizado - Cartões de Crédito
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <span>Comparação entre gastos previstos e realizados nos últimos 6 meses.</span>
          <Badge variant="outline" className="flex items-center gap-1">
            Precisão: {summary.accuracy.toFixed(1)}%
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Total Previsto</div>
            <div className="text-lg font-semibold text-chart-2">
              R$ {summary.totalForecasted.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Total Realizado</div>
            <div className="text-lg font-semibold text-chart-1">
              R$ {summary.totalActual.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              Diferença
              {getDifferenceIcon(summary.totalDifference)}
            </div>
            <div className={`text-lg font-semibold ${
              summary.totalDifference > 0 ? 'text-destructive' : 
              summary.totalDifference < 0 ? 'text-accent-foreground' : 'text-muted-foreground'
            }`}>
              R$ {Math.abs(summary.totalDifference).toFixed(2)}
              {summary.totalDifference > 0 ? ' acima' : summary.totalDifference < 0 ? ' abaixo' : ''}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="pl-2 pr-6 pb-6 pt-4">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={comparisonData}
                margin={{
                  top: 20,
                  right: 5,
                  left: 15,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={80}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `Mês: ${label}`}
                      formatter={(value, nameKey) => {
                        const numValue = Number(value);
                        const formattedValue = numValue.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        });
                        const configEntry = chartConfig[nameKey as keyof typeof chartConfig];
                        return [formattedValue, configEntry?.label || nameKey];
                      }}
                    />
                  }
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ paddingBottom: '20px' }}
                />
                <Bar
                  dataKey="forecasted"
                  name={chartConfig.forecasted.label}
                  fill={chartConfig.forecasted.color}
                  radius={[2, 2, 0, 0]}
                  opacity={0.8}
                />
                <Bar
                  dataKey="actual"
                  name={chartConfig.actual.label}
                  fill={chartConfig.actual.color}
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="difference"
                  stroke={chartConfig.difference.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={chartConfig.difference.label}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Monthly Details */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Detalhes por Mês</h4>
          <div className="grid gap-2">
            {comparisonData.map((data) => (
              <div key={data.month} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                <span className="text-sm font-medium">{data.monthLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Prev: R$ {data.forecasted.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Real: R$ {data.actual.toFixed(2)}
                  </span>
                  <Badge variant={getDifferenceVariant(data.difference)} className="text-xs flex items-center gap-1">
                    {getDifferenceIcon(data.difference)}
                    R$ {Math.abs(data.difference).toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}