
"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Landmark } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { Transaction, TransactionFormData, CreditCard as CreditCardType, BankAccount } from '@/lib/types';
import { CARD_BRANDS } from './categories';
import { useAllCategories } from '@/hooks/useAllCategories';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useTravelEvents } from '@/hooks/useTravelEvents';

const NO_CARD_SELECTED_VALUE = "NO_CARD_SELECTED";
const NO_BANK_ACCOUNT_SELECTED_VALUE = "NO_BANK_ACCOUNT_SELECTED";

const formSchema = z.object({
  description: z.string().min(2, { message: 'Descrição deve ter pelo menos 2 caracteres.' }).max(100, { message: 'Descrição não pode ter mais de 100 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'Valor deve ser positivo.' }),
  type: z.enum(['income', 'expense'], { required_error: 'Tipo é obrigatório.' }),
  category: z.string().min(1, { message: 'Categoria é obrigatória.' }),
  date: z.date({ required_error: 'Data é obrigatória.' }),
  status: z.enum(['paid', 'pending'], { required_error: 'Status é obrigatório.' }),
  creditCardId: z.string().optional(),
  cardBrand: z.string().optional(),
  bankAccountId: z.string().optional(),
  travelId: z.string().optional(),
});


interface TransactionFormProps {
  onSubmitSuccess?: () => void;
  initialData?: Transaction | null;
  onAddTransaction: (data: TransactionFormData) => void;
  onUpdateTransaction: (data: Transaction) => void;
}

export function TransactionForm({ onSubmitSuccess, initialData, onAddTransaction, onUpdateTransaction }: TransactionFormProps) {
  const { toast } = useToast();
  const { creditCards, getCreditCardById } = useCreditCards();
  const { bankAccounts } = useBankAccounts();
  const { getCategoriesByType, getCategoryByName } = useAllCategories();
  const { travelEvents } = useTravelEvents();
  
  const transactionValidationSchema = formSchema.refine(data => {
    // Não pode ter um bankAccountId e um creditCardId ao mesmo tempo para despesas.
    if (data.type === 'expense' && data.bankAccountId && data.bankAccountId !== NO_BANK_ACCOUNT_SELECTED_VALUE && data.creditCardId && data.creditCardId !== NO_CARD_SELECTED_VALUE) {
      return false;
    }
    return true;
  }, {
    message: 'Uma despesa não pode ser associada a um cartão de crédito e a uma conta bancária simultaneamente.',
    path: ['bankAccountId'], 
  });


  const form = useForm<z.infer<typeof transactionValidationSchema>>({
    resolver: zodResolver(transactionValidationSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          date: new Date(initialData.date),
          amount: Math.abs(initialData.amount), 
          status: initialData.status || 'paid',
          creditCardId: initialData.creditCardId || NO_CARD_SELECTED_VALUE,
          cardBrand: initialData.cardBrand || '',
          bankAccountId: initialData.bankAccountId || NO_BANK_ACCOUNT_SELECTED_VALUE,
          travelId: initialData.travelId || '',
        }
      : {
          description: '',
          amount: 0,
          type: 'expense',
          category: '',
          date: new Date(),
          status: 'paid',
          creditCardId: NO_CARD_SELECTED_VALUE,
          cardBrand: '',
          bankAccountId: NO_BANK_ACCOUNT_SELECTED_VALUE,
          travelId: '',
        },
  });

  const transactionType = form.watch('type');
  const selectedCategoryName = form.watch('category');
  const selectedCreditCardId = form.watch('creditCardId');
  const selectedBankAccountId = form.watch('bankAccountId');

  const availableCategories = getCategoriesByType(transactionType);
  
  const selectedCategoryConfig = React.useMemo(() => {
    return getCategoryByName(selectedCategoryName);
  }, [selectedCategoryName, getCategoryByName]);

  const showCardFields = selectedCategoryConfig?.isCreditCard && transactionType === 'expense';
  // Mostrar campo de conta bancária se não for uma despesa de cartão de crédito OU se for receita
  const showBankAccountField = !showCardFields;

  React.useEffect(() => {
    // Ao selecionar "Saldo em Conta", forçar o tipo para "income"
    if (selectedCategoryName === 'Saldo em Conta') form.setValue('type', 'income');
  }, [selectedCategoryName, form]);


  React.useEffect(() => {
    form.setValue('category', ''); 
    form.setValue('creditCardId', NO_CARD_SELECTED_VALUE);
    form.setValue('cardBrand', '');
    form.setValue('bankAccountId', NO_BANK_ACCOUNT_SELECTED_VALUE);
  }, [transactionType, form]);

  React.useEffect(() => {
    if (!showCardFields) {
      form.setValue('creditCardId', NO_CARD_SELECTED_VALUE);
      form.setValue('cardBrand', '');
    } else {
       // Se virar despesa de cartão, deselecionar conta bancária
      form.setValue('bankAccountId', NO_BANK_ACCOUNT_SELECTED_VALUE);
    }
  }, [showCardFields, form]);
  
  // Lógica para desabilitar campos dependendo da seleção
  React.useEffect(() => {
    if (selectedCategoryName === 'Saldo em Conta') {
      form.setValue('creditCardId', NO_CARD_SELECTED_VALUE);
      form.setValue('cardBrand', '');
    }
  }, [selectedCategoryName, form]);

  React.useEffect(() => {
    if (selectedCreditCardId && selectedCreditCardId !== NO_CARD_SELECTED_VALUE) {
      const card = getCreditCardById(selectedCreditCardId);
      if (card) {
        form.setValue('cardBrand', card.cardFlag);
      }
      form.setValue('bankAccountId', NO_BANK_ACCOUNT_SELECTED_VALUE); // Garante que conta seja desmarcada
    }
  }, [selectedCreditCardId, getCreditCardById, form]);

  React.useEffect(() => {
    if (selectedBankAccountId && selectedBankAccountId !== NO_BANK_ACCOUNT_SELECTED_VALUE) {
      form.setValue('creditCardId', NO_CARD_SELECTED_VALUE); // Garante que cartão seja desmarcado
      form.setValue('cardBrand', '');
    }
  }, [selectedBankAccountId, form]);


  function onSubmit(values: z.infer<typeof transactionValidationSchema>) {
    const isCreditCardExpenseItem = values.type === 'expense' && getCategoryByName(values.category)?.isCreditCard;

    const transactionData: TransactionFormData = {
      description: values.description,
      amount: values.type === 'expense' ? -Math.abs(values.amount) : Math.abs(values.amount),
      type: values.type,
      category: values.category,
      date: values.date.toISOString(),
      status: values.status,
      creditCardId: isCreditCardExpenseItem && values.creditCardId && values.creditCardId !== NO_CARD_SELECTED_VALUE 
                      ? values.creditCardId 
                      : undefined,
      cardBrand: isCreditCardExpenseItem && values.cardBrand ? values.cardBrand : undefined,
      bankAccountId: values.bankAccountId && values.bankAccountId !== NO_BANK_ACCOUNT_SELECTED_VALUE && !isCreditCardExpenseItem
                      ? values.bankAccountId
                      : undefined,
      travelId: values.travelId && values.travelId !== "none" ? values.travelId : undefined,
    };

    try {
      if (initialData) {
        onUpdateTransaction({ ...transactionData, id: initialData.id });
        toast({ title: "Sucesso!", description: "Transação atualizada." });
      } else {
        onAddTransaction(transactionData);
        toast({ title: "Sucesso!", description: "Transação adicionada." });
      }
      form.reset({
        description: '',
        amount: 0,
        type: 'expense',
        category: '',
        date: new Date(),
        status: 'paid',
        creditCardId: NO_CARD_SELECTED_VALUE,
        cardBrand: '',
        bankAccountId: NO_BANK_ACCOUNT_SELECTED_VALUE,
        travelId: '',
      });
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro!", description: "Não foi possível salvar a transação." });
      console.error("Failed to save transaction", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Almoço, Salário" {...field} />
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
                <Input type="number" step="0.01" placeholder="Ex: 50.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                    <FormControl>
                      <RadioGroupItem value="expense" />
                    </FormControl>
                    <FormLabel className="font-normal">Despesa</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="income" />
                    </FormControl>
                    <FormLabel className="font-normal">Receita</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="paid" />
                    </FormControl>
                    <FormLabel className="font-normal">Pago</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="pending" />
                    </FormControl>
                    <FormLabel className="font-normal">Pendente</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableCategories.map(cat => (
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
        
        {showCardFields && (
          <>
            <FormField
              control={form.control}
              name="creditCardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cartão Associado (Opcional)</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value && value !== NO_CARD_SELECTED_VALUE) {
                        const card = getCreditCardById(value);
                        if (card) form.setValue('cardBrand', card.cardFlag);
                         form.setValue('bankAccountId', NO_BANK_ACCOUNT_SELECTED_VALUE); // Deseleciona conta
                      }
                    }} 
                    value={field.value || NO_CARD_SELECTED_VALUE}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cartão ou insira a bandeira manualmente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_CARD_SELECTED_VALUE}>Nenhum / Entrada Manual de Bandeira</SelectItem>
                      {creditCards.map((card: CreditCardType) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.bankName} ({card.cardFlag})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardBrand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bandeira do Cartão</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ''}
                    disabled={selectedCreditCardId !== NO_CARD_SELECTED_VALUE && !!selectedCreditCardId} 
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a bandeira" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CARD_BRANDS.map(brand => (
                        <SelectItem key={brand.value} value={brand.value}>
                          {brand.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {showBankAccountField && (
           <FormField
            control={form.control}
            name="bankAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta Bancária Associada (Opcional)</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value && value !== NO_BANK_ACCOUNT_SELECTED_VALUE) {
                      form.setValue('creditCardId', NO_CARD_SELECTED_VALUE); // Deseleciona cartão
                      form.setValue('cardBrand', '');
                    }
                  }} 
                  value={field.value || NO_BANK_ACCOUNT_SELECTED_VALUE}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta bancária" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NO_BANK_ACCOUNT_SELECTED_VALUE}>Nenhuma</SelectItem>
                    {bankAccounts.map((account: BankAccount) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bankName} ({account.accountType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
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
                        format(field.value, "PPP", { locale: ptBR })
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
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
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
          name="travelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Viagem Associada (Opcional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma viagem" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {travelEvents.map((travel) => (
                    <SelectItem key={travel.id} value={travel.id}>
                      {travel.name} - {travel.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? 'Atualizar Transação' : 'Adicionar Transação'}
        </Button>
      </form>
    </Form>
  );
}
