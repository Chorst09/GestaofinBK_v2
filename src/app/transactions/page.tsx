
"use client";

import * as React from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TransactionForm } from '@/components/transactions/transaction-form';
import type { Transaction } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlusCircle, Edit, Trash2, CreditCard as CreditCardIcon, ChevronLeft, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { useAllCategories } from '@/hooks/useAllCategories';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { BankLogo } from '@/components/layout/BankLogo';
import { Separator } from '@/components/ui/separator';
import { useSearchParams } from 'next/navigation';
import { useTravelEvents } from '@/hooks/useTravelEvents';

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const travelId = searchParams.get('travelId');
  
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { getTravelEventById } = useTravelEvents();
  const { getCreditCardById } = useCreditCards();
  const { getBankAccountById } = useBankAccounts();
  const { getCategoryIcon } = useAllCategories();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const { toast } = useToast();

  const [currentMonth, setCurrentMonth] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setCurrentMonth(startOfMonth(new Date()));
  }, []);

  const { filteredTransactions, monthlyIncome, monthlyExpenses, monthlyBalance } = React.useMemo(() => {
    if (!currentMonth) return { filteredTransactions: [], monthlyIncome: 0, monthlyExpenses: 0, monthlyBalance: 0 };
    
    let baseFiltered = transactions;
    
    // Filtrar por viagem se travelId estiver presente
    if (travelId) {
      baseFiltered = transactions.filter(t => t.travelId === travelId);
    } else {
      // Filtrar por período apenas se não estiver filtrando por viagem
      const period = {
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      };
      baseFiltered = transactions.filter(t => {
        try {
          return isWithinInterval(parseISO(t.date), period);
        } catch {
          return false;
        }
      });
    }
    
    let income = 0;
    let expenses = 0;
    baseFiltered.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += Math.abs(t.amount);
      }
    });
    return {
      filteredTransactions: baseFiltered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      monthlyIncome: income,
      monthlyExpenses: expenses,
      monthlyBalance: income - expenses,
    };
  }, [transactions, currentMonth, travelId]);

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => prev ? (direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)) : null);
  };


  const handleOpenFormForEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleOpenFormForAdd = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast({ title: "Transação excluída", description: "A transação foi removida com sucesso." });
  };

  const accountTypeLabels: Record<string, string> = {
    checking: 'CC',
    savings: 'Poupança',
    investment: 'Invest.',
    other: 'Outra',
  };


  const selectedTravel = travelId ? getTravelEventById(travelId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-semibold">
            {selectedTravel ? `Transações - ${selectedTravel.name}` : 'Suas Transações'}
          </h1>
          {selectedTravel && (
            <p className="text-muted-foreground mt-1">
              {selectedTravel.destination} • {filteredTransactions.length} transação(ões)
            </p>
          )}
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenFormForAdd} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingTransaction ? 'Editar Transação' : 'Adicionar Nova Transação'}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction ? 'Atualize os detalhes da sua transação.' : 'Preencha os detalhes da nova transação.'}
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              onSubmitSuccess={handleFormSubmitSuccess}
              initialData={editingTransaction}
              onAddTransaction={addTransaction}
              onUpdateTransaction={updateTransaction}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {!travelId && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={() => changeMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-center w-48 capitalize">
            {currentMonth ? format(currentMonth, 'MMMM yyyy', { locale: ptBR }) : ''}
          </h2>
          <Button variant="outline" size="icon" onClick={() => changeMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            {selectedTravel ? `Transações da Viagem` : 'Histórico de Transações'}
          </CardTitle>
          <CardDescription>
            {selectedTravel 
              ? `Visualize e gerencie as transações relacionadas à viagem "${selectedTravel.name}".`
              : 'Visualize e gerencie suas receitas e despesas do mês selecionado.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma transação registrada para este mês.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Conta/Cartão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const Icon = getCategoryIcon(transaction.category);
                    let accountOrCardElement: React.ReactNode = '-';
                    let logoKeyForLogo: string | undefined = undefined;
                    let photoUrlForLogo: string | undefined = undefined;

                    if (transaction.creditCardId) {
                      const card = getCreditCardById(transaction.creditCardId);
                      if (card) {
                        logoKeyForLogo = card.logoKey;
                        photoUrlForLogo = card.photoUrl;
                        accountOrCardElement = (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <BankLogo logoKey={card.logoKey} photoUrl={card.photoUrl} className="h-3 w-3" />
                            {card.bankName} ({card.cardFlag})
                          </Badge>
                        );
                      } else if (transaction.cardBrand) { 
                        accountOrCardElement = (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <CreditCardIcon className="h-3 w-3" />
                            {transaction.cardBrand} (Manual)
                          </Badge>
                        );
                      } else {
                        accountOrCardElement = (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <CreditCardIcon className="h-3 w-3" />
                            <span>Cartão desc.</span>
                          </Badge>
                        );
                      }
                    } else if (transaction.cardBrand) { 
                      accountOrCardElement = (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <CreditCardIcon className="h-3 w-3" />
                            {transaction.cardBrand}
                          </Badge>
                        );
                    } else if (transaction.bankAccountId) {
                      const bankAccount = getBankAccountById(transaction.bankAccountId);
                      if (bankAccount) {
                        logoKeyForLogo = bankAccount.logoKey;
                        photoUrlForLogo = bankAccount.photoUrl;
                        accountOrCardElement = (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <BankLogo logoKey={bankAccount.logoKey} photoUrl={bankAccount.photoUrl} className="h-3 w-3" />
                            {bankAccount.bankName} ({accountTypeLabels[bankAccount.accountType] || bankAccount.accountType})
                          </Badge>
                        );
                      } else {
                        accountOrCardElement = (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <BankLogo logoKey={undefined} className="h-3 w-3" />
                            <span>Conta desc.</span>
                          </Badge>
                        );
                      }
                    }

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            {logoKeyForLogo || photoUrlForLogo ? (
                              <BankLogo logoKey={logoKeyForLogo} photoUrl={photoUrlForLogo} className="h-3 w-3" />
                            ) : (
                              <Icon className="h-3 w-3" />
                            )}
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {accountOrCardElement}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={transaction.status === 'paid' ? 'default' : 'secondary'}
                            className={`flex items-center gap-1 w-fit ${
                              transaction.status === 'paid' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-orange-100 text-orange-800 border-orange-200'
                            }`}
                          >
                            {transaction.status === 'paid' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${transaction.amount < 0 ? 'text-destructive' : 'text-accent-foreground bg-accent/30 rounded px-1 py-0.5'}`}>
                          R$ {Math.abs(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenFormForEdit(transaction)} className="mr-2">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)} className="bg-destructive hover:bg-destructive/90">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5} className="font-bold">Totais do Mês</TableCell>
                    <TableCell className="text-right" colSpan={2}>
                      <div className="space-y-1 text-right">
                        <div className="flex justify-between gap-2">
                            <span>Receitas:</span>
                            <span className="font-semibold text-green-600">R$ {monthlyIncome.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between gap-2">
                            <span>Despesas:</span>
                            <span className="font-semibold text-destructive">- R$ {monthlyExpenses.toFixed(2)}</span>
                        </div>
                        <Separator className="my-1"/>
                         <div className="flex justify-between gap-2 text-base">
                            <span className="font-bold">Saldo:</span>
                            <span className={`font-bold ${monthlyBalance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                                R$ {monthlyBalance.toFixed(2)}
                            </span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
