"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useRenovations } from '@/hooks/useRenovations';
import { RenovationForm } from '@/components/renovations/renovation-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RenovationFormData } from '@/lib/types';

export default function NewRenovationPage() {
  const router = useRouter();
  const { addRenovation } = useRenovations();
  const { toast } = useToast();

  const handleSubmit = (data: RenovationFormData) => {
    const newRenovation = addRenovation(data);
    toast({
      title: "Reforma criada!",
      description: `${newRenovation.name} foi adicionada com sucesso.`,
    });
    router.push('/renovations');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Nova Reforma</CardTitle>
          <CardDescription>
            Crie um novo projeto de reforma para controlar custos e acompanhar o progresso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RenovationForm onSubmit={handleSubmit} submitLabel="Criar Reforma" />
        </CardContent>
      </Card>
    </div>
  );
}
