"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useForecasts } from '@/hooks/useForecasts';
import { useTransactions } from '@/hooks/useTransactions';
import { Calendar, CreditCard as CreditCardIcon, Clock, AlertCircle } from 'lucide-react';
import { BankLogo } from '@/components/layout/BankLogo';
import { format, startOfMonth, addMonths, parseISO, isWithinInterval, endOfMonth, setDate, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CreditCard } from '@/lib/types';

interface UpcomingCreditCardBillsProps {
  currentMonth?: Date;
}

interface BillData {
  card: CreditCard;
  month: Date;
  dueDate: Date;
  currentAmount: number;
  forecastedAmount: number;
  totalAmount: number;
  status: 'current' | 'upcoming' | 'overdue';
  daysUntilDue: number;
}

export function UpcomingCreditCardBills({ currentMonth = new Date() }: UpcomingCreditCardBillsProps) {
  const { creditCards } = useCreditCards();
  const { forecastItems } = useForecasts();
  const { transactions } = useTransactions();

  const billsData = React.useMemo(() => {
    const today = new Date();
    const bills: BillData[] = [];

    // Generate bills for current month and next 2 months
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const targetMonth = addMonths(startOfMonth(currentMonth), monthOffset);
      const monthStart = startOfMonth(targetMonth);
      const monthEnd = endOfMonth(targetMonth);
      const monthKey = monthStart.toISOString();

      creditCards.forEach(card => {
        // Calculate due date for this month
        const dueDate = setDate(targetMonth, card.dueDateDay);
        
        // Adjust if due date is invalid (e.g., Feb 31 -> Feb 28/29)
        if (dueDate.getDate() !== card.dueDateDay) {
          dueDate.setDate(0); // Set to last day of previous month, then add 1
          dueDate.setDate(dueDate.getDate() + 1);
        }

        // Current actual expenses for this card and month (only pending transactions)
        const currentAmount = transactions
          .filter(transaction => {
            if (transaction.creditCardId !== card.id || transaction.type !== 'expense') {
              return false;
            }
            // Only include pending transactions in the bill calculation
            if (transaction.status === 'paid') {
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

        // Forecasted expenses for this card and month
        const forecastedAmount = forecastItems
          .filter(item => 
            item.creditCardId === card.id && 
            item.type === 'expense' &&
            item.date === monthKey
          )
          .reduce((sum, item) => sum + Math.abs(item.amount), 0);

        const totalAmount = currentAmount + forecastedAmount;

        // Only include bills with some pending amount
        if (totalAmount > 0) {
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let status: 'current' | 'upcoming' | 'overdue' = 'upcoming';
          
          // If there's no pending amount, consider the bill as paid (don't show as overdue)
          if (totalAmount === 0) {
            status = 'upcoming'; // Don't show paid bills as overdue
          } else if (isBefore(dueDate, today)) {
            status = 'overdue';
          } else if (daysUntilDue <= 7) {
            status = 'current';
          }

          bills.push({
            card,
            month: targetMonth,
            dueDate,
            currentAmount,
            forecastedAmount,
            totalAmount,
            status,
            daysUntilDue,
          });
        }
      });
    }

    return bills.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [creditCards, transactions, forecastItems, currentMonth]);

  const summary = React.useMemo(() => {
    const totalUpcoming = billsData.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const overdueBills = billsData.filter(bill => bill.status === 'overdue').length;
    const currentBills = billsData.filter(bill => bill.status === 'current').length;
    const nextBillDate = billsData.length > 0 ? billsData[0].dueDate : null;

    return {
      totalUpcoming,
      overdueBills,
      currentBills,
      nextBillDate,
    };
  }, [billsData]);

  if (billsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Faturas de Cartão
          </CardTitle>
          <CardDescription>
            Acompanhe as próximas faturas dos seus cartões de crédito.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-32">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
            Nenhuma fatura prevista encontrada.<br />
            <span className="text-sm">Adicione previsões ou transações com cartões para visualizar as próximas faturas.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string, daysUntilDue: number) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">Vencida</Badge>;
      case 'current':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {daysUntilDue === 0 ? 'Vence hoje' : `${daysUntilDue} dias`}
        </Badge>;
      default:
        return <Badge variant="outline">{daysUntilDue} dias</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'current':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          Próximas Faturas
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2 text-base text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-orange-600 dark:text-orange-400">R$ {summary.totalUpcoming.toFixed(2)} total</span>
          {summary.overdueBills > 0 && (
            <Badge variant="destructive" className="text-xs">
              {summary.overdueBills} vencida{summary.overdueBills > 1 ? 's' : ''}
            </Badge>
          )}
          {summary.currentBills > 0 && (
            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              {summary.currentBills} próxima{summary.currentBills > 1 ? 's' : ''}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {billsData.map((bill) => (
          <div 
            key={`${bill.card.id}-${bill.month.toISOString()}`} 
            className={`border rounded-lg p-4 ${
              bill.status === 'overdue' ? 'border-destructive bg-destructive/5' :
              bill.status === 'current' ? 'border-yellow-300 bg-yellow-50' :
              'border-border'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <BankLogo 
                  logoKey={bill.card.logoKey} 
                  photoUrl={bill.card.photoUrl} 
                  className="h-6 w-6"
                />
                <div>
                  <div className="font-medium">
                    {bill.card.bankName} ({bill.card.cardFlag})
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    {getStatusIcon(bill.status)}
                    Vencimento: {format(bill.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  R$ {bill.totalAmount.toFixed(2)}
                </div>
                {getStatusBadge(bill.status, bill.daysUntilDue)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/30 rounded p-2">
                <div className="text-muted-foreground">Gastos Atuais</div>
                <div className="font-medium">R$ {bill.currentAmount.toFixed(2)}</div>
              </div>
              <div className="bg-muted/30 rounded p-2">
                <div className="text-muted-foreground">Previsão Restante</div>
                <div className="font-medium">R$ {bill.forecastedAmount.toFixed(2)}</div>
              </div>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Referente a {format(bill.month, 'MMMM yyyy', { locale: ptBR })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}