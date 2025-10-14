
"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, File, X } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';
import type { Vehicle, VehicleExpense, VehicleExpenseFormData, FuelType } from '@/lib/types';
import { Textarea } from '../ui/textarea';

const expenseTypeOptions = [
  { value: 'fuel', label: 'Combustível' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'documents', label: 'Documentação' },
  { value: 'insurance', label: 'Seguro' },
  { value: 'other', label: 'Outro' },
] as const;

const fuelTypeOptions: { value: FuelType; label: string }[] = [
    { value: 'common_gasoline', label: 'Gasolina Comum' },
    { value: 'additive_gasoline', label: 'Gasolina Aditivada' },
    { value: 'premium_gasoline', label: 'Gasolina Premium (Podium)' },
    { value: 'alcohol', label: 'Álcool (Etanol)' },
];

const maintenanceCategoryOptions = [
    { value: 'Troca de Óleo e Filtros', label: 'Troca de Óleo e Filtros' },
    { value: 'Sistema de Freios', label: 'Sistema de Freios' },
    { value: 'Pneus e Rodas', label: 'Pneus e Rodas' },
    { value: 'Suspensão e Direção', label: 'Suspensão e Direção' },
    { value: 'Sistema Elétrico', label: 'Sistema Elétrico' },
    { value: 'Motor e Transmissão', label: 'Motor e Transmissão' },
    { value: 'Alinhamento e Balanceamento', label: 'Alinhamento e Balanceamento' },
    { value: 'Revisão Periódica', label: 'Revisão Periódica' },
    { value: 'Outros Serviços', label: 'Outros Serviços' },
] as const;

