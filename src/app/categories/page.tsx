
"use client";

import * as React from 'react';
import { useCategories } from '@/hooks/useCategories';
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
import { CategoryForm } from '@/components/categories/category-form';
import type { CustomCategory } from '@/lib/types';
import { PlusCircle, Edit, Trash2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { TRANSACTION_CATEGORIES } from '@/components/transactions/categories';
import { getIconComponent } from '@/components/categories/category-icons';
import { useAllCategories } from '@/hooks/useAllCategories';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export default function CategoriesPage() {
  const {
    customCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const { allCategories } = useAllCategories();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CustomCategory | null>(null);
  const { toast } = useToast();

  const handleOpenFormForEdit = (category: CustomCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleOpenFormForAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
    toast({ title: "Categoria excluída", description: "A categoria foi removida com sucesso." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-headline font-semibold">Gerenciar Categorias</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenFormForAdd} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingCategory ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Atualize os detalhes da categoria.' : 'Preencha os detalhes da nova categoria.'}
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              onSubmitSuccess={handleFormSubmitSuccess}
              initialData={editingCategory}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              existingCategoryNames={allCategories.map(c => c.name)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Suas Categorias</CardTitle>
          <CardDescription>Visualize e gerencie suas categorias de transações. Categorias padrão não podem ser editadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ícone</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allCategories.map((category) => {
                  const Icon = category.icon;
                  const isCustom = 'isCustom' in category && category.isCustom;
                  return (
                    <TableRow key={category.name}>
                      <TableCell>
                        <Icon className="h-5 w-5" />
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.type === 'income' ? 'secondary' : 'outline'}>
                            {category.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {isCustom ? (
                             <>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenFormForEdit(category as CustomCategory)} className="mr-2">
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
                                        Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita e não afetará transações já existentes.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCategory((category as CustomCategory).id)} className="bg-destructive hover:bg-destructive/90">
                                        Excluir
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Categoria padrão não pode ser alterada.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
