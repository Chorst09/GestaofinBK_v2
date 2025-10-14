
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
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank, LineChart, Scale, BarChart3 } from 'lucide-react';

import { useTransactions } from '@/hooks/useTransactions';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useForecasts } from '@/hooks/useForecasts';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { MonthlySpendingBreakdown } from '@/components/monthly-analysis/monthly-spending-breakdown';
import { MonthlyTrendsChart } from '@/components/monthly-analysis/monthly-trends-chart';
import { MonthlyInsights } from '@/components/monthly-analysis/monthly-insights';
import { MonthlyGoalsProgress } from '@/components/monthly-analysis/monthly-goals-progress';

interface AccountBalance {
  accountId: string;
  bankName: string;
  initialBalance: number;
  finalBalance: number;
  difference: number;
}

export default function MonthlyAnalysisPage() {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => startOfMonth(new Date()));

  const { transactions } = useTransactions();
  const { bankAccounts } = useBankAccounts();
  const { forecastItems } = useForecasts();
  const { goalContributions, goals: financialGoals } = useFinancialGoals();

  const period = React.useMemo(() => ({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
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
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };
  
  const formatCurrency = (value: number) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return isNegative ? `- ${absValue}` : absValue;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Análise Mensal
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão completa das suas finanças do mês
          </p>
        </div>
        <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted shadow-sm">
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Contas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resumo Card */}
            <Card className="lg:col-span-1 shadow-lg border bg-gradient-to-br from-slate-800 to-slate-900 text-white">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-white">
                  <Scale className="h-5 w-5 text-blue-400" />
                  Resumo do Mês
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2 p-4 bg-slate-700/90 backdrop-blur-sm rounded-lg border border-slate-600">
                    <h3 className="font-semibold text-base mb-3 text-white">Realizado</h3>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-slate-300"><TrendingUp size={16} /> Ganhos</span>
                        <span className="font-medium text-green-400">{formatCurrency(analysisData.realizedIncome)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-slate-300"><TrendingDown size={16} /> Gastos</span>
                        <span className="font-medium text-red-400">{formatCurrency(analysisData.realizedExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-slate-300"><LineChart size={16} /> Investimentos</span>
                        <span className="font-medium text-purple-400">{formatCurrency(analysisData.investmentExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-slate-300"><PiggyBank size={16} /> Guardado (Metas)</span>
                        <span className="font-medium text-blue-400">{formatCurrency(analysisData.goalContributionsInPeriod)}</span>
                    </div>
                    <Separator className="my-3" />
                     <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-slate-300"><Scale size={16} /> Balanço do Período</span>
                        <span className={cn("font-semibold", analysisData.periodBalance >= 0 ? 'text-green-400' : 'text-red-400')}>
                            {formatCurrency(analysisData.periodBalance)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-slate-300"><PiggyBank size={16} /> Saldo Mês Anterior</span>
                        <span className={cn("font-medium", analysisData.totalInitialBalance >= 0 ? 'text-white' : 'text-red-400')}>
                            {formatCurrency(analysisData.totalInitialBalance)}
                        </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between items-center font-bold text-base p-2 bg-gradient-to-r from-slate-600 to-slate-500 rounded-lg">
                        <span className="text-white">Saldo Final do Mês</span>
                        <span className={cn((analysisData.totalInitialBalance + analysisData.periodBalance) >= 0 ? 'text-green-300' : 'text-red-300')}>
                            {formatCurrency(analysisData.totalInitialBalance + analysisData.periodBalance)}
                        </span>
                    </div>
                </div>
                
                <div className="space-y-2 p-4 bg-slate-700/90 backdrop-blur-sm rounded-lg border border-slate-600">
                     <h3 className="font-semibold text-base mb-3 text-white">Pendente</h3>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-300">A Receber</span>
                        <span className="font-medium text-green-400">{formatCurrency(analysisData.pendingIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-300">A Pagar</span>
                        <span className="font-medium text-red-400">{formatCurrency(analysisData.pendingExpenses)}</span>
                    </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <div className="lg:col-span-2">
              <MonthlyInsights 
                transactions={transactions}
                currentMonth={currentMonth}
                totalBalance={analysisData.totalFinalBalance}
                periodBalance={analysisData.periodBalance}
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlySpendingBreakdown transactions={transactions.filter(t => isWithinInterval(parseISO(t.date), period))} />
            <MonthlyTrendsChart transactions={transactions} currentMonth={currentMonth} />
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <MonthlyTrendsChart transactions={transactions} currentMonth={currentMonth} />
          <MonthlySpendingBreakdown transactions={transactions.filter(t => isWithinInterval(parseISO(t.date), period))} />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <MonthlyGoalsProgress 
            goalContributions={goalContributions}
            financialGoals={financialGoals}
            period={period}
          />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card className="shadow-lg bg-slate-800 text-white border-slate-700">
              <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2 text-white">
                    <Scale className="h-5 w-5 text-blue-400" />
                    Evolução de Saldo em Contas
                  </CardTitle>
                  <CardDescription className="text-slate-300">
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
                                      <TableCell className={cn("text-right font-semibold", acc.difference > 0 ? 'text-green-600' : acc.difference < 0 ? 'text-red-600' : 'text-muted-foreground')}>
                                          {formatCurrency(acc.difference)}
                                      </TableCell>
                                  </TableRow>
                              )
                          })}
                           <TableRow className="bg-muted/50 font-bold">
                              <TableCell>Total</TableCell>
                              <TableCell className="text-right">{formatCurrency(analysisData.totalInitialBalance)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(analysisData.totalFinalBalance)}</TableCell>
                              <TableCell className={cn("text-right", analysisData.totalDifference > 0 ? 'text-green-600' : analysisData.totalDifference < 0 ? 'text-red-600' : 'text-muted-foreground')}>
                                  {formatCurrency(analysisData.totalDifference)}
                              </TableCell>
                          </TableRow>
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
