
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import type { FinancialGoal, FinancialGoalFormData } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome da meta deve ter pelo menos 2 caracteres.' }).max(50),
  targetAmount: z.coerce.number().positive({ message: 'O valor desejado deve ser maior que zero.' }),
  startDate: z.date({ required_error: 'Data inicial é obrigatória.' }),
  endDate: z.date({ required_error: 'Data final é obrigatória.' }),
}).refine(data => data.endDate > data.startDate, {
  message: 'A data final deve ser posterior à data inicial.',
  path: ['endDate'],
});

interface GoalFormProps {
  onSubmitSuccess?: () => void;
  initialData?: FinancialGoal | null;
  onAddGoal: (data: FinancialGoalFormData) => void;
  onUpdateGoal: (data: FinancialGoal) => void;
}

export function GoalForm({
  onSubmitSuccess,
  initialData,
  onAddGoal,
  onUpdateGoal,
}: GoalFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? { ...initialData, startDate: new Date(initialData.startDate), endDate: new Date(initialData.endDate) }
      : {
          name: '',
          targetAmount: 0,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const goalData = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
    };

    try {
      if (initialData) {
        onUpdateGoal({ ...goalData, id: initialData.id });
        toast({ title: "Sucesso!", description: "Meta atualizada." });
      } else {
        onAddGoal(goalData);
        toast({ title: "Sucesso!", description: "Meta adicionada." });
      }
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro!", description: "Não foi possível salvar a meta." });
      console.error("Failed to save goal", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Reserva de emergência, Viagem" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Desejado (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="8000.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Inicial</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Final</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {initialData ? 'Atualizar Meta' : 'Adicionar Meta'}
        </Button>
      </form>
    </Form>
  );
}
