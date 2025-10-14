"use client";

import * as React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyTrendsChartProps {
  transactions: Array<{
    id: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    category: string;
  }>;
  currentMonth: Date;
}

interface TrendData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  investments: number;
}

export function MonthlyTrendsChart({ transactions, currentMonth }: MonthlyTrendsChartProps) {
  const trendsData = React.useMemo(() => {
    const data: TrendData[] = [];
    
    // Get last 6 months including current
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(startOfMonth(currentMonth), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense' && t.category !== 'Investimentos (saída)')
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
      
      const investments = monthTransactions
        .filter(t => t.category === 'Investimentos (saída)')
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
      
      const balance = income - expenses - investments;
      
      data.push({
        month: format(monthDate, 'MMM/yy', { locale: ptBR }),
        income,
        expenses,
        balance,
        investments
      });
    }
    
    return data;
  }, [transactions, currentMonth]);

  const formatCurrency = (value: number) => {
    return Math.abs(value).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Tendência dos Últimos 6 Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Receitas"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Gastos"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="investments" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Investimentos"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#06B6D4" 
                strokeWidth={3}
                name="Saldo Líquido"
                dot={{ fill: '#06B6D4', strokeWidth: 2, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}