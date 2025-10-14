"use client";

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SpendingData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface MonthlySpendingBreakdownProps {
  transactions: Array<{
    id: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
  }>;
}

const CATEGORY_COLORS = [
  '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#84CC16', '#6366F1', '#F97316', '#14B8A6'
];

export function MonthlySpendingBreakdown({ transactions }: MonthlySpendingBreakdownProps) {
  const spendingData = React.useMemo(() => {
    const expenseTransactions = transactions.filter(t => 
      t.type === 'expense' && t.category !== 'Investimentos (saída)'
    );
    
    const totalExpenses = expenseTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
    
    if (totalExpenses === 0) return [];
    
    const categoryTotals = expenseTransactions.reduce((acc, t) => {
      const category = t.category || 'Outros';
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryTotals)
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8); // Top 8 categories
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return Math.abs(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (spendingData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum gasto registrado neste período
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {spendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            {spendingData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium truncate">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.percentage.toFixed(1)}%
                  </Badge>
                  <span className="text-sm font-medium">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}