"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRenovations } from '@/hooks/useRenovations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { RenovationForm } from '@/components/renovations/renovation-form';
import { useToast } from '@/hooks/use-toast';
import type { Renovation } from '@/lib/types';

export default function EditRenovationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const renovationId = params.id as string;
  
  const { getRenovationById, updateRenovation } = useRenovations();
  const renovation = getRenovationById(renovationId);

  if (!renovation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Reforma não encontrada</h2>
        <Button onClick={() => router.push('/renovations')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Reformas
        </Button>
      </div>
    );
  }

  const handleSubmit = (data: Partial<Renovation>) => {
    updateRenovation({
      ...renovation,
      ...data,
    });

    toast({
      title: 'Reforma atualizada',
      description: 'As alterações foram salvas com sucesso',
    });

    router.push(`/renovations/${renovationId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/renovations/${renovationId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-headline">Editar Reforma</h1>
          <p className="text-muted-foreground">{renovation.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Reforma</CardTitle>
          <CardDescription>
            Atualize as informações desta reforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RenovationForm
            initialData={renovation}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/renovations/${renovationId}`)}
            submitLabel="Salvar Alterações"
          />
        </CardContent>
      </Card>
    </div>
  );
}
