"use client";
import * as React from 'react';
import { CalendarPlus } from 'lucide-react';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ScheduledMaintenance } from '@/lib/types';

interface AddToCalendarCardProps {
  nextMaintenance: ScheduledMaintenance | null;
}

export function AddToCalendarCard({ nextMaintenance }: AddToCalendarCardProps) {
    const handleAddToCalendar = () => {
        window.location.href = '/api/google-calendar';
    };

  if (!nextMaintenance) {
    return null; // Don't render if no next maintenance is scheduled
  }


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Adicionar ao Calendário
        </CardTitle>
        <CalendarPlus className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs text-muted-foreground mb-2">
            Envie a data da próxima revisão para o seu Google Calendar. (Requer autorização do Google)
        </CardDescription>
         <Button onClick={handleAddToCalendar} className="w-full">
            Adicionar ao Google Calendar
         </Button>
      </CardContent>
    </Card>
  );
}