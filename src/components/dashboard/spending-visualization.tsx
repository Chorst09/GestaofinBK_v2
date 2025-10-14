
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Transaction } from '@/lib/types';
import { useAllCategories } from '@/hooks/useAllCategories';
import { useCreditCards } from '@/hooks/useCreditCards';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard as CreditCardIcon } from 'lucide-react';

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

interface SpendingVisualizationProps {
  transactions: Transaction[];
}

export function SpendingVisualization({ transactions }: SpendingVisualizationProps) {
  const { getCreditCardById } = useCreditCards();
  const { getCategoryByName } = useAllCategories();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const spendingData = React.useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    const expenses = transactions.filter(t => t && t.type === 'expense');
    const spendingByCategory: { [key: string]: number } = {};

    expenses.forEach(expense => {
      if (!expense) return;
      let graphCategoryKey = expense.category || 'Não Categorizado';
      const categoryConfig = getCategoryByName(expense.category);

      if (categoryConfig?.isCreditCard) {
        if (expense.creditCardId) {
          const card = getCreditCardById(expense.creditCardId);
          if (card) {
            graphCategoryKey = `${card.bankName} (${card.cardFlag})`;
          } else {
            graphCategoryKey = `Cartão ID ${expense.creditCardId.substring(0,6)} (Inválido)`;
          }
        } else if (expense.cardBrand) {
          graphCategoryKey = `Cartão ${expense.cardBrand} (Manual)`;
        } else {
          graphCategoryKey = 'Cartão de Crédito (Outros)';
        }
      }
      
      spendingByCategory[graphCategoryKey] = (spendingByCategory[graphCategoryKey] || 0) + Math.abs(expense.amount);
    });
    
    return Object.entries(spendingByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);
  }, [transactions, getCreditCardById, getCategoryByName]);

  const totalExpenses = React.useMemo(() => 
    spendingData.reduce((acc, item) => acc + item.value, 0)
  , [spendingData]);

  const chartConfig = React.useMemo(() => {
    const config: any = {};
    spendingData.forEach((item, index) => {
      const categoryDetails = getCategoryByName(item.name);
      config[item.name] = {
        label: item.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
        icon: categoryDetails?.icon || CreditCardIcon, // Fallback to CreditCard icon if no category found
      };
    });
    return config;
  }, [spendingData, getCategoryByName]);

  if (spendingData.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-sm">
              <CreditCardIcon className="h-5 w-5 text-white" />
            </div>
            Visualização de Despesas
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
            Seus hábitos de consumo por categoria e banco do cartão
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <CreditCardIcon className="h-8 w-8 text-slate-400" />
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
          <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-sm">
            <CreditCardIcon className="h-5 w-5 text-white" />
          </div>
          Visualização de Despesas
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
          Seus hábitos de consumo por categoria • <span className="font-semibold text-pink-600 dark:text-pink-400">R$ {totalExpenses.toFixed(2)} total</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isClient ? (
              <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full min-h-[250px] max-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={spendingData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        innerRadius="50%"
                        labelLine={false}
                    >
                        {spendingData.map((entry, index) => (
                        <Cell key={`spending-cell-${entry.name}-${index}`} fill={chartConfig[entry.name]?.color || '#8884d8'} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="mx-auto aspect-square h-full min-h-[250px] max-h-[300px] bg-muted animate-pulse rounded-lg" />
            )}

            <div className="max-h-[300px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">%</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {spendingData.map((item, index) => {
                            const percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                            const Icon = chartConfig[item.name]?.icon;
                            const color = chartConfig[item.name]?.color;
                            return (
                                <TableRow key={`spending-row-${item.name}-${index}`}>
                                    <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
                                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                        <span className="truncate">{item.name}</span>
                                    </div>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{percentage.toFixed(0)}%</TableCell>
                                    <TableCell className="text-right font-semibold">R$ {item.value.toFixed(2)}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
