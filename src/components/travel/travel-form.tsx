"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { TravelEvent, TravelEventFormData, TravelCategory, TravelBudgetItem } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const travelCategories: { value: TravelCategory; label: string }[] = [
  { value: 'hospedagem', label: 'Hospedagem' },
  { value: 'aereo', label: 'Aéreo/Transporte Principal' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'passeios', label: 'Passeios e Atrações' },
  { value: 'transporte', label: 'Transporte Local' },
  { value: 'compras', label: 'Compras' },
  { value: 'outros', label: 'Outros' },
];

const travelFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  destination: z.string().min(2, 'Destino é obrigatório'),
  startDate: z.date({ required_error: 'Data de início é obrigatória' }),
  endDate: z.date({ required_error: 'Data de término é obrigatória' }),
  totalBudget: z.coerce.number().positive('Orçamento deve ser positivo'),
  description: z.string().optional(),
  status: z.enum(['planned', 'ongoing', 'completed']),
}).refine(data => data.endDate >= data.startDate, {
  message: 'Data de término deve ser posterior à data de início',
  path: ['endDate'],
});

interface TravelFormProps {
  onSubmitSuccess?: () => void;
  initialData?: TravelEvent | null;
  onAddTravelEvent: (data: TravelEventFormData) => void;
  onUpdateTravelEvent: (data: TravelEvent) => void;
}

export function TravelForm({ 
  onSubmitSuccess, 
  initialData, 
  onAddTravelEvent, 
  onUpdateTravelEvent 
}: TravelFormProps) {
  const { toast } = useToast();
  
  const [budgetItems, setBudgetItems] = React.useState<TravelBudgetItem[]>(
    initialData?.budgetByCategory || []
  );

  const form = useForm<z.infer<typeof travelFormSchema>>({
    resolver: zodResolver(travelFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          destination: initialData.destination,
          startDate: new Date(initialData.startDate),
          endDate: new Date(initialData.endDate),
          totalBudget: initialData.totalBudget,
          description: initialData.description || '',
          status: initialData.status,
        }
      : {
          name: '',
          destination: '',
          startDate: new Date(),
          endDate: new Date(),
          totalBudget: 0,
          description: '',
          status: 'planned',
        },
  });

  const addBudgetItem = () => {
    setBudgetItems([...budgetItems, { category: 'outros', budgetedAmount: 0 }]);
  };

  const removeBudgetItem = (index: number) => {
    setBudgetItems(budgetItems.filter((_, i) => i !== index));
  };

  const updateBudgetItem = (index: number, field: keyof TravelBudgetItem, value: any) => {
    const updated = [...budgetItems];
    updated[index] = { ...updated[index], [field]: value };
    setBudgetItems(updated);
  };

  function onSubmit(values: z.infer<typeof travelFormSchema>) {
    const travelData: TravelEventFormData = {
      name: values.name,
      destination: values.destination,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      totalBudget: values.totalBudget,
      budgetByCategory: budgetItems,
      description: values.description,
      status: values.status,
    };
    
    try {
      if (initialData) {
        onUpdateTravelEvent({ ...travelData, id: initialData.id });
        toast({ title: "Sucesso!", description: "Viagem atualizada." });
      } else {
        onAddTravelEvent(travelData);
        toast({ title: "Sucesso!", description: "Viagem criada." });
      }
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro!", description: "Não foi possível salvar a viagem." });
      console.error("Failed to save travel event", error);
    }
  }

  const totalBudgetByCategory = budgetItems.reduce((sum, item) => sum + item.budgetedAmount, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Viagem</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Férias em Paris" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destino</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Paris, França" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
                    />
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
                <FormLabel>Data de Término</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Escolha uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="totalBudget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orçamento Total (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="5000.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="planned">Planejada</SelectItem>
                  <SelectItem value="ongoing">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Adicione detalhes sobre a viagem..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Orçamento por Categoria</h3>
              <p className="text-sm text-muted-foreground">
                Distribua o orçamento entre as categorias de despesa
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addBudgetItem}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {budgetItems.map((item, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium">Categoria</label>
                <Select
                  value={item.category}
                  onValueChange={(value) => updateBudgetItem(index, 'category', value as TravelCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {travelCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Valor (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.budgetedAmount}
                  onChange={(e) => updateBudgetItem(index, 'budgetedAmount', parseFloat(e.target.value) || 0)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeBudgetItem(index)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {budgetItems.length > 0 && (
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Total por Categoria:</span>
              <span className="text-lg font-bold">R$ {totalBudgetByCategory.toFixed(2)}</span>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full">
          {initialData ? 'Atualizar Viagem' : 'Criar Viagem'}
        </Button>
      </form>
    </Form>
  );
}
