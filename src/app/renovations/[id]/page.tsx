"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRenovations } from '@/hooks/useRenovations';
import { useRenovationExpenses } from '@/hooks/useRenovationExpenses';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Hammer,
  PlusCircle,
  List,
  Users,
  Package,
  Shield
} from 'lucide-react';
import { BudgetProgressBar } from '@/components/renovations/budget-progress-bar';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Renovation } from '@/lib/types';

const statusLabels: Record<Renovation['status'], { label: string; variant: any; icon: any }> = {
  planned: { label: 'Planejada', variant: 'secondary', icon: Clock },
  in_progress: { label: 'Em Andamento', variant: 'default', icon: Hammer },
  completed: { label: 'Concluída', variant: 'outline', icon: CheckCircle2 },
  on_hold: { label: 'Pausada', variant: 'destructive', icon: AlertTriangle },
};

export default function RenovationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const renovationId = params.id as string;
  
  const { getRenovationById } = useRenovations();
  const { renovationExpenses } = useRenovationExpenses();
  const { transactions } = useTransactions();

  const renovation = getRenovationById(renovationId);

  if (!renovation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Reforma não encontrada</h2>
        <Button onClick={() => router.push('/renovations')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Reformas
        </Button>
      </div>
    );
  }

  const expenses = renovationExpenses.filter(exp => exp.renovationId === renovationId);
  const expenseTransactions = expenses.map(exp => 
    transactions.find(t => t.id === exp.transactionId)
  ).filter(Boolean);
  
  const totalSpent = expenseTransactions.reduce((sum, t) => sum + Math.abs(t!.amount), 0);
  const budgetProgress = (totalSpent / renovation.adjustedBudget) * 100;
  const remaining = renovation.adjustedBudget - totalSpent;
  const safetyMarginAmount = renovation.totalBudget * (renovation.safetyMarginPercent / 100);
  const daysCount = differenceInDays(parseISO(renovation.endDate), parseISO(renovation.startDate)) + 1;
  const isOverBudget = budgetProgress > 100;
  const isNearLimit = budgetProgress >= 80 && budgetProgress < 100;

  const statusConfig = statusLabels[renovation.status];
  const StatusIcon = statusConfig.icon;

  // Calcular gastos por etapa
  const stageSpending = renovation.stages.map(stage => {
    const stageExpenses = expenses.filter(exp => exp.stageId === stage.id);
    const stageTransactions = stageExpenses.map(exp => 
      transactions.find(t => t.id === exp.transactionId)
    ).filter(Boolean);
    const spent = stageTransactions.reduce((sum, t) => sum + Math.abs(t!.amount), 0);
    return { ...stage, spent };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/renovations')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Título e Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-headline">{renovation.name}</h1>
            <Badge variant={statusConfig.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(parseISO(renovation.startDate), 'dd/MM/yyyy', { locale: ptBR })} - {format(parseISO(renovation.endDate), 'dd/MM/yyyy', { locale: ptBR })}
              <span className="ml-1">({daysCount} {daysCount === 1 ? 'dia' : 'dias'})</span>
            </div>
          </div>
          {renovation.description && (
            <p className="text-muted-foreground mt-2">{renovation.description}</p>
          )}
        </div>
        <Button onClick={() => router.push(`/renovations/${renovationId}/edit`)}>
          Editar Reforma
        </Button>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Orçamento Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {renovation.totalBudget.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Margem de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {safetyMarginAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {renovation.safetyMarginPercent}% do orçamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              Total Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : ''}`}>
              R$ {totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} {expenses.length === 1 ? 'despesa' : 'despesas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Saldo Restante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              R$ {remaining.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {budgetProgress.toFixed(1)}% utilizado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso do Orçamento - Componente Avançado */}
      <BudgetProgressBar
        totalBudget={renovation.totalBudget}
        adjustedBudget={renovation.adjustedBudget}
        totalSpent={totalSpent}
        safetyMarginPercent={renovation.safetyMarginPercent}
        showDetails={true}
      />

      {/* Etapas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Etapas da Reforma</CardTitle>
              <CardDescription>
                {renovation.stages.filter(s => s.status === 'completed').length} de {renovation.stages.length} concluídas
              </CardDescription>
            </div>
            <Button onClick={() => router.push(`/renovations/${renovationId}/stages`)}>
              <List className="mr-2 h-4 w-4" />
              Gerenciar Etapas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renovation.stages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma etapa cadastrada ainda</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push(`/renovations/${renovationId}/stages`)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Primeira Etapa
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stageSpending.map((stage) => {
                const stageProgress = (stage.spent / stage.budget) * 100;
                const stageRemaining = stage.budget - stage.spent;
                
                return (
                  <div key={stage.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{stage.name}</span>
                        <Badge variant={
                          stage.status === 'completed' ? 'default' : 
                          stage.status === 'in_progress' ? 'secondary' : 
                          'outline'
                        }>
                          {stage.status === 'completed' ? 'Concluída' : 
                           stage.status === 'in_progress' ? 'Em Andamento' : 
                           'Não Iniciada'}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <span className={stageProgress > 100 ? 'text-destructive font-medium' : ''}>
                          R$ {stage.spent.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground"> / R$ {stage.budget.toFixed(2)}</span>
                      </div>
                    </div>
                    <Progress value={Math.min(stageProgress, 100)} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{stageProgress.toFixed(1)}% utilizado</span>
                      <span className={stageRemaining >= 0 ? 'text-green-600' : 'text-destructive'}>
                        {stageRemaining >= 0 ? 'Restam' : 'Excedeu'} R$ {Math.abs(stageRemaining).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-20"
          onClick={() => router.push(`/renovations/${renovationId}/expenses`)}
        >
          <div className="flex flex-col items-center gap-2">
            <DollarSign className="h-6 w-6" />
            <span>Adicionar Despesa</span>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20"
          onClick={() => router.push(`/renovations/${renovationId}/suppliers`)}
        >
          <div className="flex flex-col items-center gap-2">
            <Users className="h-6 w-6" />
            <span>Fornecedores</span>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-20"
          onClick={() => router.push(`/renovations/${renovationId}/materials`)}
        >
          <div className="flex flex-col items-center gap-2">
            <Package className="h-6 w-6" />
            <span>Materiais</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
