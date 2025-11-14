"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Gauge, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, addMonths, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { VehicleExpense, Vehicle } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

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
        return 'text-red-600 bg-red-50 border-red-200';
      case 'soon':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'ok':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'soon':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'ok':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-600" />;
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
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Próximas Revisões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma revisão registrada ainda. Adicione uma revisão no histórico de manutenções para calcular a próxima.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!nextRevision) return null;

  const daysUntilRevision = differenceInDays(nextRevision.byDate, new Date());
  const kmUntilRevision = nextRevision.byOdometer - currentOdometer;

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getStatusIcon()}
            Próximas Revisões
          </CardTitle>
          <Badge variant={status === 'overdue' ? 'destructive' : status === 'soon' ? 'default' : 'secondary'}>
            {getStatusText()}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Baseado na última revisão em {format(new Date(lastRevision.date), 'dd/MM/yyyy', { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Por Data (12 meses)</p>
              <p className="text-xs text-muted-foreground">
                {format(nextRevision.byDate, 'dd/MM/yyyy', { locale: ptBR })}
              </p>
              <p className={`text-xs font-medium mt-1 ${daysUntilRevision < 0 ? 'text-red-600' : daysUntilRevision <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                {daysUntilRevision < 0 
                  ? `Atrasado há ${Math.abs(daysUntilRevision)} dias` 
                  : `Faltam ${daysUntilRevision} dias`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Gauge className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Por Quilometragem (10.000 km)</p>
              <p className="text-xs text-muted-foreground">
                {nextRevision.byOdometer.toLocaleString('pt-BR')} km
              </p>
              <p className={`text-xs font-medium mt-1 ${kmUntilRevision < 0 ? 'text-red-600' : kmUntilRevision <= 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
                {kmUntilRevision < 0 
                  ? `Atrasado há ${Math.abs(kmUntilRevision).toLocaleString('pt-BR')} km` 
                  : `Faltam ${kmUntilRevision.toLocaleString('pt-BR')} km`}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Odômetro atual:</span> {currentOdometer.toLocaleString('pt-BR')} km
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
