
"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { FixedIncomeAsset, FixedIncomeAssetFormData } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres.').max(50),
  type: z.enum(['CDB', 'LCI_LCA', 'TESOURO_DIRETO', 'OUTRO'], { required_error: 'Tipo é obrigatório.' }),
  investedAmount: z.coerce.number().positive('Valor investido deve ser positivo.'),
  currentValue: z.coerce.number().positive('Valor atual deve ser positivo.'),
  dueDate: z.date().optional(),
});

interface FixedIncomeFormProps {
  onSubmitSuccess?: () => void;
  initialData?: FixedIncomeAsset | null;
  onAddAsset: (data: FixedIncomeAssetFormData) => void;
  onUpdateAsset: (data: FixedIncomeAsset) => void;
}

export function FixedIncomeForm({ onSubmitSuccess, initialData, onAddAsset, onUpdateAsset }: FixedIncomeFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? { ...initialData, dueDate: initialData.dueDate ? new Date(initialData.dueDate) : undefined }
      : { name: '', investedAmount: 0, currentValue: 0 },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const assetData: FixedIncomeAssetFormData = {
      ...values,
      dueDate: values.dueDate?.toISOString(),
    };
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
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nome do Ativo</FormLabel><FormControl><Input placeholder="Ex: CDB Banco X 120% CDI" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
            <SelectContent><SelectItem value="CDB">CDB</SelectItem><SelectItem value="LCI_LCA">LCI / LCA</SelectItem><SelectItem value="TESOURO_DIRETO">Tesouro Direto</SelectItem><SelectItem value="OUTRO">Outro</SelectItem></SelectContent>
          </Select><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="investedAmount" render={({ field }) => (
            <FormItem><FormLabel>Valor Investido (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="currentValue" render={({ field }) => (
            <FormItem><FormLabel>Valor Atual (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="dueDate" render={({ field }) => (
          <FormItem className="flex flex-col"><FormLabel>Data de Vencimento (Opcional)</FormLabel><Popover><PopoverTrigger asChild><FormControl>
            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
              {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
          </PopoverContent></Popover><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full">{initialData ? 'Atualizar Ativo' : 'Adicionar Ativo'}</Button>
      </form>
    </Form>
  );
}

    