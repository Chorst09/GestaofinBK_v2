
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ForecastItem } from '@/lib/types';
import { TRANSACTION_CATEGORIES, getCategoryByName } from '@/components/transactions/categories';
import { useCreditCards } from '@/hooks/useCreditCards';

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

interface ForecastedCardSpendingChartProps {
  forecastItems: ForecastItem[];
}

export function ForecastedCardSpendingChart({ forecastItems }: ForecastedCardSpendingChartProps) {
  const { getCreditCardById } = useCreditCards();
  const creditCardCategory = TRANSACTION_CATEGORIES.find(c => c.isCreditCard && c.type === 'expense');
  const creditCardCategoryName = creditCardCategory?.name || 'Cartão de Crédito';

  const forecastedCardSpendingData = React.useMemo(() => {
    const expenses = forecastItems.filter(
      item => item.type === 'expense' && item.category === creditCardCategoryName
    );
    const spendingByCard: { [key: string]: number } = {};

    expenses.forEach(expense => {
      let graphCategoryKey: string;

      if (expense.creditCardId) {
        const card = getCreditCardById(expense.creditCardId);
        if (card) {
          graphCategoryKey = `${card.bankName} (${card.cardFlag})`;
        } else {
          // Fallback if card is somehow not found, though unlikely if data is clean
          graphCategoryKey = `Cartão ID ${expense.creditCardId.substring(0,6)} (Inválido)`;
        }
      } else if (expense.explicitBankName) {
        graphCategoryKey = `${expense.explicitBankName} (Manual)`;
      } else {
        graphCategoryKey = 'Cartão de Crédito (Outros)';
      }
      
      spendingByCard[graphCategoryKey] = (spendingByCard[graphCategoryKey] || 0) + Math.abs(expense.amount);
    });
    
    return Object.entries(spendingByCard)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);
  }, [forecastItems, getCreditCardById, creditCardCategoryName]);

  const chartConfig = React.useMemo(() => {
    const config: any = {};
    forecastedCardSpendingData.forEach((item, index) => {
      const formattedValue = item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      config[item.name] = {
        label: (
          <div className="flex items-center gap-2">
            <span>{item.name}</span>
            <span className="font-normal text-muted-foreground">{formattedValue}</span>
          </div>
        ),
        color: CHART_COLORS[index % CHART_COLORS.length],
        // Icon logic can be added if needed, similar to SpendingVisualization
      };
    });
    return config;
  }, [forecastedCardSpendingData]);

  if (forecastedCardSpendingData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Detalhamento: Previsão de Despesas com Cartões</CardTitle>
          <CardDescription>Distribuição das suas previsões de gastos com cartão de crédito.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhuma previsão de despesa com cartão para visualizar.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Detalhamento: Previsão de Despesas com Cartões</CardTitle>
        <CardDescription>Distribuição das suas previsões de gastos com cartão de crédito.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px] sm:max-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="name" />}
              />
              <Pie
                data={forecastedCardSpendingData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + (radius + 10) * Math.cos(-midAngle * RADIAN);
                  const y = cy + (radius + 10) * Math.sin(-midAngle * RADIAN);
                  const percentage = (percent * 100).toFixed(0);
                  
                  if (parseFloat(percentage) < 5) return null; 

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="hsl(var(--foreground))"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-xs fill-foreground"
                    >
                      {`${name} (${percentage}%)`}
                    </text>
                  );
                }}
              >
                {forecastedCardSpendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
               <ChartLegend content={<ChartLegendContent nameKey="name" className="flex-wrap justify-center lg:justify-start" />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

