
"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import type { CustomCategory, CustomCategoryFormData } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ICONS, getIconComponent } from './category-icons';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface CategoryFormProps {
  onSubmitSuccess?: () => void;
  initialData?: CustomCategory | null;
  onAddCategory: (data: CustomCategoryFormData) => void;
  onUpdateCategory: (data: CustomCategory) => void;
  existingCategoryNames: string[];
}

export function CategoryForm({
  onSubmitSuccess,
  initialData,
  onAddCategory,
  onUpdateCategory,
  existingCategoryNames
}: CategoryFormProps) {
  const { toast } = useToast();
  
  const categoryFormSchema = z.object({
    name: z.string().min(2, { message: 'Nome da categoria deve ter pelo menos 2 caracteres.' }).max(50)
      .refine(name => {
        const isEditing = !!initialData;
        const originalName = initialData?.name.toLowerCase();
        const currentName = name.toLowerCase();
        // If we are editing and the name hasn't changed, it's valid.
        if (isEditing && originalName === currentName) {
            return true;
        }
        // Otherwise, check if the name is already taken by any other category.
        return !existingCategoryNames.some(existingName => existingName.toLowerCase() === currentName);
      }, {
        message: 'Este nome de categoria já existe.',
      }),
    type: z.enum(['income', 'expense'], { required_error: 'O tipo da categoria é obrigatório.' }),
    icon: z.string({ required_error: 'É obrigatório selecionar um ícone.' }),
  });


  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type,
          icon: initialData.icon,
        }
      : {
          name: '',
          type: 'expense',
          icon: '',
        },
  });

  const selectedIcon = form.watch('icon');

  function onSubmit(values: z.infer<typeof categoryFormSchema>) {
    const categoryFormData: CustomCategoryFormData = {
      name: values.name,
      type: values.type,
      icon: values.icon,
    };

    try {
      if (initialData) {
        onUpdateCategory({ ...categoryFormData, id: initialData.id });
        toast({ title: "Sucesso!", description: "Categoria atualizada." });
      } else {
        onAddCategory(categoryFormData);
        toast({ title: "Sucesso!", description: "Categoria adicionada." });
      }
      form.reset();
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro!", description: "Não foi possível salvar a categoria." });
      console.error("Failed to save category", error);
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
              <FormLabel>Nome da Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Assinaturas, Pet" {...field} />
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
                  value={field.value}
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="expense" /></FormControl>
                    <FormLabel className="font-normal">Despesa</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="income" /></FormControl>
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
          name="icon"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Ícone</FormLabel>
                <FormDescription>Selecione um ícone para sua categoria.</FormDescription>
                <ScrollArea className="h-48 w-full rounded-md border">
                    <div className="p-4 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
                        <TooltipProvider>
                        {ICONS.map(({ name, icon: IconComponent }) => (
                            <Tooltip key={name}>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className={cn("h-11 w-11", selectedIcon === name && "ring-2 ring-primary")}
                                        onClick={() => field.onChange(name)}
                                    >
                                        <IconComponent className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        </TooltipProvider>
                    </div>
                </ScrollArea>
                <FormMessage />
            </FormItem>
          )}
        />


        <Button type="submit" className="w-full">
          {initialData ? 'Atualizar Categoria' : 'Adicionar Categoria'}
        </Button>
      </form>
    </Form>
  );
}

