
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
import { useAllCategories } from '@/hooks/useAllCategories';

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

interface ForecastedCategorySpendingChartProps {
  forecastItems: ForecastItem[];
}

export function ForecastedCategorySpendingChart({ forecastItems }: ForecastedCategorySpendingChartProps) {
  const { getCategoryByName } = useAllCategories();
  
  const forecastedSpendingData = React.useMemo(() => {
    const expenses = forecastItems.filter(item => item.type === 'expense');
    const spendingByCategory: { [key: string]: number } = {};

    expenses.forEach(expense => {
      const categoryKey = expense.category || 'Não Categorizado';
      spendingByCategory[categoryKey] = (spendingByCategory[categoryKey] || 0) + Math.abs(expense.amount);
    });
    
    return Object.entries(spendingByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);
  }, [forecastItems]);

  const chartConfig = React.useMemo(() => {
    const config: any = {};
    forecastedSpendingData.forEach((item, index) => {
        const categoryDetails = getCategoryByName(item.name);
        const formattedValue = item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      config[item.name] = {
        label: (
          <div className="flex items-center gap-2">
            <span>{item.name}</span>
            <span className="font-normal text-muted-foreground">{formattedValue}</span>
          </div>
        ),
        color: CHART_COLORS[index % CHART_COLORS.length],
        icon: categoryDetails?.icon
      };
    });
    return config;
  }, [forecastedSpendingData, getCategoryByName]);

  if (forecastedSpendingData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Previsão de Gastos por Categoria</CardTitle>
          <CardDescription>Distribuição das suas despesas previstas por categoria.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhuma previsão de despesa para visualizar.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Previsão de Gastos por Categoria</CardTitle>
        <CardDescription>Distribuição das suas despesas previstas por categoria.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px] sm:max-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                    hideLabel 
                    nameKey="name"
                    formatter={(value, name) => {
                        const numValue = Number(value);
                        const formattedValue = isNaN(numValue) ? '0.00' : numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                        return (
                             <div className="flex items-center gap-2">
                                <div
                                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                    style={{ backgroundColor: chartConfig[name as string]?.color }}
                                />
                                <div className="flex flex-1 justify-between">
                                    <span className="text-muted-foreground">{name}</span>
                                    <span className="font-bold">{formattedValue}</span>
                                </div>
                            </div>
                        )
                    }}
                />}
              />
              <Pie
                data={forecastedSpendingData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, value, percent }) => {
                    if (percent < 0.05) return null; // Don't render labels for small slices
                  
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="hsl(var(--primary-foreground))"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-xs font-bold"
                        style={{ textShadow: '0px 0px 4px rgba(0,0,0,0.6)' }}
                      >
                        {`R$${Math.round(Number(value))}`}
                      </text>
                    );
                  }}
              >
                {forecastedSpendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color || CHART_COLORS[0]} />
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
