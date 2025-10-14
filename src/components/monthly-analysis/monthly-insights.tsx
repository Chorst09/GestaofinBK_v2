"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  PiggyBank,
  CreditCard,
  Lightbulb
} from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyInsightsProps {
  transactions: Array<{
    id: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    category: string;
  }>;
  currentMonth: Date;
  totalBalance: number;
  periodBalance: number;
}

interface Insight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  icon: React.ReactNode;
  title: string;
  description: string;
  value?: string;
}

export function MonthlyInsights({ 
  transactions, 
  currentMonth, 
  totalBalance, 
  periodBalance 
}: MonthlyInsightsProps) {
  const insights = React.useMemo(() => {
    const insights: Insight[] = [];
    
    // Current month data
    const currentMonthStart = startOfMonth(currentMonth);
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= currentMonthStart && 
             transactionDate < new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 0);
    });
    
    // Previous month data
    const previousMonth = subMonths(currentMonthStart, 1);
    const previousMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= previousMonth && 
             transactionDate < currentMonthStart;
    });
    
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const currentExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category !== 'Investimentos (saída)')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    
    const currentInvestments = currentMonthTransactions
      .filter(t => t.category === 'Investimentos (saída)')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    
    const previousIncome = previousMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const previousExpenses = previousMonthTransactions
      .filter(t => t.type === 'expense' && t.category !== 'Investimentos (saída)')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    
    // Balance analysis
    if (periodBalance > 0) {
      insights.push({
        type: 'positive',
        icon: <CheckCircle className="h-4 w-4" />,
        title: 'Mês Positivo',
        description: 'Você conseguiu economizar dinheiro este mês!',
        value: `+${periodBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
      });
    } else if (periodBalance < 0) {
      insights.push({
        type: 'negative',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Déficit no Mês',
        description: 'Seus gastos superaram sua receita este mês.',
        value: `${periodBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
      });
    }
    
    // Income comparison
    if (previousIncome > 0) {
      const incomeChange = ((currentIncome - previousIncome) / previousIncome) * 100;
      if (incomeChange > 5) {
        insights.push({
          type: 'positive',
          icon: <TrendingUp className="h-4 w-4" />,
          title: 'Receita em Alta',
          description: `Sua receita aumentou ${incomeChange.toFixed(1)}% em relação ao mês anterior.`
        });
      } else if (incomeChange < -5) {
        insights.push({
          type: 'warning',
          icon: <TrendingDown className="h-4 w-4" />,
          title: 'Receita em Queda',
          description: `Sua receita diminuiu ${Math.abs(incomeChange).toFixed(1)}% em relação ao mês anterior.`
        });
      }
    }
    
    // Expense comparison
    if (previousExpenses > 0) {
      const expenseChange = ((currentExpenses - previousExpenses) / previousExpenses) * 100;
      if (expenseChange > 10) {
        insights.push({
          type: 'warning',
          icon: <TrendingUp className="h-4 w-4" />,
          title: 'Gastos Aumentaram',
          description: `Seus gastos aumentaram ${expenseChange.toFixed(1)}% em relação ao mês anterior.`
        });
      } else if (expenseChange < -5) {
        insights.push({
          type: 'positive',
          icon: <TrendingDown className="h-4 w-4" />,
          title: 'Gastos Controlados',
          description: `Você reduziu seus gastos em ${Math.abs(expenseChange).toFixed(1)}% este mês.`
        });
      }
    }
    
    // Investment analysis
    if (currentInvestments > 0) {
      const investmentRate = (currentInvestments / currentIncome) * 100;
      if (investmentRate >= 20) {
        insights.push({
          type: 'positive',
          icon: <Target className="h-4 w-4" />,
          title: 'Excelente Taxa de Investimento',
          description: `Você investiu ${investmentRate.toFixed(1)}% da sua receita este mês.`
        });
      } else if (investmentRate >= 10) {
        insights.push({
          type: 'neutral',
          icon: <PiggyBank className="h-4 w-4" />,
          title: 'Boa Taxa de Investimento',
          description: `Você investiu ${investmentRate.toFixed(1)}% da sua receita este mês.`
        });
      }
    }
    
    // Spending pattern analysis
    const categoryTotals = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.category !== 'Investimentos (saída)')
      .reduce((acc, t) => {
        const category = t.category || 'Outros';
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory && currentExpenses > 0) {
      const categoryPercentage = (topCategory[1] / currentExpenses) * 100;
      if (categoryPercentage > 40) {
        insights.push({
          type: 'warning',
          icon: <CreditCard className="h-4 w-4" />,
          title: 'Concentração de Gastos',
          description: `${categoryPercentage.toFixed(1)}% dos seus gastos foram em "${topCategory[0]}".`
        });
      }
    }
    
    // General tips
    if (insights.length < 3) {
      insights.push({
        type: 'neutral',
        icon: <Lightbulb className="h-4 w-4" />,
        title: 'Dica do Mês',
        description: 'Considere revisar suas categorias de gastos para identificar oportunidades de economia.'
      });
    }
    
    return insights.slice(0, 4); // Limit to 4 insights
  }, [transactions, currentMonth, totalBalance, periodBalance]);

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getBadgeVariant = (type: Insight['type']) => {
    switch (type) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights do Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <Alert key={index} className={getInsightColor(insight.type)}>
              <div className="flex items-start gap-3">
                {insight.icon}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    {insight.value && (
                      <Badge variant={getBadgeVariant(insight.type)} className="text-xs">
                        {insight.value}
                      </Badge>
                    )}
                  </div>
                  <AlertDescription className="text-sm">
                    {insight.description}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}