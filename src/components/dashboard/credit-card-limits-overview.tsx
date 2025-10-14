"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useForecasts } from '@/hooks/useForecasts';
import { useTransactions } from '@/hooks/useTransactions';
import { CreditCard as CreditCardIcon, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { BankLogo } from '@/components/layout/BankLogo';
import { format, startOfMonth, parseISO, isWithinInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CreditCard } from '@/lib/types';

interface CreditCardLimitsOverviewProps {
  currentMonth?: Date;
}

interface CardUsageData {
  card: CreditCard;
  currentUsage: number;
  forecastedUsage: number;
  totalProjectedUsage: number;
  usagePercentage: number;
  status: 'safe' | 'warning' | 'danger';
}

export function CreditCardLimitsOverview({ currentMonth = new Date() }: CreditCardLimitsOverviewProps) {
  const { creditCards } = useCreditCards();
  const { forecastItems } = useForecasts();
  const { transactions } = useTransactions();

  const cardUsageData = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthKey = monthStart.toISOString();

    return creditCards
      .filter(card => card.creditLimit && card.creditLimit > 0)
      .map(card => {
        // Current month actual usage
        const currentUsage = transactions
          .filter(transaction => {
            if (transaction.creditCardId !== card.id || transaction.type !== 'expense') {
              return false;
            }
            try {
              const transactionDate = parseISO(transaction.date);
              return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
            } catch {
              return false;
            }
          })
          .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

        // Forecasted usage for current month
        const forecastedUsage = forecastItems
          .filter(item => 
            item.creditCardId === card.id && 
            item.type === 'expense' &&
            item.date === monthKey
          )
          .reduce((sum, item) => sum + Math.abs(item.amount), 0);

        // Total projected usage (current + remaining forecasted)
        const totalProjectedUsage = currentUsage + forecastedUsage;
        
        // Usage percentage
        const usagePercentage = card.creditLimit ? (totalProjectedUsage / card.creditLimit) * 100 : 0;

        // Status based on usage percentage
        let status: 'safe' | 'warning' | 'danger' = 'safe';
        if (usagePercentage >= 90) {
          status = 'danger';
        } else if (usagePercentage >= 70) {
          status = 'warning';
        }

        return {
          card,
          currentUsage,
          forecastedUsage,
          totalProjectedUsage,
          usagePercentage: Math.min(100, usagePercentage),
          status,
        };
      })
      .sort((a, b) => b.usagePercentage - a.usagePercentage);
  }, [creditCards, transactions, forecastItems, currentMonth]);

  const summary = React.useMemo(() => {
    const totalLimit = cardUsageData.reduce((sum, data) => sum + (data.card.creditLimit || 0), 0);
    const totalUsed = cardUsageData.reduce((sum, data) => sum + data.totalProjectedUsage, 0);
    const averageUsage = cardUsageData.length > 0 
      ? cardUsageData.reduce((sum, data) => sum + data.usagePercentage, 0) / cardUsageData.length 
      : 0;

    const cardsAtRisk = cardUsageData.filter(data => data.status === 'danger').length;
    const cardsWithWarning = cardUsageData.filter(data => data.status === 'warning').length;

    return {
      totalLimit,
      totalUsed,
      averageUsage,
      cardsAtRisk,
      cardsWithWarning,
    };
  }, [cardUsageData]);

  if (cardUsageData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Limites dos Cartões de Crédito
          </CardTitle>
          <CardDescription>
            Acompanhe a utilização dos limites dos seus cartões de crédito.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-32">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <CreditCardIcon className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
            Nenhum cartão com limite definido encontrado.<br />
            <span className="text-sm">Configure os limites dos seus cartões para visualizar este resumo.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'danger':
        return <Badge variant="destructive">Alto Risco</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      default:
        return <Badge variant="default" className="bg-green-100 text-green-800">Seguro</Badge>;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'danger':
        return 'bg-destructive';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm">
            <CreditCardIcon className="h-5 w-5 text-white" />
          </div>
          Limites dos Cartões
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })} • 
          <span className="font-semibold text-emerald-600 dark:text-emerald-400"> Média: {summary.averageUsage.toFixed(1)}%</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Limite Total</div>
            <div className="text-lg font-semibold">
              R$ {summary.totalLimit.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Utilização Projetada</div>
            <div className="text-lg font-semibold">
              R$ {summary.totalUsed.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Cartões em Risco</div>
            <div className="text-lg font-semibold flex items-center gap-2">
              {summary.cardsAtRisk + summary.cardsWithWarning}
              {(summary.cardsAtRisk > 0 || summary.cardsWithWarning > 0) && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </div>
        </div>

        {/* Individual Cards */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Detalhes por Cartão</h4>
          {cardUsageData.map((data) => (
            <div key={data.card.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BankLogo 
                    logoKey={data.card.logoKey} 
                    photoUrl={data.card.photoUrl} 
                    className="h-6 w-6"
                  />
                  <div>
                    <div className="font-medium">
                      {data.card.bankName} ({data.card.cardFlag})
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Limite: R$ {data.card.creditLimit?.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(data.status)}
                  {getStatusBadge(data.status)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilização: {data.usagePercentage.toFixed(1)}%</span>
                  <span>R$ {data.totalProjectedUsage.toFixed(2)}</span>
                </div>
                <Progress 
                  value={data.usagePercentage} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Atual: R$ {data.currentUsage.toFixed(2)}</span>
                  <span>Previsto: R$ {data.forecastedUsage.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}