
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { GoalContributionFormData } from '@/lib/types';

const formSchema = z.object({
  date: z.date({ required_error: 'Data é obrigatória.' }),
  description: z.string().min(2, { message: 'Descrição deve ter pelo menos 2 caracteres.' }).max(100),
  amount: z.coerce.number().positive({ message: 'Valor deve ser um número positivo.' }),
  type: z.enum(['contribution', 'withdrawal'], { required_error: 'Tipo é obrigatório.' }),
});

interface ContributionFormProps {
  onSubmitSuccess?: () => void;
  goalId: string;
  onAddContribution: (data: GoalContributionFormData) => void;
}

export function ContributionForm({
  onSubmitSuccess,
  goalId,
  onAddContribution,
}: ContributionFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      description: '',
      amount: 0,
      type: 'contribution',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const contributionData: GoalContributionFormData = {
      goalId,
      date: values.date.toISOString(),
      description: values.description,
      amount: values.type === 'contribution' ? Math.abs(values.amount) : -Math.abs(values.amount),
    };

    try {
      onAddContribution(contributionData);
      toast({ title: "Sucesso!", description: "Transferência registrada." });
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro!", description: "Não foi possível registrar a transferência." });
      console.error("Failed to save contribution", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="contribution" /></FormControl>
                    <FormLabel className="font-normal">Entrada (Contribuição)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="withdrawal" /></FormControl>
                    <FormLabel className="font-normal">Saída (Retirada)</FormLabel>
                  </FormItem>
                </RadioGroup>
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
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Aporte mensal, Retirada emergência" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="100.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
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
        <Button type="submit" className="w-full">Adicionar</Button>
      </form>
    </Form>
  );
}
