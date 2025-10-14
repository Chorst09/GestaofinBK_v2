"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyGoalsProgressProps {
  goalContributions: Array<{
    id: string;
    goalId: string;
    amount: number;
    date: string;
  }>;
  financialGoals: Array<{
    id: string;
    name: string;
    targetAmount: number;
    startDate: string;
    endDate: string;
  }>;
  period: {
    start: Date;
    end: Date;
  };
}

export function MonthlyGoalsProgress({ 
  goalContributions, 
  financialGoals, 
  period 
}: MonthlyGoalsProgressProps) {
  const goalsData = React.useMemo(() => {
    return financialGoals.map(goal => {
      const monthlyContributions = goalContributions.filter(contribution => 
        contribution.goalId === goal.id && 
        isWithinInterval(parseISO(contribution.date), period)
      );
      
      const monthlyTotal = monthlyContributions.reduce((acc, c) => acc + c.amount, 0);
      
      // Calculate current amount from all contributions
      const allContributions = goalContributions.filter(c => c.goalId === goal.id);
      const currentAmount = allContributions.reduce((acc, c) => acc + c.amount, 0);
      
      const progressPercentage = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;
      const isCompleted = currentAmount >= goal.targetAmount;
      
      // Calculate monthly target (simple estimation)
      const targetDate = new Date(goal.endDate);
      const today = new Date();
      const monthsRemaining = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      const remainingAmount = Math.max(0, goal.targetAmount - currentAmount);
      const suggestedMonthlyContribution = remainingAmount / monthsRemaining;
      
      return {
        ...goal,
        currentAmount,
        monthlyContributions: monthlyTotal,
        progressPercentage: Math.min(100, progressPercentage),
        isCompleted,
        suggestedMonthlyContribution,
        monthsRemaining
      };
    }).sort((a, b) => b.monthlyContributions - a.monthlyContributions);
  }, [goalContributions, financialGoals, period]);

  const formatCurrency = (value: number) => {
    return Math.abs(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalMonthlyContributions = goalsData.reduce((acc, goal) => acc + goal.monthlyContributions, 0);

  if (goalsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progresso das Metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma meta financeira cadastrada</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Target className="h-5 w-5" />
          Progresso das Metas
        </CardTitle>
        {totalMonthlyContributions > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Total investido este mês: {formatCurrency(totalMonthlyContributions)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goalsData.map((goal) => (
            <div key={goal.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{goal.name}</h4>
                  {goal.isCompleted && (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Concluída
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {goal.progressPercentage.toFixed(1)}% concluído
                  </div>
                </div>
              </div>
              
              <Progress value={goal.progressPercentage} className="h-2" />
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Este mês</div>
                    <div className="text-muted-foreground">
                      {formatCurrency(goal.monthlyContributions)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Sugerido/mês</div>
                    <div className="text-muted-foreground">
                      {formatCurrency(goal.suggestedMonthlyContribution)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium">Prazo</div>
                    <div className="text-muted-foreground">
                      {format(new Date(goal.endDate), 'MMM/yyyy', { locale: ptBR })}
                    </div>
                  </div>
                </div>
              </div>
              
              {goal.monthlyContributions > 0 && goal.suggestedMonthlyContribution > 0 && (
                <div className="mt-2">
                  {goal.monthlyContributions >= goal.suggestedMonthlyContribution ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Meta mensal atingida!
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Faltam {formatCurrency(goal.suggestedMonthlyContribution - goal.monthlyContributions)} para a meta mensal
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}