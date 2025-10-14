
"use client";

import * as React from 'react';
import { useBankAccounts } from '@/hooks/useBankAccounts';
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
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingBankAccount, setEditingBankAccount] = React.useState<BankAccount | null>(null);
  const { toast } = useToast();

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
                    <TableHead className="text-right">Saldo (R$)</TableHead>
                    <TableHead className="text-right">Limite Cheque Especial (R$)</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <BankLogo logoKey={account.logoKey} photoUrl={account.photoUrl} /> 
                        {account.bankName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{accountTypeLabels[account.accountType]}</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${account.balance < 0 ? 'text-destructive' : 'text-card-foreground'}`}>
                        {account.balance.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {account.overdraftLimit !== undefined ? account.overdraftLimit.toFixed(2) : '-'}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
