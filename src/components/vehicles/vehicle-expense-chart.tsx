
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
import type { VehicleExpense } from '@/lib/types';
import { Fuel, Wrench, FileText, Shield, Ellipsis } from 'lucide-react';

const CHART_COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))',
];

const EXPENSE_TYPE_DETAILS: { [key in VehicleExpense['expenseType']]: { label: string; icon: React.ElementType } } = {
    fuel: { label: 'Combustível', icon: Fuel },
    maintenance: { label: 'Manutenção', icon: Wrench },
    documents: { label: 'Documentação', icon: FileText },
    insurance: { label: 'Seguro', icon: Shield },
    other: { label: 'Outros', icon: Ellipsis },
};


interface VehicleExpenseChartProps {
  expenses: VehicleExpense[];
}

export function VehicleExpenseChart({ expenses }: VehicleExpenseChartProps) {
  const expenseData = React.useMemo(() => {
    const spendingByType: { [key: string]: number } = {};

    expenses.forEach(expense => {
      const key = expense.expenseType;
      spendingByType[key] = (spendingByType[key] || 0) + expense.amount;
    });
    
    return Object.entries(spendingByType)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);
  }, [expenses]);

  const chartConfig = React.useMemo(() => {
    const config: any = {};
    expenseData.forEach((item, index) => {
      const details = EXPENSE_TYPE_DETAILS[item.name as VehicleExpense['expenseType']];
      const formattedValue = item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      config[item.name] = {
        label: (
          <div className="flex items-center gap-2">
            <span>{details?.label || item.name}</span>
            <span className="font-normal text-muted-foreground">{formattedValue}</span>
          </div>
        ),
        icon: details?.icon,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });
    return config;
  }, [expenseData]);

  const totalExpenses = React.useMemo(() => 
    expenseData.reduce((acc, item) => acc + item.value, 0)
  , [expenseData]);

  if (expenseData.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm">
              <Fuel className="h-5 w-5 text-white" />
            </div>
            Despesas por Tipo
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
            Distribuição de todos os gastos com o veículo
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <Fuel className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
            Nenhuma despesa registrada para visualização.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm">
            <Fuel className="h-5 w-5 text-white" />
          </div>
          Despesas por Tipo
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
          Distribuição dos gastos com veículo • <span className="font-semibold text-green-600 dark:text-green-400">R$ {totalExpenses.toFixed(2)} total</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="name" />}
              />
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                labelLine={false}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`expense-cell-${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
               <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
               />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
