"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRenovations } from '@/hooks/useRenovations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RenovationMaterialsPage() {
  const params = useParams();
  const router = useRouter();
  const renovationId = params.id as string;
  
  const { getRenovationById } = useRenovations();
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
          <h1 className="text-3xl font-bold font-headline">Materiais</h1>
          <p className="text-muted-foreground">{renovation.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Materiais</CardTitle>
          <CardDescription>
            Adicione e gerencie os materiais desta reforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Página em desenvolvimento</p>
            <p className="text-sm mt-2">Em breve você poderá adicionar e gerenciar materiais aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