const formSchema = z.object({
  vehicleId: z.string().min(1, { message: 'É obrigatório selecionar um veículo.' }),
  date: z.date({ required_error: 'Data é obrigatória.' }),
  description: z.string().min(2, { message: 'Descrição deve ter pelo menos 2 caracteres.' }).max(100, { message: 'Descrição não pode ter mais de 100 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'Valor deve ser um número positivo.' }),
  expenseType: z.enum(['fuel', 'maintenance', 'documents', 'insurance', 'other'], { required_error: 'Tipo de despesa é obrigatório.' }),
  odometer: z.coerce.number().int().nonnegative({ message: 'Quilometragem deve ser um número positivo.' }),
  liters: z.coerce.number().positive({ message: 'Litros deve ser um número positivo.' }).optional(),
  station: z.string().max(50, { message: 'Nome do posto não pode ter mais de 50 caracteres.' }).optional(),
  fuelType: z.enum(['alcohol', 'common_gasoline', 'additive_gasoline', 'premium_gasoline']).optional(),
  maintenanceType: z.string().optional(),
  quantity: z.coerce.number().int().positive({ message: "Quantidade deve ser positiva"}).optional(),
  fileDataUri: z.string().optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
}).refine(data => {
    if (data.expenseType === 'fuel' && (!data.liters || data.liters <= 0)) {
        return false;
    }
    return true;
}, {
    message: "Para despesas de combustível, o campo 'Litros' é obrigatório e deve ser maior que zero.",
    path: ['liters'],
});

interface VehicleExpenseFormProps {
  onSubmitSuccess?: () => void;
  initialData?: VehicleExpense | null;
  vehicles: Vehicle[];
  currentVehicleId?: string;
  onAddExpense: (data: VehicleExpenseFormData) => void;
  onUpdateExpense: (data: VehicleExpense) => void;
  defaultType?: 'fuel' | 'maintenance' | 'documents' | 'insurance' | 'other';
}

export function VehicleExpenseForm({
  onSubmitSuccess,
  initialData,
  vehicles,
  currentVehicleId,
  onAddExpense,
  onUpdateExpense,
  defaultType,
}: VehicleExpenseFormProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? { ...initialData, date: new Date(initialData.date), liters: initialData.liters || undefined, station: initialData.station || '', fuelType: initialData.fuelType || undefined, maintenanceType: initialData.maintenanceType || '', quantity: initialData.quantity || undefined, fileDataUri: initialData.fileDataUri || undefined, fileName: initialData.fileName || undefined, fileType: initialData.fileType || undefined }
      : {
          vehicleId: currentVehicleId || '',
          date: new Date(),
          description: '',
          amount: 0,
          expenseType: defaultType || 'fuel',
          odometer: 0,
          liters: undefined,
          station: '',
          fuelType: undefined,
          maintenanceType: '',
          quantity: undefined,
          fileDataUri: undefined,
          fileName: undefined,
          fileType: undefined,
        },
  });

  const expenseType = form.watch('expenseType');
  const fileName = form.watch('fileName');
  
  React.useEffect(() => {
    if (expenseType === 'maintenance') {
        if (!form.getValues('description')) form.setValue('description', 'Manutenção');
    } else if(expenseType === 'fuel' && !form.getValues('description')) {
        form.setValue('description', 'Abastecimento');
    } else if (expenseType !== 'fuel' && form.getValues('description') === 'Abastecimento') {
        form.setValue('description', '');
    } else if (expenseType !== 'maintenance' && form.getValues('description') === 'Manutenção') {
        form.setValue('description', '');
    }

    if (expenseType !== 'maintenance') {
        form.setValue('maintenanceType', '');
        form.setValue('quantity', undefined);
    }
  }, [expenseType, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({
            variant: "destructive",
            title: "Arquivo muito grande",
            description: "Por favor, selecione um arquivo com menos de 1MB.",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('fileDataUri', reader.result as string, { shouldValidate: true });
        form.setValue('fileName', file.name);
        form.setValue('fileType', file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
      form.setValue('fileDataUri', undefined);
      form.setValue('fileName', undefined);
      form.setValue('fileType', undefined);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const expenseData: VehicleExpenseFormData = {
      ...values,
      date: values.date.toISOString(),
      fuelType: values.expenseType === 'fuel' ? values.fuelType : undefined,
      maintenanceType: values.expenseType === 'maintenance' ? values.maintenanceType : undefined,
      quantity: values.expenseType === 'maintenance' ? values.quantity : undefined,
      fileDataUri: values.fileDataUri,
      fileName: values.fileName,
      fileType: values.fileType,
    };

    try {
      if (initialData) {
        onUpdateExpense({ ...expenseData, id: initialData.id });
        toast({ title: "Sucesso!", description: "Despesa do veículo atualizada." });
      } else {
        onAddExpense(expenseData);
        toast({ title: "Sucesso!", description: "Despesa do veículo adicionada." });
      }
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro!", description: "Não foi possível salvar a despesa." });
      console.error("Failed to save vehicle expense", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Veículo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.brand} {v.model})
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
          name="expenseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Despesa</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={!!initialData || defaultType === 'maintenance'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseTypeOptions.map(option => (
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

        {expenseType === 'maintenance' && (
          <FormField
              control={form.control}
              name="maintenanceType"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Categoria da Manutenção</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ''}>
                      <FormControl>
                      <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria do serviço" />
                      </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                      {maintenanceCategoryOptions.map(option => (
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
        )}
        
        <div className={cn("grid grid-cols-1 gap-4", expenseType === 'maintenance' ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="150.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
             {expenseType === 'maintenance' && (
                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Quantidade</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
             )}
            <FormField
                control={form.control}
                name="odometer"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>KM do Veículo</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="50000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>

        {expenseType === 'fuel' && (
             <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="liters"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Litros</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="30.5" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="station"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Posto (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Posto Ipiranga" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                 <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Combustível (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ''}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de combustível" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {fuelTypeOptions.map(option => (
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
             </>
        )}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder={expenseType === 'fuel' ? 'Opcional (ex: Gasolina aditivada)' : 'Ex: Troca de óleo, IPVA 2024'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="fileDataUri"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Anexar Documento/Comprovante (Opcional)</FormLabel>
                    {fileName && (
                        <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                            <div className="flex items-center gap-2 text-sm">
                                <File className="h-4 w-4" />
                                <span className="truncate max-w-xs">{fileName}</span>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveFile}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <FormControl>
                        <Input 
                            ref={fileInputRef}
                            type="file" 
                            onChange={handleFileChange} 
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png"
                            className="pt-1.5"
                        />
                    </FormControl>
                    <FormDescription>Anexe a nota fiscal, comprovante ou ordem de serviço. (Max 1MB)</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data da Despesa</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
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
          {initialData ? 'Atualizar Despesa' : 'Adicionar Despesa'}
        </Button>
      </form>
    </Form>
  );
}
