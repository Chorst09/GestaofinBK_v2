
"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { VariableIncomeAsset, VariableIncomeAssetFormData } from '@/lib/types';

const formSchema = z.object({
  ticker: z.string().min(3, 'Ticker deve ter pelo menos 3 caracteres.').max(10).toUpperCase(),
  type: z.enum(['ACAO', 'FII', 'BDR', 'ETF', 'CRIPTO'], { required_error: 'Tipo é obrigatório.' }),
  quantity: z.coerce.number().positive('Quantidade deve ser positiva.'),
  averagePrice: z.coerce.number().positive('Preço médio deve ser positivo.'),
  currentPrice: z.coerce.number().positive('Cotação atual deve ser positiva.'),
});

interface VariableIncomeFormProps {
  onSubmitSuccess?: () => void;
  initialData?: VariableIncomeAsset | null;
  onAddAsset: (data: VariableIncomeAssetFormData) => void;
  onUpdateAsset: (data: VariableIncomeAsset) => void;
}

export function VariableIncomeForm({ onSubmitSuccess, initialData, onAddAsset, onUpdateAsset }: VariableIncomeFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? { ...initialData } : { ticker: '', quantity: 0, averagePrice: 0, currentPrice: 0 },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const assetData: VariableIncomeAssetFormData = values;
    try {
      if (initialData) {
        onUpdateAsset({ ...assetData, id: initialData.id });
        toast({ title: 'Sucesso!', description: 'Ativo atualizado.' });
      } else {
        onAddAsset(assetData);
        toast({ title: 'Sucesso!', description: 'Ativo adicionado.' });
      }
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro!', description: 'Não foi possível salvar o ativo.' });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="ticker" render={({ field }) => (
            <FormItem><FormLabel>Ticker do Ativo</FormLabel><FormControl><Input placeholder="PETR4" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
              <SelectContent><SelectItem value="ACAO">Ação</SelectItem><SelectItem value="FII">FII</SelectItem><SelectItem value="BDR">BDR</SelectItem><SelectItem value="ETF">ETF</SelectItem><SelectItem value="CRIPTO">Cripto</SelectItem></SelectContent>
            </Select><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="quantity" render={({ field }) => (
          <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" step="any" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="averagePrice" render={({ field }) => (
            <FormItem><FormLabel>Preço Médio (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="currentPrice" render={({ field }) => (
            <FormItem><FormLabel>Cotação Atual (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <Button type="submit" className="w-full">{initialData ? 'Atualizar Ativo' : 'Adicionar Ativo'}</Button>
      </form>
    </Form>
  );
}

    