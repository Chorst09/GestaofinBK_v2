
"use client";

import * as React from 'react';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { FinancialGoal, GoalContribution } from '@/lib/types';
import { GoalForm } from '@/components/financial-goals/goal-form';
import { ContributionForm } from '@/components/financial-goals/contribution-form';
import { GoalProgressChart } from '@/components/financial-goals/goal-progress-chart';
import { PlusCircle, Edit, Trash2, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInMonths, max, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function FinancialGoalsPage() {
  const { 
    goals, 
    addGoal, 
    updateGoal, 
    deleteGoal,
    getContributionsForGoal,
    addContribution,
    deleteContribution
  } = useFinancialGoals();
  const { toast } = useToast();

  const [selectedGoalId, setSelectedGoalId] = React.useState<string | null>(null);
  
  const [isGoalFormOpen, setGoalFormOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<FinancialGoal | null>(null);

  const [isContributionFormOpen, setContributionFormOpen] = React.useState(false);

  React.useEffect(() => {
    if (goals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(goals[0].id);
    }
    if (goals.length === 0) {
      setSelectedGoalId(null);
    }
  }, [goals, selectedGoalId]);

  const selectedGoal = React.useMemo(() => {
    return goals.find(g => g.id === selectedGoalId) || null;
  }, [goals, selectedGoalId]);
  
  const contributions = React.useMemo(() => {
      if (!selectedGoalId) return [];
      return getContributionsForGoal(selectedGoalId);
  }, [selectedGoalId, getContributionsForGoal]);

  const progress = React.useMemo(() => {
    if (!selectedGoal) return { current: 0, target: 0, pending: 0, percentage: 0, monthlyNeeded: 0 };
    const current = contributions.reduce((acc, c) => acc + c.amount, 0);
    const target = selectedGoal.targetAmount;
    const pending = Math.max(0, target - current);
    const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    
    const endDate = new Date(selectedGoal.endDate);
    const today = startOfDay(new Date());
    const startDate = max([today, new Date(selectedGoal.startDate)]);
    const remainingMonths = differenceInMonths(endDate, startDate) + 1;
    
    const monthlyNeeded = remainingMonths > 0 ? pending / remainingMonths : 0;

    return { current, target, pending, percentage, monthlyNeeded };
  }, [selectedGoal, contributions]);


  const handleOpenGoalForm = (goal: FinancialGoal | null) => {
    setEditingGoal(goal);
    setGoalFormOpen(true);
  };

  const handleGoalFormSuccess = () => {
    setGoalFormOpen(false);
    setEditingGoal(null);
  };
  
  const handleContributionFormSuccess = () => {
    setContributionFormOpen(false);
  };
  
  const handleDeleteGoal = (id: string) => {
      deleteGoal(id);
      toast({ title: "Meta excluída", description: "A meta financeira e suas contribuições foram removidas." });
  };
  
  const handleDeleteContribution = (id: string) => {
    deleteContribution(id);
    toast({ title: "Contribuição removida", description: "A movimentação foi removida da meta." });
  };

  return (
    <div className="space-y-6">
      <Dialog open={isGoalFormOpen} onOpenChange={setGoalFormOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingGoal ? 'Editar Meta Financeira' : 'Adicionar Nova Meta'}</DialogTitle>
            <DialogDescription>{editingGoal ? 'Atualize os detalhes da sua meta.' : 'Preencha os detalhes da nova meta.'}</DialogDescription>
          </DialogHeader>
          <GoalForm
            onSubmitSuccess={handleGoalFormSuccess}
            initialData={editingGoal}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isContributionFormOpen} onOpenChange={setContributionFormOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline">Adicionar Contribuição/Retirada</DialogTitle>
             <DialogDescription>Registre uma movimentação para a meta "{selectedGoal?.name}".</DialogDescription>
          </DialogHeader>
          <ContributionForm
            onSubmitSuccess={handleContributionFormSuccess}
            goalId={selectedGoalId || ''}
            onAddContribution={addContribution}
          />
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-headline font-semibold">Metas Financeiras</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {goals.length > 0 && (
            <Select onValueChange={setSelectedGoalId} value={selectedGoalId || ''}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Selecione uma meta" />
              </SelectTrigger>
              <SelectContent>
                {goals.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>{goal.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => handleOpenGoalForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Meta
          </Button>
        </div>
      </div>
      
      {!selectedGoal ? (
        <Card className="text-center py-12">
            <CardHeader>
                <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                <CardTitle className="mt-4 font-headline">
                  {goals.length === 0 ? 'Nenhuma meta financeira criada' : 'Selecione uma meta'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>
                  {goals.length === 0 
                    ? 'Comece adicionando sua primeira meta para acompanhar seu progresso.'
                    : 'Escolha uma meta no seletor acima para ver os detalhes.'}
                </CardDescription>
                {goals.length === 0 && (
                  <Button className="mt-4" onClick={() => handleOpenGoalForm(null)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Primeira Meta
                  </Button>
                )}
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl">{selectedGoal.name}</CardTitle>
                        <CardDescription>De {format(new Date(selectedGoal.startDate), 'dd/MM/yyyy', { locale: ptBR })} até {format(new Date(selectedGoal.endDate), 'dd/MM/yyyy', { locale: ptBR })}</CardDescription>
                    </div>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenGoalForm(selectedGoal)} className="mr-1">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar Meta</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>Tem certeza que deseja excluir a meta "{selectedGoal.name}"? Todas as contribuições associadas a ela também serão removidas.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteGoal(selectedGoal.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <GoalProgressChart progress={progress.percentage} />
                     <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Valor Desejado</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold">R$ {progress.target.toFixed(2)}</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Valor Alcançado</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold text-green-600">R$ {progress.current.toFixed(2)}</p></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Valor Pendente</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold text-destructive">R$ {progress.pending.toFixed(2)}</p></CardContent>
                        </Card>
                        <Card className="sm:col-span-2 lg:col-span-3">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Valor Mensal Necessário</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">R$ {progress.monthlyNeeded > 0 ? progress.monthlyNeeded.toFixed(2) : '0.00'}</p>
                                <p className="text-xs text-muted-foreground">Valor necessário por mês para atingir a meta no prazo.</p>
                            </CardContent>
                        </Card>
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                         <div>
                            <CardTitle className="font-headline">Transferências</CardTitle>
                            <CardDescription>Histórico de contribuições e retiradas da meta.</CardDescription>
                         </div>
                        <Button onClick={() => setContributionFormOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Transferência
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead className="text-center">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contributions.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhuma transferência registrada.</TableCell></TableRow>
                            ) : (
                                contributions.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell>{format(new Date(c.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                                        <TableCell>
                                            <Badge variant={c.amount > 0 ? "secondary" : "destructive"}>
                                                {c.amount > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                                                {c.amount > 0 ? 'Entrada' : 'Saída'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{c.description}</TableCell>
                                        <TableCell className={`text-right font-medium ${c.amount > 0 ? 'text-green-600' : 'text-destructive'}`}>
                                            R$ {Math.abs(c.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                        <AlertDialogDescription>Tem certeza que deseja excluir esta transferência?</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteContribution(c.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
