"use client";

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Image from 'next/image';
import { Car, Sparkles, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Vehicle, VehicleFormData } from '@/lib/types';
import { BankLogo, vehicleLogoOptions } from '../layout/BankLogo';
import { generateVehicleImage } from '@/ai/flows/generate-vehicle-image-flow';
import { Separator } from '../ui/separator';

const vehicleFormSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres.' }).max(50, { message: 'Nome não pode ter mais de 50 caracteres.' }),
  brand: z.string().min(2, { message: 'Marca deve ter pelo menos 2 caracteres.' }).max(50, { message: 'Marca não pode ter mais de 50 caracteres.' }),
  model: z.string().min(1, { message: 'Modelo é obrigatório.' }).max(50, { message: 'Modelo não pode ter mais de 50 caracteres.' }),
  year: z.coerce.number().int().min(1900, { message: 'Ano deve ser maior que 1900.' }).max(new Date().getFullYear() + 1, { message: `Ano não pode ser maior que ${new Date().getFullYear() + 1}.` }),
  plate: z.string().max(10, { message: 'Placa não pode ter mais de 10 caracteres.' }).optional(),
  color: z.string().max(30, { message: 'Cor não pode ter mais de 30 caracteres.' }).optional(),
  purchaseOdometer: z.coerce.number().int().nonnegative({ message: 'KM da compra deve ser um número positivo.' }).optional().or(z.literal('')),
  photoUrl: z.string().optional(),
  logoKey: z.string().optional(),
});

interface VehicleFormProps {
  onSubmitSuccess?: () => void;
  initialData?: Vehicle | null;
  onAddVehicle: (data: VehicleFormData) => void;
  onUpdateVehicle: (data: Vehicle) => void;
}

export function VehicleForm({
  onSubmitSuccess,
  initialData,
  onAddVehicle,
  onUpdateVehicle,
}: VehicleFormProps) {
  const { toast } = useToast();
  const [isFetchingImage, setIsFetchingImage] = React.useState(false);

  const form = useForm<z.infer<typeof vehicleFormSchema>>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: initialData
      ? { ...initialData, plate: initialData.plate || '', color: initialData.color || '', purchaseOdometer: initialData.purchaseOdometer ?? '', photoUrl: initialData.photoUrl || '', logoKey: initialData.logoKey || 'none' }
      : {
          name: '',
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          plate: '',
          color: '',
          purchaseOdometer: '',
          photoUrl: '',
          logoKey: 'none',
        },
  });

  const { setValue, getValues, watch } = form;
  const photoUrl = watch('photoUrl');
  const logoKey = watch('logoKey');

  const handleFetchImage = async () => {
    const { brand, model, color } = getValues();
    if (!brand || !model) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha a marca e o modelo do veículo para buscar a imagem.",
      });
      return;
    }

    setIsFetchingImage(true);
    try {
      const result = await generateVehicleImage({ brand, model, color: color || undefined });
      if (result.imageDataUri) {
        setValue('photoUrl', result.imageDataUri, { shouldValidate: true });
        setValue('logoKey', 'none', { shouldValidate: true });
        toast({ title: "Imagem gerada!", description: "Uma imagem para o seu veículo foi criada." });
      } else {
        throw new Error("A IA não retornou uma imagem.");
      }
    } catch (error: any) {
      console.error("Failed to fetch vehicle image", error);
      toast({ variant: "destructive", title: "Erro ao buscar imagem", description: error.message || "Não foi possível gerar a imagem do veículo." });
    } finally {
      setIsFetchingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({
            variant: "destructive",
            title: "Arquivo muito grande",
            description: "Por favor, selecione uma imagem com menos de 1MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('photoUrl', reader.result as string, { shouldValidate: true });
        setValue('logoKey', 'none', { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: z.infer<typeof vehicleFormSchema>) {
    const vehicleData: VehicleFormData = {
        name: values.name,
        brand: values.brand,
        model: values.model,
        year: values.year,
        plate: values.plate,
        color: values.color,
        purchaseOdometer: values.purchaseOdometer !== '' ? Number(values.purchaseOdometer) : undefined,
        photoUrl: values.photoUrl || undefined,
        logoKey: values.logoKey === 'none' ? undefined : values.logoKey,
    };

    try {
      if (initialData) {
        onUpdateVehicle({ ...vehicleData, id: initialData.id });
        toast({ title: "Sucesso!", description: "Veículo atualizado." });
      } else {
        onAddVehicle(vehicleData);
        toast({ title: "Sucesso!", description: "Veículo adicionado." });
      }
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro!", description: "Não foi possível salvar o veículo." });
      console.error("Failed to save vehicle", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
            {photoUrl ? (
              <Image src={photoUrl} alt="Preview do veículo" width={128} height={128} className="object-cover w-full h-full" />
            ) : (
              <BankLogo logoKey={logoKey} type="vehicle" className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
            <Button type="button" onClick={handleFetchImage} disabled={isFetchingImage} className="w-full sm:w-auto">
              {isFetchingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isFetchingImage ? 'Buscando...' : 'Buscar Foto na Web (IA)'}
            </Button>
            <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                <FormLabel htmlFor="photo-upload" className="cursor-pointer">
                  {photoUrl ? 'Trocar Foto Manualmente' : 'Enviar Foto Manualmente'}
                </FormLabel>
            </Button>
          </div>
          <FormControl>
            <Input id="photo-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
          </FormControl>
        </div>
        <Separator />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apelido do Veículo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Carro da família, Moto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Honda, Volkswagen, Fiat" {...field} />
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
              <FormLabel>Logotipo da Marca (Opcional)</FormLabel>
              <Select 
                onValueChange={(value) => {
                    field.onChange(value);
                    if (value !== 'none') {
                        setValue('photoUrl', '', { shouldValidate: true });
                    }
                }} 
                value={field.value || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um logotipo para a marca" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum / Usar Foto Manual ou IA</SelectItem>
                  {vehicleLogoOptions.map(option => (
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
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Civic, Gol, Uno" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ex: 2023" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="ABC1D23" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Prata, Preto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="purchaseOdometer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KM da Compra (Opcional)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ex: 15000" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {initialData ? 'Atualizar Veículo' : 'Adicionar Veículo'}
        </Button>
      </form>
    </Form>
  );
}
