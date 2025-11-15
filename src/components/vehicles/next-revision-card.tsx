"use client";

import * as React from 'react';
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Calendar, Gauge, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, addMonths, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { VehicleExpense, Vehicle } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NextRevisionCardProps {
  vehicle: Vehicle;
  expenses: VehicleExpense[];
}

export function NextRevisionCard({ vehicle, expenses }: NextRevisionCardProps) {
  const lastRevision = React.useMemo(() => {
    // Filtrar apenas manutenções do tipo "Revisão" ou que contenham "revisão" na descrição
    const revisions = expenses.filter(expense => 
      expense.expenseType === 'maintenance' && 
      (expense.maintenanceType?.toLowerCase().includes('revisão') || 
       expense.maintenanceType?.toLowerCase().includes('revisao') ||
       expense.description.toLowerCase().includes('revisão') ||
       expense.description.toLowerCase().includes('revisao'))
    );

    if (revisions.length === 0) return null;

    // Ordenar por data (mais recente primeiro)
    revisions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return revisions[0];
  }, [expenses]);

  const nextRevision = React.useMemo(() => {
    if (!lastRevision) return null;

    const lastDate = new Date(lastRevision.date);
    const lastOdometer = lastRevision.odometer;

    // Calcular próxima revisão por data (12 meses)
    const nextDateByTime = addMonths(lastDate, 12);

    // Calcular próxima revisão por quilometragem (10.000 km)
    const nextOdometerByKm = lastOdometer + 10000;

    return {
      byDate: nextDateByTime,
      byOdometer: nextOdometerByKm,
      lastDate,
      lastOdometer,
    };
  }, [lastRevision]);

  const currentOdometer = React.useMemo(() => {
    // Pegar o odômetro mais recente de qualquer despesa
    if (expenses.length === 0) return vehicle.purchaseOdometer || 0;

    const sortedExpenses = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sortedExpenses[0].odometer;
  }, [expenses, vehicle.purchaseOdometer]);

  const status = React.useMemo(() => {
    if (!nextRevision) return 'no_data';

    const today = new Date();
    const daysUntilRevision = differenceInDays(nextRevision.byDate, today);
    const kmUntilRevision = nextRevision.byOdometer - currentOdometer;

    // Verificar se está atrasado
    if (daysUntilRevision < 0 || kmUntilRevision < 0) {
      return 'overdue';
    }

    // Verificar se está próximo (30 dias ou 1000 km)
    if (daysUntilRevision <= 30 || kmUntilRevision <= 1000) {
      return 'soon';
    }

    return 'ok';
  }, [nextRevision, currentOdometer]);

  const getStatusColor = () => {
    switch (status) {
      case 'overdue':
        return 'status-error border-2';
      case 'soon':
        return 'status-warning border-2';
      case 'ok':
        return 'status-success border-2';
      default:
        return 'border-border';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-destructive animate-pulse-subtle" />;
      case 'soon':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'ok':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      default:
        return <Calendar className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'overdue':
        return 'Revisão Atrasada!';
      case 'soon':
        return 'Revisão Próxima';
      case 'ok':
        return 'Em Dia';
      default:
        return 'Sem Dados';
    }
  };

  if (!lastRevision) {
    return (
      <ModernCard variant="glass" className="animate-fade-in">
        <ModernCardHeader className="pb-3">
          <ModernCardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Próximas Revisões
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma revisão registrada ainda. Adicione uma revisão no histórico de manutenções para calcular a próxima.
          </p>
        </ModernCardContent>
      </ModernCard>
    );
  }

  if (!nextRevision) return null;

  const daysUntilRevision = differenceInDays(nextRevision.byDate, new Date());
  const kmUntilRevision = nextRevision.byOdometer - currentOdometer;

  return (
    <ModernCard 
      variant="gradient" 
      className={cn("animate-scale-in", getStatusColor())}
    >
      <ModernCardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <ModernCardTitle className="text-sm font-medium flex items-center gap-2">
            {getStatusIcon()}
            Próximas Revisões
          </ModernCardTitle>
          <Badge 
            variant={status === 'overdue' ? 'destructive' : status === 'soon' ? 'default' : 'secondary'}
            className="badge-modern"
          >
            {getStatusText()}
          </Badge>
        </div>
        <ModernCardDescription className="text-xs">
          Baseado na última revisão em {format(new Date(lastRevision.date), 'dd/MM/yyyy', { locale: ptBR })}
        </ModernCardDescription>
      </ModernCardHeader>
      <ModernCardContent className="space-y-3">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 transition-all hover:bg-muted">
            <div className="p-2 rounded-lg bg-background">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Por Data (12 meses)</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(nextRevision.byDate, 'dd/MM/yyyy', { locale: ptBR })}
              </p>
              <p className={cn(
                "text-xs font-medium mt-2 px-2 py-1 rounded-md inline-block",
                daysUntilRevision < 0 ? 'status-error' : daysUntilRevision <= 30 ? 'status-warning' : 'status-success'
              )}>
                {daysUntilRevision < 0 
                  ? `⚠️ Atrasado há ${Math.abs(daysUntilRevision)} dias` 
                  : `✓ Faltam ${daysUntilRevision} dias`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 transition-all hover:bg-muted">
            <div className="p-2 rounded-lg bg-background">
              <Gauge className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Por Quilometragem (10.000 km)</p>
              <p className="text-xs text-muted-foreground mt-1">
                {nextRevision.byOdometer.toLocaleString('pt-BR')} km
              </p>
              <p className={cn(
                "text-xs font-medium mt-2 px-2 py-1 rounded-md inline-block",
                kmUntilRevision < 0 ? 'status-error' : kmUntilRevision <= 1000 ? 'status-warning' : 'status-success'
              )}>
                {kmUntilRevision < 0 
                  ? `⚠️ Atrasado há ${Math.abs(kmUntilRevision).toLocaleString('pt-BR')} km` 
                  : `✓ Faltam ${kmUntilRevision.toLocaleString('pt-BR')} km`}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-subtle"></div>
            <span className="font-medium">Odômetro atual:</span>
            <span className="text-muted-foreground">{currentOdometer.toLocaleString('pt-BR')} km</span>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
}
