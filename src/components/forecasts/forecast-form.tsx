
"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, TrendingUp, TrendingDown, CreditCard as CreditCardIconLucide } from 'lucide-react';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { ForecastItem, ForecastItemFormData, CreditCard as CreditCardType } from '@/lib/types';
import { useAllCategories } from '@/hooks/useAllCategories';
import { useCreditCards } from '@/hooks/useCreditCards';
import { Separator } from '../ui/separator';

const NO_CARD_SELECTED_VALUE = "NO_CARD_SELECTED";

const forecastItemFormSchema = z.object({
  description: z.string().min(2, { message: 'Descrição deve ter pelo menos 2 caracteres.' }).max(100, { message: 'Descrição não pode ter mais de 100 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'Valor deve ser positivo.' }),
  type: z.enum(['income', 'expense'], { required_error: 'Tipo é obrigatório.' }),
  category: z.string().min(1, { message: 'Categoria é obrigatória.' }),
  date: z.date({ required_error: 'Data (mês da previsão) é obrigatória.' }),
  creditCardId: z.string().optional(),
  explicitBankName: z.string().max(50, { message: 'Nome do banco não pode ter mais de 50 caracteres.' }).optional(),
  isFixed: z.boolean().optional(),
  // Installment fields
  isInstallment: z.boolean().default(false),
  currentInstallment: z.coerce.number().int().min(1, 'Deve ser no mínimo 1.').optional(),
  totalInstallments: z.coerce.number().int().min(2, 'Deve ser no mínimo 2.').optional(),
  // Recurring fields
  isRecurring: z.boolean().default(false),
  recurringMonths: z.coerce.number().int().min(1).max(24).optional(),
});


interface ForecastItemFormProps {
  onSubmitSuccess?: () => void;
  initialData?: ForecastItem | null;
  onAddForecastItem: (data: ForecastItemFormData) => void;
  onUpdateForecastItem: (data: ForecastItem) => void;
}

type ForecastKind = 'income' | 'general_expense' | 'card_expense';

export function ForecastForm({ 
  onSubmitSuccess, 
  initialData, 
  onAddForecastItem, 
  onUpdateForecastItem 
}: ForecastItemFormProps) {
  const { toast } = useToast();
  const { creditCards } = useCreditCards();
  const { getCategoriesByType, getCategoryByName } = useAllCategories();
  const isEditingInstallment = !!initialData?.installmentId;
  
  const forecastItemValidationSchema = forecastItemFormSchema.refine(data => {
    const categoryConfig = getCategoryByName(data.category);
    const isCreditCardExpense = data.type === 'expense' && categoryConfig?.isCreditCard;
    if (isCreditCardExpense && data.creditCardId && data.creditCardId !== NO_CARD_SELECTED_VALUE && data.explicitBankName) {
      return false; // Não pode ter ambos
    }
    return true;
  }, {
    message: 'Não é possível selecionar um cartão e também digitar um nome de banco. Escolha apenas um.',
    path: ['explicitBankName'], // ou path: ['creditCardId'] ou path global
  }).refine(data => {
      if (data.isInstallment) {
        return data.currentInstallment !== undefined && data.currentInstallment > 0 && data.totalInstallments !== undefined && data.totalInstallments > 0;
      }
      return true;
    }, {
      message: 'Para compras parceladas, os campos de parcela atual e total são obrigatórios.',
      path: ['isInstallment'], 
    }).refine(data => {
      if (data.isInstallment && data.currentInstallment && data.totalInstallments) {
        return data.currentInstallment <= data.totalInstallments;
      }
      return true;
    }, {
      message: 'A parcela atual não pode ser maior que o total de parcelas.',
      path: ['currentInstallment'],
    }).refine(data => {
      if (data.isRecurring) {
        return data.recurringMonths !== undefined && data.recurringMonths > 0;
      }
      return true;
    }, {
      message: 'Para previsões recorrentes, o número de meses é obrigatório.',
      path: ['isRecurring'],
    }).refine(data => {
      if (data.isInstallment && data.isRecurring) {
        return false;
      }
      return true;
    }, {
      message: 'Não é possível ter uma previsão parcelada e recorrente ao mesmo tempo.',
      path: ['isRecurring'],
    });

  const form = useForm<z.infer<typeof forecastItemValidationSchema>>({
    resolver: zodResolver(forecastItemValidationSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          date: new Date(initialData.date),
          amount: Math.abs(initialData.amount), 
          creditCardId: initialData.creditCardId || NO_CARD_SELECTED_VALUE,
          explicitBankName: initialData.explicitBankName || '',
          isFixed: initialData.type === 'expense' ? (initialData.isFixed ?? false) : false,
          isInstallment: isEditingInstallment,
          currentInstallment: initialData.currentInstallment,
          totalInstallments: initialData.totalInstallments,
          isRecurring: false,
          recurringMonths: 12,
        }
      : {
          description: '',
          amount: 0,
          type: 'expense',
          category: '',
          date: startOfMonth(new Date()),
          creditCardId: NO_CARD_SELECTED_VALUE,
          explicitBankName: '',
          isFixed: false,
          isInstallment: false,
          currentInstallment: 1,
          totalInstallments: 2,
          isRecurring: false,
          recurringMonths: 12,
        },
  });

  const [forecastKind, setForecastKind] = React.useState<ForecastKind>(() => {
    if (initialData) {
      if (initialData.type === 'income') return 'income';
      if (getCategoryByName(initialData.category)?.isCreditCard) return 'card_expense';
      return 'general_expense';
    }
    return 'general_expense';
  });

  const forecastType = form.watch('type');
  const selectedCategoryName = form.watch('category');
  const watchCreditCardId = form.watch('creditCardId');
  const isInstallment = form.watch('isInstallment');
  const isRecurring = form.watch('isRecurring');

  React.useEffect(() => {
    if (forecastKind === 'income') {
      form.setValue('type', 'income');
      form.setValue('creditCardId', NO_CARD_SELECTED_VALUE);
      form.setValue('explicitBankName', '');
      form.setValue('isFixed', false);
      form.setValue('isInstallment', false);
    } else if (forecastKind === 'general_expense') {
      form.setValue('type', 'expense');
      form.setValue('creditCardId', NO_CARD_SELECTED_VALUE);
      form.setValue('explicitBankName', '');
      form.setValue('isInstallment', false);
      if (getCategoryByName(form.getValues('category'))?.isCreditCard) {
        form.setValue('category', '');
      }
    } else if (forecastKind === 'card_expense') {
      form.setValue('type', 'expense');
      const creditCardCategory = getCategoriesByType('expense').find(c => c.isCreditCard)?.name;
      if (creditCardCategory) {
          form.setValue('category', creditCardCategory);
      }
    }
  }, [forecastKind, form, getCategoriesByType, getCategoryByName]);

  React.useEffect(() => {
    if (isInstallment) {
      form.setValue('isRecurring', false);
    }
  }, [isInstallment, form]);

  React.useEffect(() => {
    if (isRecurring) {
      form.setValue('isInstallment', false);
    }
  }, [isRecurring, form]);

  const availableCategories = getCategoriesByType(forecastType);
  const selectedCategoryConfig = React.useMemo(() => getCategoryByName(selectedCategoryName), [selectedCategoryName, getCategoryByName]);
  const showCreditCardField = forecastType === 'expense' && selectedCategoryConfig?.isCreditCard;
  const allowExplicitBankName = showCreditCardField && (watchCreditCardId === NO_CARD_SELECTED_VALUE || !watchCreditCardId);
  const showIsFixedField = forecastType === 'expense' && !isInstallment && !isRecurring;
  const showInstallmentFields = showCreditCardField;
  const showRecurringFields = !isInstallment;

  React.useEffect(() => {
    if (showCreditCardField && watchCreditCardId && watchCreditCardId !== NO_CARD_SELECTED_VALUE) {
      form.setValue('explicitBankName', ''); // Clear manual bank name if a card is selected
    }
  }, [watchCreditCardId, showCreditCardField, form]);

  function onSubmit(values: z.infer<typeof forecastItemValidationSchema>) {
    const categoryConfig = getCategoryByName(values.category);
    const isCreditCardExpense = values.type === 'expense' && categoryConfig?.isCreditCard;

    const forecastItemData = {
      description: values.description,
      amount: values.type === 'expense' ? -Math.abs(values.amount) : Math.abs(values.amount),
      type: values.type,
      category: values.category,
      date: startOfMonth(values.date).toISOString(),
      creditCardId: isCreditCardExpense && values.creditCardId && values.creditCardId !== NO_CARD_SELECTED_VALUE ? values.creditCardId : undefined,
      explicitBankName: isCreditCardExpense && (values.creditCardId === NO_CARD_SELECTED_VALUE || !values.creditCardId) && values.explicitBankName ? values.explicitBankName.trim() : undefined,
      isFixed: values.type === 'expense' ? values.isFixed : false,
      isInstallment: values.isInstallment,
      currentInstallment: values.currentInstallment,
      totalInstallments: values.totalInstallments,
      isRecurring: values.isRecurring,
      recurringMonths: values.recurringMonths,
    } as ForecastItemFormData;
    
    try {
      if (initialData) {
        onUpdateForecastItem({ ...forecastItemData, id: initialData.id, installmentId: initialData.installmentId });
        toast({ title: "Sucesso!", description: "Previsão atualizada." });
      } else {
        onAddForecastItem(forecastItemData);
        toast({ title: "Sucesso!", description: "Previsão(ões) adicionada(s)." });
      }
      form.reset({
        description: '',
        amount: 0,
        type: 'expense',
        category: '',
        date: startOfMonth(new Date()),
        creditCardId: NO_CARD_SELECTED_VALUE,
        explicitBankName: '',
        isFixed: false,
        isInstallment: false,
        currentInstallment: 1,
        totalInstallments: 2,
        isRecurring: false,
        recurringMonths: 12,
      });
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro!", description: "Não foi possível salvar a previsão." });
      console.error("Failed to save forecast item", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Mês da Previsão</FormLabel>
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
                        format(field.value, "MMMM yyyy", { locale: ptBR })
                      ) : (
                        <span>Escolha um mês</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => field.onChange(date ? startOfMonth(date) : undefined)}
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear() - 5}
                    toYear={new Date().getFullYear() + 5}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Provisão de bônus, Fatura cartão X" {...field} />
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
                <Input type="number" step="0.01" placeholder="1000.00" {...field} />
              </FormControl>
              <FormDescription>Se for parcelado, insira o valor de uma única parcela.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem className="space-y-3">
          <FormLabel>Tipo de Previsão</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => setForecastKind(value as ForecastKind)}
              value={forecastKind}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="income" id="kind_income" />
                </FormControl>
                <FormLabel htmlFor="kind_income" className="font-normal flex items-center cursor-pointer">
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" /> Receita
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="general_expense" id="kind_general_expense" />
                </FormControl>
                <FormLabel htmlFor="kind_general_expense" className="font-normal flex items-center cursor-pointer">
                  <TrendingDown className="mr-1 h-4 w-4 text-destructive" /> Despesa
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroupItem value="card_expense" id="kind_card_expense" />
                </FormControl>
                <FormLabel htmlFor="kind_card_expense" className="font-normal flex items-center cursor-pointer">
                  <CreditCardIconLucide className="mr-1 h-4 w-4 text-blue-500" /> Compra Cartão
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
        </FormItem>

        {forecastKind !== 'card_expense' && (
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria para a previsão" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCategories
                      .filter(c => (forecastKind === 'general_expense' ? !c.isCreditCard : true))
                      .map(cat => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {showCreditCardField && (
          <>
            <FormField
              control={form.control}
              name="creditCardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cartão de Crédito Associado</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value && value !== NO_CARD_SELECTED_VALUE) {
                        form.setValue('explicitBankName', ''); // Clear manual bank name
                      }
                    }} 
                    defaultValue={field.value} 
                    value={field.value || NO_CARD_SELECTED_VALUE}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cartão (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_CARD_SELECTED_VALUE}>Nenhum (previsão geral de cartão)</SelectItem>
                      {creditCards.map((card: CreditCardType) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.bankName} ({card.cardFlag}) - Vence dia {card.dueDateDay}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {allowExplicitBankName && (
              <FormField
                control={form.control}
                name="explicitBankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Banco (Opcional, se nenhum cartão selecionado)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Nubank, Inter" 
                        {...field} 
                        disabled={!allowExplicitBankName || (!!watchCreditCardId && watchCreditCardId !== NO_CARD_SELECTED_VALUE)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        {showInstallmentFields && (
            <>
                <Separator />
                 <FormField
                    control={form.control}
                    name="isInstallment"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Compra Parcelada?</FormLabel>
                             <FormDescription>
                                Marque para criar previsões para cada parcela.
                            </FormDescription>
                        </div>
                        <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isEditingInstallment}
                        />
                        </FormControl>
                    </FormItem>
                    )}
                />
                {isInstallment && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <FormField
                            control={form.control}
                            name="currentInstallment"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parcela Atual</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="1" {...field} disabled={isEditingInstallment} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="totalInstallments"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total de Parcelas</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="12" {...field} disabled={isEditingInstallment} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                )}
                <Separator />
            </>
        )}

        {showRecurringFields && (
            <>
                <Separator />
                 <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Previsão Recorrente?</FormLabel>
                             <FormDescription>
                                Marque para criar previsões para vários meses consecutivos.
                            </FormDescription>
                        </div>
                        <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                    </FormItem>
                    )}
                />
                {isRecurring && (
                    <FormField
                        control={form.control}
                        name="recurringMonths"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Número de Meses</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value?.toString()} value={field.value?.toString()}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Selecione a duração" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="12">12 meses</SelectItem>
                                <SelectItem value="24">24 meses</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormDescription>
                                A previsão será criada para os próximos {field.value} meses a partir do mês selecionado.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
                <Separator />
            </>
        )}

        {showIsFixedField && (
          <FormField
            control={form.control}
            name="isFixed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Despesa Fixa?</FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full">
          {initialData ? 'Atualizar Previsão' : 'Adicionar Previsão'}
        </Button>
      </form>
    </Form>
  );
}
