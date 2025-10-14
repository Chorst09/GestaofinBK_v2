
"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { CreditCard, CreditCardFormData } from '@/lib/types';
import { CARD_BRANDS } from '@/components/transactions/categories';
import { bankLogoOptions, BankLogo } from '@/components/layout/BankLogo';

const creditCardFormSchema = z.object({
  bankName: z.string().min(2, { message: 'Nome do banco deve ter pelo menos 2 caracteres.' }).max(50, { message: 'Nome do banco não pode ter mais de 50 caracteres.' }),
  cardFlag: z.string().min(1, { message: 'Bandeira é obrigatória.' }),
  dueDateDay: z.coerce.number().int().min(1, { message: 'Dia deve ser entre 1 e 31.' }).max(31, { message: 'Dia deve ser entre 1 e 31.' }),
  creditLimit: z.coerce.number().positive({ message: 'Limite deve ser um número positivo.' }).optional().or(z.literal('')),
  logoKey: z.string().optional(),
  photoUrl: z.string().optional(),
});

interface CreditCardFormProps {
  onSubmitSuccess?: () => void;
  initialData?: CreditCard | null;
  onAddCreditCard: (data: CreditCardFormData) => void;
  onUpdateCreditCard: (data: CreditCard) => void;
}

export function CreditCardForm({
  onSubmitSuccess,
  initialData,
  onAddCreditCard,
  onUpdateCreditCard,
}: CreditCardFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof creditCardFormSchema>>({
    resolver: zodResolver(creditCardFormSchema),
    defaultValues: initialData
      ? {
          bankName: initialData.bankName,
          cardFlag: initialData.cardFlag,
          dueDateDay: initialData.dueDateDay,
          creditLimit: initialData.creditLimit ?? '',
          logoKey: initialData.logoKey ?? undefined,
          photoUrl: initialData.photoUrl ?? undefined,
        }
      : {
          bankName: '',
          cardFlag: '',
          dueDateDay: 1,
          creditLimit: '',
          logoKey: undefined,
          photoUrl: undefined,
        },
  });
  
  const { setValue } = form;
  const photoUrl = form.watch('photoUrl');
  const logoKey = form.watch('logoKey');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit for logos
        toast({
          variant: "destructive",
          title: "Imagem muito grande",
          description: "Por favor, selecione uma imagem com menos de 1MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('photoUrl', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  React.useEffect(() => {
    // When a predefined logo is selected, clear any uploaded photo.
    if (logoKey && logoKey !== 'none') {
      setValue('photoUrl', undefined, { shouldValidate: true });
    }
  }, [logoKey, setValue]);

  React.useEffect(() => {
    // When a custom photo is uploaded, clear the predefined logo selection.
    if (photoUrl) {
      setValue('logoKey', 'none', { shouldValidate: true });
    }
  }, [photoUrl, setValue]);


  function onSubmit(values: z.infer<typeof creditCardFormSchema>) {
    const cardFormData: CreditCardFormData = {
      bankName: values.bankName,
      cardFlag: values.cardFlag,
      dueDateDay: values.dueDateDay,
      creditLimit: values.creditLimit !== '' ? Number(values.creditLimit) : undefined,
      logoKey: values.logoKey === 'none' ? undefined : values.logoKey,
      photoUrl: values.photoUrl || undefined,
    };

    try {
      if (initialData) {
        onUpdateCreditCard({ ...cardFormData, id: initialData.id });
        toast({ title: "Sucesso!", description: "Cartão atualizado." });
      } else {
        onAddCreditCard(cardFormData);
        toast({ title: "Sucesso!", description: "Cartão adicionado." });
      }
      form.reset({
        bankName: '',
        cardFlag: '',
        dueDateDay: 1,
        creditLimit: '',
        logoKey: undefined,
        photoUrl: undefined,
      });
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro!", description: "Não foi possível salvar o cartão." });
      console.error("Failed to save credit card", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
                <BankLogo photoUrl={photoUrl} logoKey={logoKey} className="w-12 h-12 text-muted-foreground" />
            </div>
        </div>
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Banco</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Nubank, Inter, Itaú" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logoKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logotipo Pré-definido (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'none'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um logotipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum / Ícone Padrão ou Upload</SelectItem>
                  {bankLogoOptions.map(option => (
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
        <FormItem>
          <FormLabel>Ou Envie seu Logotipo</FormLabel>
          <FormControl>
            <Input 
              id="photo-upload" 
              type="file" 
              className="pt-1.5"
              accept="image/png, image/jpeg, image/webp" 
              onChange={handleFileChange} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
        <FormField
          control={form.control}
          name="cardFlag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bandeira</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
        <FormField
          control={form.control}
          name="dueDateDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dia do Vencimento da Fatura</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="31" placeholder="Ex: 10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="creditLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite do Cartão (R$) (Opcional)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Ex: 5000.00" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {initialData ? 'Atualizar Cartão' : 'Adicionar Cartão'}
        </Button>
      </form>
    </Form>
  );
}
