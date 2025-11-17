
"use client";

import * as React from 'react';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
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
import { BankAccountForm } from '@/components/bank-accounts/bank-account-form';
import type { BankAccount } from '@/lib/types';
import { PlusCircle, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { BankLogo } from '@/components/layout/BankLogo';

const accountTypeLabels: Record<BankAccount['accountType'], string> = {
  checking: 'Conta Corrente',
  savings: 'Conta Poupança',
  investment: 'Investimento',
  other: 'Outra',
};

export default function BankAccountsPage() {
  const {
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
  } = useBankAccounts();
  const { transactions } = useTransactions();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingBankAccount, setEditingBankAccount] = React.useState<BankAccount | null>(null);
  const { toast } = useToast();

  // Calcular saldo real de cada conta com base nas transações
  const accountBalances = React.useMemo(() => {
    const balances: Record<string, { balance: number; income: number; expenses: number }> = {};
    
    // Inicializar com saldo inicial de cada conta
    bankAccounts.forEach(account => {
      balances[account.id] = {
        balance: account.balance,
        income: 0,
        expenses: 0
      };
    });
    
    // Somar/subtrair transações
    transactions.forEach(transaction => {
      if (transaction.bankAccountId && balances[transaction.bankAccountId]) {
        if (transaction.type === 'income') {
          balances[transaction.bankAccountId].balance += Math.abs(transaction.amount);
          balances[transaction.bankAccountId].income += Math.abs(transaction.amount);
        } else {
          balances[transaction.bankAccountId].balance -= Math.abs(transaction.amount);
          balances[transaction.bankAccountId].expenses += Math.abs(transaction.amount);
        }
      }
    });
    
    return balances;
  }, [bankAccounts, transactions]);

  const handleOpenFormForEdit = (account: BankAccount) => {
    setEditingBankAccount(account);
    setIsFormOpen(true);
  };

  const handleOpenFormForAdd = () => {
    setEditingBankAccount(null);
    setIsFormOpen(true);
  };

  const handleFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingBankAccount(null);
  };

  const handleDeleteBankAccount = (id: string) => {
    deleteBankAccount(id);
    toast({ title: "Conta excluída", description: "A conta bancária foi removida com sucesso." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-headline font-semibold">Gerenciar Contas Bancárias</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenFormForAdd} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingBankAccount ? 'Editar Conta Bancária' : 'Adicionar Nova Conta Bancária'}
              </DialogTitle>
              <DialogDescription>
                {editingBankAccount ? 'Atualize os detalhes da conta.' : 'Preencha os detalhes da nova conta.'}
              </DialogDescription>
            </DialogHeader>
            <BankAccountForm
              onSubmitSuccess={handleFormSubmitSuccess}
              initialData={editingBankAccount}
              onAddBankAccount={addBankAccount}
              onUpdateBankAccount={updateBankAccount}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Suas Contas Cadastradas</CardTitle>
          <CardDescription>Visualize e gerencie suas contas bancárias.</CardDescription>
        </CardHeader>
        <CardContent>
          {bankAccounts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma conta bancária cadastrada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Banco</TableHead>
                    <TableHead>Tipo de Conta</TableHead>
                    <TableHead className="text-right">Saldo Inicial</TableHead>
                    <TableHead className="text-right">Receitas</TableHead>
                    <TableHead className="text-right">Despesas</TableHead>
                    <TableHead className="text-right">Saldo Atual</TableHead>
                    <TableHead className="text-right">Cheque Especial</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankAccounts.map((account) => {
                    const accountData = accountBalances[account.id] || { balance: account.balance, income: 0, expenses: 0 };
                    const currentBalance = accountData.balance;
                    const hasOverdraft = account.overdraftLimit !== undefined && account.overdraftLimit > 0;
                    const isUsingOverdraft = currentBalance < 0;
                    const availableWithOverdraft = hasOverdraft ? currentBalance + account.overdraftLimit! : currentBalance;

                    return (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <BankLogo logoKey={account.logoKey} photoUrl={account.photoUrl} /> 
                            {account.bankName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{accountTypeLabels[account.accountType]}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          R$ {account.balance.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            R$ {accountData.income.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 text-destructive">
                            <TrendingDown className="h-3 w-3" />
                            R$ {accountData.expenses.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <div className={`font-bold text-base ${currentBalance < 0 ? 'text-destructive' : 'text-accent-foreground'}`}>
                              R$ {currentBalance.toFixed(2)}
                            </div>
                            {isUsingOverdraft && hasOverdraft && (
                              <div className="text-xs text-muted-foreground">
                                Disponível: R$ {availableWithOverdraft.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {account.overdraftLimit !== undefined ? (
                            <span className={isUsingOverdraft ? 'text-yellow-600 font-medium' : ''}>
                              R$ {account.overdraftLimit.toFixed(2)}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenFormForEdit(account)} className="mr-2">
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
                                  Tem certeza que deseja excluir esta conta bancária? Esta ação não pode ser desfeita.
                                  Excluir uma conta não afetará transações já associadas a ela (elas perderão a referência à conta).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteBankAccount(account.id)} className="bg-destructive hover:bg-destructive/90">
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
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
