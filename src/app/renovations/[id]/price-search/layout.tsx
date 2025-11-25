"use client";

import * as React from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRenovations } from '@/hooks/useRenovations';

export default function PriceSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
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

  const isWebSearch = pathname.includes('/web');
  const isAiSearch = pathname.includes('/ai');

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
          <h1 className="text-3xl font-bold font-headline">Pesquisa de Preços</h1>
          <p className="text-muted-foreground">{renovation.name}</p>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div className="flex gap-2 border-b">
        <Button
          variant={isWebSearch ? "default" : "ghost"}
          onClick={() => router.push(`/renovations/${renovationId}/price-search/web`)}
          className="rounded-b-none"
        >
          🔍 Pesquisa Web
        </Button>
        <Button
          variant={isAiSearch ? "default" : "ghost"}
          onClick={() => router.push(`/renovations/${renovationId}/price-search/ai`)}
          className="rounded-b-none"
        >
          🤖 Pesquisa com IA
        </Button>
      </div>

      {children}
    </div>
  );
}
