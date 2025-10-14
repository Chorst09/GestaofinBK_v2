
"use client";

import * as React from 'react';
import { useCreditCards } from '@/hooks/useCreditCards';
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
import { CreditCardForm } from '@/components/credit-cards/credit-card-form';
import type { CreditCard } from '@/lib/types';
import { PlusCircle, Edit, Trash2, CreditCard as CreditCardIconLucide } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { BankLogo } from '@/components/layout/BankLogo';

export default function CreditCardsPage() {
  const {
    creditCards,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
  } = useCreditCards();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCreditCard, setEditingCreditCard] = React.useState<CreditCard | null>(null);
  const { toast } = useToast();

  const handleOpenFormForEdit = (card: CreditCard) => {
    setEditingCreditCard(card);
    setIsFormOpen(true);
  };

  const handleOpenFormForAdd = () => {
    setEditingCreditCard(null);
    setIsFormOpen(true);
  };

  const handleFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingCreditCard(null);
  };

  const handleDeleteCreditCard = (id: string) => {
    deleteCreditCard(id);
    toast({ title: "Cartão excluído", description: "O cartão de crédito foi removido com sucesso." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-headline font-semibold">Gerenciar Cartões de Crédito</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenFormForAdd} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Cartão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingCreditCard ? 'Editar Cartão de Crédito' : 'Adicionar Novo Cartão de Crédito'}
              </DialogTitle>
              <DialogDescription>
                {editingCreditCard ? 'Atualize os detalhes do cartão.' : 'Preencha os detalhes do novo cartão.'}
              </DialogDescription>
            </DialogHeader>
            <CreditCardForm
              onSubmitSuccess={handleFormSubmitSuccess}
              initialData={editingCreditCard}
              onAddCreditCard={addCreditCard}
              onUpdateCreditCard={updateCreditCard}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Seus Cartões Cadastrados</CardTitle>
          <CardDescription>Visualize e gerencie seus cartões de crédito.</CardDescription>
        </CardHeader>
        <CardContent>
          {creditCards.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum cartão de crédito cadastrado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Banco</TableHead>
                    <TableHead>Bandeira</TableHead>
                    <TableHead className="text-center">Dia do Vencimento</TableHead>
                    <TableHead className="text-right">Limite (R$)</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <BankLogo logoKey={card.logoKey} photoUrl={card.photoUrl} />
                        {card.bankName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                           <CreditCardIconLucide className="h-3 w-3" /> 
                          {card.cardFlag}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{card.dueDateDay}</TableCell>
                      <TableCell className="text-right">
                        {card.creditLimit !== undefined ? card.creditLimit.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenFormForEdit(card)} className="mr-2">
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
                                Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.
                                Excluir um cartão não afetará transações ou previsões já associadas a ele (elas perderão a referência ao cartão).
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCreditCard(card.id)} className="bg-destructive hover:bg-destructive/90">
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
