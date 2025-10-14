"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, addMonths, parseISO, isWithinInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Transaction, ForecastItem, CreditCard } from '@/lib/types';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useForecasts } from '@/hooks/useForecasts';
import { useTransactions } from '@/hooks/useTransactions';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { BankLogo } from '@/components/layout/BankLogo';

interface CreditCardForecastChartProps {
  currentMonth?: Date;
}

interface ChartDataPoint {
  month: string;
  monthLabel: string;
  [key: string]: string | number; // Dynamic keys for each credit card
}

const CHART_COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
  'hsl(var(--chart-9))',
  'hsl(var(--chart-10))'
];

export function CreditCardForecastChart({ currentMonth = new Date() }: CreditCardForecastChartProps) {
  const { creditCards } = useCreditCards();
  const { forecastItems } = useForecasts();
  const { transactions } = useTransactions();

  const chartData = React.useMemo(() => {
    // Generate next 6 months including current month
    const months: Date[] = [];
    for (let i = 0; i < 6; i++) {
      months.push(addMonths(startOfMonth(currentMonth), i));
    }

    // Get credit cards with forecasts or transactions
    const relevantCreditCards = creditCards.filter(card => {
      const hasForecasts = forecastItems.some(item => 
        item.creditCardId === card.id && item.type === 'expense'
      );
      const hasTransactions = transactions.some(transaction => 
        transaction.creditCardId === card.id && transaction.type === 'expense'
      );
      return hasForecasts || hasTransactions;
    });

    if (relevantCreditCards.length === 0) {
      return [];
    }

    const data: ChartDataPoint[] = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthKey = monthStart.toISOString();
      const monthLabel = format(monthStart, 'MMM/yy', { locale: ptBR });

      const dataPoint: ChartDataPoint = {
        month: monthKey,
        monthLabel,
      };

      relevantCreditCards.forEach(card => {
        const cardKey = `${card.bankName}_${card.cardFlag}`;
        
        // Get forecasted expenses for this card and month
        const forecastedAmount = forecastItems
          .filter(item => 
            item.creditCardId === card.id && 
            item.type === 'expense' &&
            item.date === monthKey
          )
          .reduce((sum, item) => sum + Math.abs(item.amount), 0);

        // Get actual expenses for this card and month (for past/current months)
        const actualAmount = transactions
          .filter(transaction => {
            if (transaction.creditCardId !== card.id || transaction.type !== 'expense') {
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

        // Use actual amount if available (past months), otherwise use forecast
        const isPastMonth = monthStart < startOfMonth(new Date());
        dataPoint[cardKey] = isPastMonth ? actualAmount : forecastedAmount;
      });

      return dataPoint;
    });

    return data;
  }, [creditCards, forecastItems, transactions, currentMonth]);

  const chartConfig = React.useMemo(() => {
    const config: any = {};
    const relevantCreditCards = creditCards.filter(card => {
      const hasForecasts = forecastItems.some(item => 
        item.creditCardId === card.id && item.type === 'expense'
      );
      const hasTransactions = transactions.some(transaction => 
        transaction.creditCardId === card.id && transaction.type === 'expense'
      );
      return hasForecasts || hasTransactions;
    });

    relevantCreditCards.forEach((card, index) => {
      const cardKey = `${card.bankName}_${card.cardFlag}`;
      config[cardKey] = {
        label: `${card.bankName} (${card.cardFlag})`,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return config;
  }, [creditCards, forecastItems, transactions]);

  const totalForecastedAmount = React.useMemo(() => {
    return chartData.reduce((total, monthData) => {
      return total + Object.keys(chartConfig).reduce((monthTotal, cardKey) => {
        return monthTotal + (Number(monthData[cardKey]) || 0);
      }, 0);
    }, 0);
  }, [chartData, chartConfig]);

  if (chartData.length === 0 || Object.keys(chartConfig).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Previsão de Gastos - Cartões de Crédito
          </CardTitle>
          <CardDescription>
            Previsão de gastos com cartões de crédito nos próximos meses.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <CreditCardIcon className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
            Nenhuma previsão de gastos com cartões encontrada.<br />
            <span className="text-sm">Adicione previsões na seção de Previsões para visualizar este gráfico.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
            <CreditCardIcon className="h-5 w-5 text-white" />
          </div>
          Previsão de Gastos - Cartões
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
          Próximos 6 meses • <span className="font-semibold text-blue-600 dark:text-blue-400">R$ {totalForecastedAmount.toFixed(2)} total</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2 pr-6 pb-6 pt-0">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
                      const configEntry = chartConfig[nameKey as string];
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
              {Object.keys(chartConfig).map((cardKey) => (
                <Bar
                  key={cardKey}
                  dataKey={cardKey}
                  name={chartConfig[cardKey].label}
                  fill={chartConfig[cardKey].color}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}