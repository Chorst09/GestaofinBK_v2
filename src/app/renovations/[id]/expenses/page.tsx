"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRenovations } from '@/hooks/useRenovations';
import { useRenovationExpenses } from '@/hooks/useRenovationExpenses';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, PlusCircle, Trash2, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RenovationExpense, RenovationExpenseCategory } from '@/lib/types';

const categoryLabels: Record<RenovationExpenseCategory, string> = {
  demolition: 'Demolição',
  masonry: 'Alvenaria',
  plumbing: 'Hidráulica',
  electrical: 'Elétrica',
  painting: 'Pintura',
  flooring: 'Piso',
  carpentry: 'Carpintaria',
  finishing: 'Acabamento',
  labor: 'Mão de Obra',
  materials: 'Materiais',
  other: 'Outros',
};

export default function RenovationExpensesPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const renovationId = params.id as string;
  
  const { getRenovationById } = useRenovations();
  const { renovationExpenses, addRenovationExpense, deleteRenovationExpense } = useRenovationExpenses();
  const { transactions, addTransaction } = useTransactions();
  
  const renovation = getRenovationById(renovationId);
  const expenses = renovationExpenses.filter(exp => exp.renovationId === renovationId);

  const [newExpense, setNewExpense] = React.useState({
    description: '',
    amount: 0,
    category: 'materials' as RenovationExpenseCategory,
    stageId: '',
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

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

  const handleAddExpense = () => {
    if (!newExpense.description.trim() || newExpense.amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha a descrição e o valor da despesa',
      });
      return;
    }

    // Criar transação
    addTransaction({
      description: `[Reforma] ${newExpense.description}`,
      amount: -Math.abs(newExpense.amount),
      date: newExpense.date,
      category: 'home',
      type: 'expense',
      status: 'paid',
    });

    // Pegar a última transação criada (a que acabamos de adicionar)
    const lastTransaction = transactions[transactions.length - 1] || { id: `temp-${Date.now()}` };

    // Criar despesa de reforma
    addRenovationExpense({
      renovationId,
      transactionId: lastTransaction.id,
      category: newExpense.category,
      stageId: newExpense.stageId || undefined,
      supplierId: newExpense.supplierId || undefined,
      isPaid: true,
      notes: newExpense.notes,
    });

    setNewExpense({
      description: '',
      amount: 0,
      category: 'materials',
      stageId: '',
      supplierId: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });

    toast({
      title: 'Despesa adicionada',
      description: 'A despesa foi registrada com sucesso',
    });
  };

  const handleDeleteExpense = (expenseId: string, transactionId: string) => {
    deleteRenovationExpense(expenseId);
    // Nota: Idealmente deveria deletar a transação também, mas vamos manter por segurança
    toast({
      title: 'Despesa removida',
      description: 'A despesa foi removida com sucesso',
    });
  };

  const expenseTransactions = expenses.map(exp => ({
    expense: exp,
    transaction: transactions.find(t => t.id === exp.transactionId),
  })).filter(item => item.transaction);

  const totalExpenses = expenseTransactions.reduce((sum, item) => sum + Math.abs(item.transaction!.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/renovations/${renovationId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Despesas</h1>
          <p className="text-muted-foreground">{renovation.name}</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Orçamento Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(renovation.adjustedBudget - totalExpenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adicionar Nova Despesa */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Despesa</CardTitle>
          <CardDescription>
            Registre uma nova despesa da reforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                placeholder="Ex: Compra de cimento"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newExpense.amount || ''}
                onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value as RenovationExpenseCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Etapa (opcional)</Label>
              <Select
                value={newExpense.stageId || undefined}
                onValueChange={(value) => setNewExpense({ ...newExpense, stageId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma etapa selecionada" />
                </SelectTrigger>
                <SelectContent>
                  {renovation.stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais..."
              value={newExpense.notes}
              onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
              rows={2}
            />
          </div>
          <Button onClick={handleAddExpense} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Despesa
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas Registradas</CardTitle>
          <CardDescription>
            {expenses.length === 0 ? 'Nenhuma despesa registrada ainda' : `${expenses.length} despesa(s) registrada(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Adicione a primeira despesa da sua reforma acima</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenseTransactions.map(({ expense, transaction }) => {
                const stage = renovation.stages.find(s => s.id === expense.stageId);
                return (
                  <div
                    key={expense.id}
                    className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{transaction!.description}</h4>
                        <Badge variant="outline">{categoryLabels[expense.category]}</Badge>
                        {stage && <Badge variant="secondary">{stage.name}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {format(new Date(transaction!.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                      <div className="text-lg font-bold text-destructive">
                        {Math.abs(transaction!.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      {expense.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{expense.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExpense(expense.id, transaction!.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
