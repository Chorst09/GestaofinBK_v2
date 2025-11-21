"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Renovation, RenovationFormData, RenovationStatus } from '@/lib/types';
import { format } from 'date-fns';

interface RenovationFormProps {
  onSubmit: (data: RenovationFormData) => void;
  initialData?: Renovation;
  submitLabel?: string;
}

const statusOptions: { value: RenovationStatus; label: string }[] = [
  { value: 'planned', label: 'Planejada' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluída' },
  { value: 'on_hold', label: 'Pausada' },
];

export function RenovationForm({ onSubmit, initialData, submitLabel = 'Salvar' }: RenovationFormProps) {
  const form = useForm<RenovationFormData>({
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || '',
      totalBudget: initialData.totalBudget,
      safetyMarginPercent: initialData.safetyMarginPercent,
      adjustedBudget: initialData.adjustedBudget,
      startDate: initialData.startDate.split('T')[0],
      endDate: initialData.endDate.split('T')[0],
      status: initialData.status,
    } : {
      name: '',
      description: '',
      totalBudget: 0,
      safetyMarginPercent: 10,
      adjustedBudget: 0,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'planned',
    },
  });

  const handleSubmit = (data: RenovationFormData) => {
    const totalBudget = Number(data.totalBudget);
    const safetyMarginPercent = Number(data.safetyMarginPercent);
    const adjustedBudget = totalBudget + (totalBudget * safetyMarginPercent / 100);
    
    const formattedData: RenovationFormData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      totalBudget,
      safetyMarginPercent,
      adjustedBudget,
    };
    onSubmit(formattedData);
  };

  // Calcular orçamento ajustado em tempo real
  const totalBudget = form.watch('totalBudget');
  const safetyMarginPercent = form.watch('safetyMarginPercent');
  const adjustedBudget = React.useMemo(() => {
    const budget = Number(totalBudget) || 0;
    const margin = Number(safetyMarginPercent) || 0;
    return budget + (budget * margin / 100);
  }, [totalBudget, safetyMarginPercent]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: 'Nome é obrigatório' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Reforma</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Reforma do Banheiro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva os detalhes da reforma..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalBudget"
            rules={{ 
              required: 'Orçamento é obrigatório',
              min: { value: 0.01, message: 'Orçamento deve ser maior que zero' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orçamento Base (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="10000.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Valor estimado da reforma
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="safetyMarginPercent"
            rules={{ 
              required: 'Margem de segurança é obrigatória',
              min: { value: 0, message: 'Margem deve ser no mínimo 0%' },
              max: { value: 100, message: 'Margem deve ser no máximo 100%' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Margem de Segurança (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1" 
                    placeholder="10" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Buffer para imprevistos (recomendado: 10-20%)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Orçamento Ajustado (calculado) */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Orçamento Ajustado (com margem)
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Este é o valor total que você deve considerar
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              R$ {adjustedBudget.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            rules={{ required: 'Data de início é obrigatória' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            rules={{ required: 'Data de término é obrigatória' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Término</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          rules={{ required: 'Status é obrigatório' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end">
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  );
}
