"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format, parseISO, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CashFlowEntry {
  date: string;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  cumulativePlanned: number;
  cumulativeActual: number;
  status: 'paid' | 'pending' | 'overdue';
}

interface CashFlowTimelineProps {
  entries: CashFlowEntry[];
  currentBalance?: number;
  className?: string;
}

export function CashFlowTimeline({
  entries,
  currentBalance,
  className,
}: CashFlowTimelineProps) {
  const totalPlanned = entries.reduce((sum, e) => sum + e.plannedAmount, 0);
  const totalPaid = entries.reduce((sum, e) => sum + e.actualAmount, 0);
  const totalPending = totalPlanned - totalPaid;

  const getStatusConfig = (status: CashFlowEntry['status']) => {
    switch (status) {
      case 'paid':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950',
          borderColor: 'border-green-200 dark:border-green-800',
          label: 'Pago',
          badgeVariant: 'default' as const,
        };
      case 'overdue':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950',
          borderColor: 'border-red-200 dark:border-red-800',
          label: 'Atrasado',
          badgeVariant: 'destructive' as const,
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950',
          borderColor: 'border-orange-200 dark:border-orange-800',
          label: 'Pendente',
          badgeVariant: 'secondary' as const,
        };
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Cronograma Financeiro
            </CardTitle>
            <CardDescription>Fluxo de caixa da reforma</CardDescription>
          </div>
          {currentBalance !== undefined && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Saldo Atual</div>
              <div className="text-lg font-bold text-green-600">
                R$ {currentBalance.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground">Total Planejado</div>
            <div className="text-lg font-semibold">R$ {totalPlanned.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Pago</div>
            <div className="text-lg font-semibold text-green-600">
              R$ {totalPaid.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Pendente</div>
            <div className="text-lg font-semibold text-orange-600">
              R$ {totalPending.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum pagamento registrado ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => {
              const statusConfig = getStatusConfig(entry.status);
              const StatusIcon = statusConfig.icon;
              const entryDate = parseISO(entry.date);
              const isPast = isBefore(entryDate, new Date()) && !isToday(entryDate);
              const isTodayEntry = isToday(entryDate);

              // Verificar se há saldo suficiente
              const projectedBalance = currentBalance !== undefined
                ? currentBalance - entry.cumulativePlanned
                : undefined;
              const hasInsufficientFunds = projectedBalance !== undefined && projectedBalance < 0;

              return (
                <div
                  key={index}
                  className={cn(
                    'relative pl-8 pb-4',
                    index !== entries.length - 1 && 'border-l-2 border-gray-200 dark:border-gray-700 ml-2'
                  )}
                >
                  {/* Ícone na timeline */}
                  <div
                    className={cn(
                      'absolute left-0 top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      statusConfig.borderColor,
                      statusConfig.bgColor
                    )}
                  >
                    <div className={cn('w-2 h-2 rounded-full', statusConfig.color.replace('text-', 'bg-'))} />
                  </div>

                  {/* Conteúdo */}
                  <div
                    className={cn(
                      'p-4 rounded-lg border-2',
                      isTodayEntry && 'ring-2 ring-blue-500 ring-offset-2',
                      statusConfig.borderColor,
                      statusConfig.bgColor
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
                        <span className="font-medium">
                          {format(entryDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                        {isTodayEntry && (
                          <Badge variant="default" className="text-xs">Hoje</Badge>
                        )}
                      </div>
                      <Badge variant={statusConfig.badgeVariant}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground mb-3">
                      {entry.description}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {entry.plannedAmount > 0 && (
                        <div>
                          <div className="text-xs text-muted-foreground">Valor Planejado</div>
                          <div className="font-semibold">
                            R$ {entry.plannedAmount.toFixed(2)}
                          </div>
                        </div>
                      )}
                      {entry.actualAmount > 0 && (
                        <div>
                          <div className="text-xs text-muted-foreground">Valor Pago</div>
                          <div className="font-semibold text-green-600">
                            R$ {entry.actualAmount.toFixed(2)}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-muted-foreground">Acumulado Planejado</div>
                        <div className="font-medium">
                          R$ {entry.cumulativePlanned.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Acumulado Pago</div>
                        <div className="font-medium text-green-600">
                          R$ {entry.cumulativeActual.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Alerta de saldo insuficiente */}
                    {hasInsufficientFunds && entry.status === 'pending' && (
                      <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 rounded border border-red-300 dark:border-red-700">
                        <div className="flex items-center gap-2 text-xs text-red-800 dark:text-red-200">
                          <AlertCircle className="h-3 w-3" />
                          <span className="font-medium">
                            Saldo insuficiente! Faltarão R$ {Math.abs(projectedBalance!).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Projeção de saldo */}
                    {projectedBalance !== undefined && entry.status === 'pending' && !hasInsufficientFunds && (
                      <div className="mt-3 text-xs text-muted-foreground">
                        Saldo projetado após pagamento: R$ {projectedBalance.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Alerta geral de fluxo de caixa */}
        {currentBalance !== undefined && totalPending > currentBalance && (
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border-2 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-900 dark:text-red-100">
                  Atenção: Saldo Insuficiente
                </div>
                <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Você tem R$ {totalPending.toFixed(2)} em pagamentos pendentes, mas seu saldo atual é de apenas R$ {currentBalance.toFixed(2)}.
                  Será necessário adicionar R$ {(totalPending - currentBalance).toFixed(2)} para cobrir todos os pagamentos.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
