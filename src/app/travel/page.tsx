"use client";

import * as React from 'react';
import { useTravelEvents } from '@/hooks/useTravelEvents';
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
import { TravelForm } from '@/components/travel/travel-form';
import { TravelHero } from '@/components/travel/travel-hero';
import type { TravelEvent } from '@/lib/types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  MapPin, 
  Calendar, 
  DollarSign,
  Plane,
  TrendingUp,
  TrendingDown,
  Navigation
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const travelCategoryLabels: Record<string, string> = {
  hospedagem: 'Hospedagem',
  aereo: 'Aéreo',
  alimentacao: 'Alimentação',
  passeios: 'Passeios',
  transporte: 'Transporte',
  compras: 'Compras',
  outros: 'Outros',
};

export default function TravelPage() {
  const router = useRouter();
  const {
    travelEvents,
    addTravelEvent,
    updateTravelEvent,
    deleteTravelEvent,
  } = useTravelEvents();
  
  const { transactions } = useTransactions();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTravel, setEditingTravel] = React.useState<TravelEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<TravelEvent | null>(null);
  const { toast } = useToast();

  const handleOpenFormForEdit = (travel: TravelEvent) => {
    setEditingTravel(travel);
    setIsFormOpen(true);
  };

  const handleOpenFormForAdd = () => {
    setEditingTravel(null);
    setIsFormOpen(true);
  };

  const handleFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingTravel(null);
  };

  const handleDeleteConfirmation = (travel: TravelEvent) => {
    setDeleteTarget(travel);
  };

  const executeDelete = () => {
    if (!deleteTarget) return;
    deleteTravelEvent(deleteTarget.id);
    toast({ title: "Viagem excluída", description: "A viagem foi removida com sucesso." });
    setDeleteTarget(null);
  };

  const getTravelExpenses = (travelId: string) => {
    return transactions.filter(t => t.travelId === travelId && t.type === 'expense');
  };

  const getTotalSpent = (travelId: string) => {
    const expenses = getTravelExpenses(travelId);
    return expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getSpentByCategory = (travelId: string) => {
    const expenses = getTravelExpenses(travelId);
    const byCategory: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const category = expense.category.toLowerCase();
      byCategory[category] = (byCategory[category] || 0) + Math.abs(expense.amount);
    });
    
    return byCategory;
  };

  const getStatusBadge = (status: TravelEvent['status']) => {
    const variants: Record<TravelEvent['status'], { variant: any; label: string }> = {
      planned: { variant: 'secondary', label: 'Planejada' },
      ongoing: { variant: 'default', label: 'Em Andamento' },
      completed: { variant: 'outline', label: 'Concluída' },
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-8">
      <TravelHero />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenFormForAdd}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Viagem
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingTravel ? 'Editar Viagem' : 'Nova Viagem'}
              </DialogTitle>
              <DialogDescription>
                {editingTravel ? 'Atualize os detalhes da viagem.' : 'Crie um novo planejamento de viagem.'}
              </DialogDescription>
            </DialogHeader>
            <TravelForm
              onSubmitSuccess={handleFormSubmitSuccess}
              initialData={editingTravel}
              onAddTravelEvent={addTravelEvent}
              onUpdateTravelEvent={updateTravelEvent}
            />
          </DialogContent>
        </Dialog>
      </div>

      {travelEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Plane className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma viagem planejada</h3>
            <p className="text-muted-foreground text-center mb-6">
              Comece criando sua primeira viagem para acompanhar gastos e orçamento
            </p>
            <Button onClick={handleOpenFormForAdd}>
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Primeira Viagem
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {travelEvents.map((travel) => {
            const totalSpent = getTotalSpent(travel.id);
            const spentByCategory = getSpentByCategory(travel.id);
            const budgetProgress = (totalSpent / travel.totalBudget) * 100;
            const remaining = travel.totalBudget - totalSpent;
            const daysCount = differenceInDays(parseISO(travel.endDate), parseISO(travel.startDate)) + 1;

            return (
              <Card key={travel.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-2xl font-headline">{travel.name}</CardTitle>
                        {getStatusBadge(travel.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {travel.destination}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(parseISO(travel.startDate), 'dd/MM/yyyy', { locale: ptBR })} - {format(parseISO(travel.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                          <span className="ml-1">({daysCount} {daysCount === 1 ? 'dia' : 'dias'})</span>
                        </div>
                      </div>
                      {travel.description && (
                        <p className="text-sm text-muted-foreground mt-2">{travel.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => router.push(`/travel/${travel.id}/routes`)}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Rotas
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenFormForEdit(travel)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive" 
                        onClick={() => handleDeleteConfirmation(travel)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-6">
                  {/* Resumo Financeiro */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        Orçamento Total
                      </div>
                      <div className="text-2xl font-bold">
                        R$ {travel.totalBudget.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingDown className="h-4 w-4" />
                        Total Gasto
                      </div>
                      <div className="text-2xl font-bold text-destructive">
                        R$ {totalSpent.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        Saldo Restante
                      </div>
                      <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        R$ {remaining.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso do Orçamento</span>
                      <span className="font-medium">{budgetProgress.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(budgetProgress, 100)} 
                      className={budgetProgress > 100 ? 'bg-red-100' : ''}
                    />
                    {budgetProgress > 100 && (
                      <p className="text-sm text-destructive">
                        ⚠️ Orçamento excedido em R$ {Math.abs(remaining).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Orçamento por Categoria */}
                  {travel.budgetByCategory.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Orçamento vs. Realizado por Categoria</h4>
                      <div className="space-y-3">
                        {travel.budgetByCategory.map((budgetItem, idx) => {
                          const spent = spentByCategory[budgetItem.category] || 0;
                          const categoryProgress = (spent / budgetItem.budgetedAmount) * 100;
                          const categoryRemaining = budgetItem.budgetedAmount - spent;

                          return (
                            <div key={idx} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  {travelCategoryLabels[budgetItem.category] || budgetItem.category}
                                </span>
                                <div className="text-sm">
                                  <span className="text-destructive font-medium">R$ {spent.toFixed(2)}</span>
                                  <span className="text-muted-foreground"> / R$ {budgetItem.budgetedAmount.toFixed(2)}</span>
                                </div>
                              </div>
                              <Progress value={Math.min(categoryProgress, 100)} />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{categoryProgress.toFixed(1)}% utilizado</span>
                                <span className={categoryRemaining >= 0 ? 'text-green-600' : 'text-destructive'}>
                                  {categoryRemaining >= 0 ? 'Restam' : 'Excedeu'} R$ {Math.abs(categoryRemaining).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Link para Transações */}
                  <div className="pt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/transactions?travelId=${travel.id}`}>
                        Ver Transações desta Viagem
                      </a>
                    </Button>
                  </div>
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
              Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.
              As transações vinculadas não serão excluídas, apenas desvinculadas.
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
