
"use client";

import * as React from 'react';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  format,
  parseISO,
  isWithinInterval,
  isAfter
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank, LineChart, Scale } from 'lucide-react';

import { useTransactions } from '@/hooks/useTransactions';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useForecasts } from '@/hooks/useForecasts';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { BankLogo } from '@/components/layout/BankLogo';
import { Separator } from '@/components/ui/separator';

interface AccountBalance {
  accountId: string;
  bankName: string;
  initialBalance: number;
  finalBalance: number;
  difference: number;
}

export default function MonthlyAnalysisPage() {
  const [currentMonth, setCurrentMonth] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setCurrentMonth(startOfMonth(new Date()));
  }, []);

  const { transactions } = useTransactions();
  const { bankAccounts } = useBankAccounts();
  const { forecastItems } = useForecasts();
  const { goalContributions } = useFinancialGoals();

  const period = React.useMemo(() => ({
    start: startOfMonth(currentMonth!),
    end: endOfMonth(currentMonth!),
  }), [currentMonth]);

  const analysisData = React.useMemo(() => {
    // Realized
    const periodTransactions = transactions.filter(t => isWithinInterval(parseISO(t.date), period));
    const realizedIncome = periodTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const investmentExpenses = periodTransactions.filter(t => t.category === 'Investimentos (saída)').reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const realizedExpenses = periodTransactions.filter(t => t.type === 'expense' && t.category !== 'Investimentos (saída)').reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const goalContributionsInPeriod = goalContributions.filter(c => c.amount > 0 && isWithinInterval(parseISO(c.date), period)).reduce((acc, c) => acc + c.amount, 0);
    const periodBalance = realizedIncome - (realizedExpenses + investmentExpenses + goalContributionsInPeriod);

    // Pending
    const periodForecasts = forecastItems.filter(f => startOfMonth(parseISO(f.date)).getTime() === period.start.getTime());
    const pendingIncome = periodForecasts.filter(f => f.type === 'income').reduce((acc, f) => acc + f.amount, 0);
    const pendingExpenses = periodForecasts.filter(f => f.type === 'expense').reduce((acc, f) => acc + Math.abs(f.amount), 0);

    // Bank Balances
    const accountBalances: AccountBalance[] = bankAccounts.map(account => {
      const accountTransactions = transactions.filter(t => t.bankAccountId === account.id);
      
      const netChangeSincePeriodEnd = accountTransactions
        .filter(t => isAfter(parseISO(t.date), period.end))
        .reduce((acc, t) => acc + t.amount, 0);
        
      const finalBalance = account.balance - netChangeSincePeriodEnd;
      
      const netChangeDuringPeriod = periodTransactions
        .filter(t => t.bankAccountId === account.id)
        .reduce((acc, t) => acc + t.amount, 0);
        
      const initialBalance = finalBalance - netChangeDuringPeriod;
      
      return {
        accountId: account.id,
        bankName: account.bankName,
        initialBalance,
        finalBalance,
        difference: finalBalance - initialBalance,
      };
    });

    const totalInitialBalance = accountBalances.reduce((acc, ab) => acc + ab.initialBalance, 0);
    const totalFinalBalance = accountBalances.reduce((acc, ab) => acc + ab.finalBalance, 0);
    const totalDifference = totalFinalBalance - totalInitialBalance;

    return {
      realizedIncome,
      realizedExpenses,
      investmentExpenses,
      goalContributionsInPeriod,
      periodBalance,
      pendingIncome,
      pendingExpenses,
      accountBalances,
      totalInitialBalance,
      totalFinalBalance,
      totalDifference
    };

  }, [transactions, bankAccounts, forecastItems, goalContributions, period]);

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev!, 1) : addMonths(prev!, 1));
  };
  
  const formatCurrency = (value: number) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return isNegative ? `- ${absValue}` : absValue;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-headline font-semibold">Análise Mensal</h1>
        <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted">
          <Button variant="ghost" size="icon" onClick={() => changeMonth('prev')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="w-40 text-center font-semibold capitalize">
            {currentMonth ? format(currentMonth, 'MMMM yyyy', { locale: ptBR }) : ''}
          </span>
          <Button variant="ghost" size="icon" onClick={() => changeMonth('next')}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Resumo Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Resumo do Mês</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-base mb-2">Realizado</h3>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-muted-foreground"><TrendingUp size={16} /> Ganhos</span>
                    <span className="font-medium text-green-600">{formatCurrency(analysisData.realizedIncome)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-muted-foreground"><TrendingDown size={16} /> Gastos</span>
                    <span className="font-medium text-destructive">{formatCurrency(analysisData.realizedExpenses)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-muted-foreground"><LineChart size={16} /> Investimentos</span>
                    <span className="font-medium text-destructive">{formatCurrency(analysisData.investmentExpenses)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-muted-foreground"><PiggyBank size={16} /> Guardado (Metas)</span>
                    <span className="font-medium text-destructive">{formatCurrency(analysisData.goalContributionsInPeriod)}</span>
                </div>
                <Separator className="my-2" />
                 <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-muted-foreground"><Scale size={16} /> Balanço do Período</span>
                    <span className={cn("font-medium", analysisData.periodBalance >= 0 ? 'text-green-600' : 'text-destructive')}>
                        {formatCurrency(analysisData.periodBalance)}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-muted-foreground"><PiggyBank size={16} /> Saldo Mês Anterior</span>
                    <span className={cn("font-medium", analysisData.totalInitialBalance >= 0 ? 'text-foreground' : 'text-destructive')}>
                        {formatCurrency(analysisData.totalInitialBalance)}
                    </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center font-bold text-base">
                    <span>Saldo Final do Mês</span>
                    <span className={cn((analysisData.totalInitialBalance + analysisData.periodBalance) >= 0 ? 'text-green-600' : 'text-destructive')}>
                        {formatCurrency(analysisData.totalInitialBalance + analysisData.periodBalance)}
                    </span>
                </div>
            </div>
            
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                 <h3 className="font-semibold text-base mb-2">Pendente</h3>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">A Receber</span>
                    <span className="font-medium text-green-600">{formatCurrency(analysisData.pendingIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">A Pagar</span>
                    <span className="font-medium text-destructive">{formatCurrency(analysisData.pendingExpenses)}</span>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Saldo Card */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline">Evolução de Saldo em Contas</CardTitle>
                <CardDescription>
                    Saldo inicial vs. final de {currentMonth && period.start && period.end ? `${format(period.start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(period.end, 'dd/MM/yyyy', { locale: ptBR })}` : ''}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Conta Bancária</TableHead>
                            <TableHead className="text-right">Saldo Inicial</TableHead>
                            <TableHead className="text-right">Saldo Final</TableHead>
                            <TableHead className="text-right">Diferença (+/-)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {analysisData.accountBalances.map(acc => {
                            const bankAccount = bankAccounts.find(ba => ba.id === acc.accountId);
                            return (
                                <TableRow key={acc.accountId}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <BankLogo logoKey={bankAccount?.logoKey} />
                                        {acc.bankName}
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(acc.initialBalance)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(acc.finalBalance)}</TableCell>
                                    <TableCell className={cn("text-right font-semibold", acc.difference > 0 ? 'text-green-600' : acc.difference < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                                        {formatCurrency(acc.difference)}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                         <TableRow className="bg-muted/50 font-bold">
                            <TableCell>Total</TableCell>
                            <TableCell className="text-right">{formatCurrency(analysisData.totalInitialBalance)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(analysisData.totalFinalBalance)}</TableCell>
                            <TableCell className={cn("text-right", analysisData.totalDifference > 0 ? 'text-green-600' : analysisData.totalDifference < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                                {formatCurrency(analysisData.totalDifference)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
