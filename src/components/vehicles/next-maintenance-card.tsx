"use client";

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Wrench } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScheduledMaintenance } from '@/lib/types';

interface NextMaintenanceCardProps {
  nextMaintenance: ScheduledMaintenance | null;
}

export function NextMaintenanceCard({ nextMaintenance }: NextMaintenanceCardProps) {
  if (!nextMaintenance) {
    return null; // Don't render if no next maintenance is scheduled
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Próxima Revisão
        </CardTitle>
        <Wrench className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {format(parseISO(nextMaintenance.date), 'dd/MM/yyyy', { locale: ptBR })}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {nextMaintenance.description}
        </p>
         {nextMaintenance.observation && (
            <p className="text-xs text-muted-foreground mt-1">
                Obs: {nextMaintenance.observation}
            </p>
        )}
      </CardContent>
    </Card>
  );
}