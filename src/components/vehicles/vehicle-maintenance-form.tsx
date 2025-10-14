
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
import type { ScheduledMaintenance, ScheduledMaintenanceFormData, Vehicle } from '@/lib/types';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  vehicleId: z.string().min(1, { message: 'É obrigatório selecionar um veículo.' }),
  date: z.date({ required_error: 'Data é obrigatória.' }),
  odometer: z.coerce.number().int().positive({ message: 'KM deve ser um número positivo.' }),
  nextServiceOdometer: z.coerce.number().int().positive({ message: 'KM deve ser um número positivo.' }).optional(),
  description: z.string().min(3, { message: 'Descrição deve ter pelo menos 3 caracteres.' }).max(100),
  quantity: z.coerce.number().int().positive({ message: 'Quantidade deve ser um número inteiro positivo.' }).optional(),
  amount: z.coerce.number().positive({ message: 'Valor deve ser um número positivo.' }).optional(),
  fileDataUri: z.string().optional(),
  nextServiceDate: z.date().optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
});

interface VehicleMaintenanceFormProps {
  onSubmitSuccess?: () => void;
  initialData?: ScheduledMaintenance | null;
  vehicles: Vehicle[];
  currentVehicleId?: string;
  onAddMaintenance: (data: ScheduledMaintenanceFormData) => void;
  onUpdateMaintenance: (data: ScheduledMaintenance) => void;
}

export function VehicleMaintenanceForm({
  onSubmitSuccess,
  initialData,
  vehicles,
  currentVehicleId,
  onAddMaintenance,
  onUpdateMaintenance,
}: VehicleMaintenanceFormProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? { 
          ...initialData, 
          date: new Date(initialData.date), 
          nextServiceDate: initialData.nextServiceDate ? new Date(initialData.nextServiceDate) : undefined,
          quantity: initialData.quantity || undefined,
          amount: initialData.amount || undefined,
          nextServiceOdometer: initialData.nextServiceOdometer || undefined,
          fileDataUri: initialData.fileDataUri || undefined,
          fileName: initialData.fileName || undefined,
          fileType: initialData.fileType || undefined,
        }
      : {
          vehicleId: currentVehicleId || '',
          date: new Date(),
          odometer: 0,
          description: '',
          quantity: undefined,
          amount: undefined,
          nextServiceOdometer: undefined,
          nextServiceDate: undefined,
          fileDataUri: undefined,
          fileName: undefined,
          fileType: undefined,
        },
  });

  const fileName = form.watch('fileName');

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
    const maintenanceData: ScheduledMaintenanceFormData = {
      ...values,
      date: values.date.toISOString(),
      nextServiceDate: values.nextServiceDate?.toISOString() || undefined,
      nextServiceOdometer: values.nextServiceOdometer || undefined,
    };

    try {
      if (initialData) {
        onUpdateMaintenance({ ...maintenanceData, id: initialData.id });
        toast({ title: "Sucesso!", description: "Registro de manutenção atualizado." });
      } else {
        onAddMaintenance(maintenanceData);
        toast({ title: "Sucesso!", description: "Manutenção registrada." });
      }
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro!", description: "Não foi possível salvar o registro." });
      console.error("Failed to save maintenance record", error);
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Serviço/Peça</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Troca de óleo e filtro, Pneu dianteiro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do Serviço</FormLabel>
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
           <FormField
            control={form.control}
            name="nextServiceDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Próxima Revisão (Opc.)</FormLabel>
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
           <FormField
            control={form.control}
            name="odometer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KM do Serviço</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="nextServiceOdometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KM Próxima Revisão (Opc.)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="60000" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}/>
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
                    <FormLabel>Valor (R$) (Opcional)</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.01" placeholder="350.00" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade (Opcional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="fileDataUri"
          render={({ field }) => (
              <FormItem>
                  <FormLabel>Anexar Documento (Opcional)</FormLabel>
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
                          accept=".pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png"
                          className="pt-1.5"
                      />
                  </FormControl>
                  <FormDescription>Anexe a nota fiscal ou ordem de serviço. (Max 1MB)</FormDescription>
                  <FormMessage />
              </FormItem>
          )}
      />

        <Button type="submit" className="w-full">
          {initialData ? 'Atualizar Registro' : 'Salvar Registro'}
        </Button>
      </form>
    </Form>
  );
}
