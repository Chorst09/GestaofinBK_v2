"use client";

import * as React from 'react';
import { useRenovations } from '@/hooks/useRenovations';
import { useRenovationExpenses } from '@/hooks/useRenovationExpenses';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Renovation } from '@/lib/types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign,
  Hammer,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const statusLabels: Record<Renovation['status'], { label: string; variant: any; icon: any }> = {
  planned: { label: 'Planejada', variant: 'secondary', icon: Clock },
  in_progress: { label: 'Em Andamento', variant: 'default', icon: Hammer },
  completed: { label: 'Concluída', variant: 'outline', icon: CheckCircle2 },
  on_hold: { label: 'Pausada', variant: 'destructive', icon: AlertTriangle },
};

export default function RenovationsPage() {
  const router = useRouter();
  const {
    renovations,
    deleteRenovation,
  } = useRenovations();
  
  const { renovationExpenses } = useRenovationExpenses();
  const { transactions } = useTransactions();
  const { toast } = useToast();

  const [deleteTarget, setDeleteTarget] = React.useState<Renovation | null>(null);

  const handleDeleteConfirmation = (renovation: Renovation) => {
    setDeleteTarget(renovation);
  };

  const executeDelete = () => {
    if (!deleteTarget) return;
    deleteRenovation(deleteTarget.id);
    toast({ title: "Reforma excluída", description: "A reforma foi removida com sucesso." });
    setDeleteTarget(null);
  };

  const getTotalSpent = (renovationId: string) => {
    const expenses = renovationExpenses.filter(exp => exp.renovationId === renovationId);
    const expenseTransactions = expenses.map(exp => 
      transactions.find(t => t.id === exp.transactionId)
    ).filter(Boolean);
    return expenseTransactions.reduce((sum, t) => sum + Math.abs(t!.amount), 0);
  };

  const getSafetyMarginAmount = (renovation: Renovation) => {
    return renovation.totalBudget * (renovation.safetyMarginPercent / 100);
  };

  const getStatusBadge = (status: Renovation['status']) => {
    const config = statusLabels[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Planejamento de Reformas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus projetos de reforma, controle orçamentos e acompanhe o progresso
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button onClick={() => router.push('/renovations/new')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Reforma
          </Button>
        </div>
      </div>

      {renovations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Hammer className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma reforma cadastrada</h3>
            <p className="text-muted-foreground text-center mb-6">
              Comece criando seu primeiro projeto de reforma para controlar custos e progresso
            </p>
            <Button onClick={() => router.push('/renovations/new')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Primeira Reforma
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {renovations.map((renovation) => {
            const totalSpent = getTotalSpent(renovation.id);
            const safetyMarginAmount = getSafetyMarginAmount(renovation);
            const budgetProgress = (totalSpent / renovation.adjustedBudget) * 100;
            const remaining = renovation.adjustedBudget - totalSpent;
            const hasExceededBase = totalSpent > renovation.totalBudget;
            const daysCount = differenceInDays(parseISO(renovation.endDate), parseISO(renovation.startDate)) + 1;
            const isOverBudget = budgetProgress > 100;
            const isNearLimit = budgetProgress >= 80 && budgetProgress < 100;

            return (
              <Card key={renovation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-2xl font-headline">{renovation.name}</CardTitle>
                        {getStatusBadge(renovation.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(parseISO(renovation.startDate), 'dd/MM/yyyy', { locale: ptBR })} - {format(parseISO(renovation.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                          <span className="ml-1">({daysCount} {daysCount === 1 ? 'dia' : 'dias'})</span>
                        </div>
                      </div>
                      {renovation.description && (
                        <p className="text-sm text-muted-foreground mt-2">{renovation.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => router.push(`/renovations/${renovation.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.push(`/renovations/${renovation.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive" 
                        onClick={() => handleDeleteConfirmation(renovation)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-6">
                  {/* Resumo Financeiro */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Orçamento Base
                      </div>
                      <div className="text-xl font-bold">
                        R$ {renovation.totalBudget.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 text-blue-600" />
                        Margem ({renovation.safetyMarginPercent}%)
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        R$ {safetyMarginAmount.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingDown className="h-4 w-4" />
                        Total Gasto
                      </div>
                      <div className={`text-xl font-bold ${isOverBudget ? 'text-destructive' : hasExceededBase ? 'text-orange-600' : ''}`}>
                        R$ {totalSpent.toFixed(2)}
                      </div>
                      {hasExceededBase && !isOverBudget && (
                        <div className="text-xs text-orange-600">Usando margem</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        Saldo Restante
                      </div>
                      <div className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        R$ {remaining.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso do Orçamento</span>
                      <span className={`font-medium ${isOverBudget ? 'text-destructive' : isNearLimit ? 'text-orange-600' : ''}`}>
                        {budgetProgress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(budgetProgress, 100)} 
                      className={isOverBudget ? 'bg-red-100' : isNearLimit ? 'bg-orange-100' : ''}
                    />
                    {isOverBudget && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Orçamento excedido em R$ {Math.abs(remaining).toFixed(2)}</span>
                      </div>
                    )}
                    {isNearLimit && !isOverBudget && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Atenção! Você já utilizou {budgetProgress.toFixed(1)}% do orçamento</span>
                      </div>
                    )}
                  </div>

                  {/* Etapas */}
                  {renovation.stages.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Etapas: {renovation.stages.filter(s => s.status === 'completed').length} / {renovation.stages.length} concluídas
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {renovation.stages.slice(0, 5).map(stage => (
                          <Badge key={stage.id} variant={stage.status === 'completed' ? 'default' : 'outline'}>
                            {stage.name}
                          </Badge>
                        ))}
                        {renovation.stages.length > 5 && (
                          <Badge variant="secondary">+{renovation.stages.length - 5} mais</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta reforma? Esta ação não pode ser desfeita.
              As despesas vinculadas não serão excluídas, apenas desvinculadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
