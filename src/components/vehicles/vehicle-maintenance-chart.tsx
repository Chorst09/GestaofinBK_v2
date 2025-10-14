
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import type { VehicleExpense } from '@/lib/types';
import { Wrench } from 'lucide-react';

const CHART_COLORS = [
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
  'hsl(var(--chart-9))',
  'hsl(var(--chart-10))',
];

interface VehicleMaintenanceChartProps {
  expenses: VehicleExpense[];
}

export function VehicleMaintenanceChart({ expenses }: VehicleMaintenanceChartProps) {
  const maintenanceData = React.useMemo(() => {
    const maintenanceExpenses = expenses.filter(e => e.expenseType === 'maintenance' && e.maintenanceType);
    const spendingByType: { [key: string]: number } = {};

    maintenanceExpenses.forEach(expense => {
      const key = expense.maintenanceType || 'Outros Serviços';
      spendingByType[key] = (spendingByType[key] || 0) + expense.amount;
    });
    
    return Object.entries(spendingByType)
      .map(([name, value]) => ({ name, total: value }))
      .sort((a,b) => b.total - a.total);
  }, [expenses]);

  const chartConfig = React.useMemo(() => {
    const config: any = {};
    maintenanceData.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });
    return config;
  }, [maintenanceData]);

  const totalMaintenance = React.useMemo(() => 
    maintenanceData.reduce((acc, item) => acc + item.total, 0)
  , [maintenanceData]);

  if (maintenanceData.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-sm">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            Manutenção por Categoria
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
            Detalhamento dos custos de manutenção
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <Wrench className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
            Nenhuma despesa de manutenção com categoria registrada.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-sm">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          Manutenção por Categoria
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
          Detalhamento dos custos de manutenção • <span className="font-semibold text-cyan-600 dark:text-cyan-400">R$ {totalMaintenance.toFixed(2)} total</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart layout="vertical" data={maintenanceData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={150}
                className="text-xs"
              />
              <XAxis dataKey="total" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="total" layout="vertical" radius={4}>
                 {maintenanceData.map((entry, index) => (
                    <Cell key={`maintenance-cell-${entry.name}-${index}`} fill={chartConfig[entry.name]?.color || CHART_COLORS[0]} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
