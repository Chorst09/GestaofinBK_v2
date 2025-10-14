
"use client";

import * as React from 'react';
import { SpendingVisualization } from '@/components/dashboard/spending-visualization';
import { AiTips } from '@/components/dashboard/ai-tips';
import { useTransactions } from '@/hooks/useTransactions';
import { useForecasts } from '@/hooks/useForecasts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useVehicleExpenses } from '@/hooks/useVehicleExpenses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, DollarSign, Scale, CreditCard, Landmark, Filter, ChevronLeft, ChevronRight, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, addMonths, isWithinInterval, getDaysInMonth, setDate, formatISO, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useAllCategories } from '@/hooks/useAllCategories';
import { CurrentBalanceChart } from '@/components/dashboard/current-balance-chart';
import { BankLogo } from '@/components/layout/BankLogo';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { VehicleExpenseChart } from '@/components/vehicles/vehicle-expense-chart';
import { VehicleMaintenanceChart } from '@/components/vehicles/vehicle-maintenance-chart';
import { CreditCardForecastChart } from '@/components/dashboard/credit-card-forecast-chart';
import { CreditCardSpendingComparison } from '@/components/dashboard/credit-card-spending-comparison';
import { CreditCardLimitsOverview } from '@/components/dashboard/credit-card-limits-overview';
import { UpcomingCreditCardBills } from '@/components/dashboard/upcoming-credit-card-bills';
import { ErrorBoundary } from '@/components/ui/error-boundary';


export default function DashboardPage() {
  const { transactions } = useTransactions();
  const { getForecastTotalsForMonth } = useForecasts();
  const { getCreditCardById } = useCreditCards();
  const { getBankAccountById } = useBankAccounts();
  const { vehicleExpenses } = useVehicleExpenses();
  const { allCategories, getCategoryIcon } = useAllCategories();
  
  const [currentMonth, setCurrentMonth] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setCurrentMonth(startOfMonth(new Date()));
  }, []);
  const [selectedCategories, setSelectedCategories] = React.useState<Set<string>>(new Set());

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev || new Date(), 1) : addMonths(prev || new Date(), 1));
  };

  const hasActiveFilters = React.useMemo(() => {
    const isNotCurrentMonth = currentMonth ? startOfMonth(currentMonth).getTime() !== startOfMonth(new Date()).getTime() : false;
    return isNotCurrentMonth || selectedCategories.size > 0;
  }, [currentMonth, selectedCategories]);


  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(category);
      } else {
        newSet.delete(category);
      }
      return newSet;
    });
  };
  
  const period = React.useMemo(() => ({
    start: startOfMonth(currentMonth || new Date()),
    end: endOfMonth(currentMonth || new Date()),
  }), [currentMonth]);


  const filteredTransactions = React.useMemo(() => {
     let filtered = transactions.filter(t => {
        try {
            return isWithinInterval(parseISO(t.date), period);
        } catch {
            return false;
        }
    });

    if (selectedCategories.size > 0) {
      filtered = filtered.filter(t => selectedCategories.has(t.category));
    }

    return filtered;
  }, [transactions, period, selectedCategories]);

  const {
    finalAccumulatedBalance,
    monthlyBalance,
    totalIncomeFromTransactions,
    totalExpensesFromTransactions,
    balanceHistory,
  } = React.useMemo(() => {
    // Balanço do mês selecionado
    const incomeThisMonth = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expensesThisMonth = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netFlowThisMonth = incomeThisMonth - expensesThisMonth;

    // Balanço de todos os meses anteriores
    const transactionsBeforePeriod = transactions.filter(t => {
        try { return isBefore(parseISO(t.date), period.start); } catch { return false; }
    });
    const balanceFromPreviousMonths = transactionsBeforePeriod.reduce((sum, t) => sum + t.amount, 0);

    // Saldo Final Acumulado
    const calculatedFinalBalanceForPeriod = balanceFromPreviousMonths + netFlowThisMonth;

    // Histórico para o gráfico
    const history: { date: string, balance: number }[] = [];
    const dailyNetChanges = new Map<string, number>();
    
    filteredTransactions.forEach(t => {
        const day = t.date.substring(0, 10); // YYYY-MM-DD
        dailyNetChanges.set(day, (dailyNetChanges.get(day) || 0) + t.amount);
    });

    let runningBalance = balanceFromPreviousMonths;
    const daysInMonth = getDaysInMonth(period.start);
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = setDate(period.start, i);
        const currentDateStr = formatISO(currentDate, { representation: 'date' });
        runningBalance += dailyNetChanges.get(currentDateStr) || 0;
        history.push({ date: currentDateStr, balance: runningBalance });
    }
    
    return {
      finalAccumulatedBalance: calculatedFinalBalanceForPeriod,
      monthlyBalance: netFlowThisMonth,
      totalIncomeFromTransactions: incomeThisMonth,
      totalExpensesFromTransactions: expensesThisMonth,
      balanceHistory: history,
    };
  }, [filteredTransactions, transactions, period]);


  const filteredVehicleExpenses = React.useMemo(() => {
    return vehicleExpenses.filter(e => {
        try {
            return isWithinInterval(parseISO(e.date), period);
        } catch {
            return false;
        }
    });
  }, [vehicleExpenses, period]);



  const accountTypeLabels: Record<string, string> = {
    checking: 'CC',
    savings: 'Poupança',
    investment: 'Invest.',
    other: 'Outra',
  };

  const summaryPeriodText = `Total em ${format(currentMonth || new Date(), 'MMMM', { locale: ptBR })}${selectedCategories.size > 0 ? ' (com filtros)' : ''}`;

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-2">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Visão geral das suas finanças
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/transactions" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200">
                  <PlusCircle className="mr-2 h-4 w-4" /> 
                  Adicionar Transação
                </Button>
            </Link>
        </div>
      </div>
      
      {/* Filter Section */}
      <Card className="border-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
        <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => changeMonth('prev')}
                  className="border-slate-300 hover:bg-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center w-48 capitalize">
                    {currentMonth ? format(currentMonth, 'MMMM yyyy', { locale: ptBR }) : ''}
                  </h2>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => changeMonth('next')}
                  className="border-slate-300 hover:bg-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
             
            <div className="flex items-center gap-3 flex-wrap">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline"
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Categorias
                            {selectedCategories.size > 0 && (
                              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {selectedCategories.size}
                              </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>Filtrar por Categoria</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allCategories.filter(c => c.type !== 'general').map(category => (
                             <DropdownMenuCheckboxItem
                                key={category.name}
                                checked={selectedCategories.has(category.name)}
                                onCheckedChange={(checked) => handleCategoryChange(category.name, !!checked)}
                            >
                                {category.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      onClick={() => { if(currentMonth) { setCurrentMonth(startOfMonth(new Date())); setSelectedCategories(new Set()); } }}
                      className="text-slate-600 hover:text-slate-800 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Limpar Filtros
                    </Button>
                )}
            </div>
        </CardContent>
      </Card>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              Receita do Mês
            </CardTitle>
            <div className="p-2 bg-emerald-500/20 rounded-full">
              <Landmark className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold font-headline text-emerald-800 dark:text-emerald-200 mb-2">
              R$ {totalIncomeFromTransactions.toFixed(2)}
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{summaryPeriodText}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
              Despesa do Mês
            </CardTitle>
            <div className="p-2 bg-red-500/20 rounded-full">
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold font-headline text-red-800 dark:text-red-200 mb-2">
              R$ {totalExpensesFromTransactions.toFixed(2)}
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{summaryPeriodText}</p>
          </CardContent>
        </Card>

        <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
          monthlyBalance >= 0 
            ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900' 
            : 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900'
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${
            monthlyBalance >= 0 ? 'from-blue-500/10' : 'from-orange-500/10'
          } to-transparent`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className={`text-sm font-semibold uppercase tracking-wide ${
              monthlyBalance >= 0 
                ? 'text-blue-700 dark:text-blue-300' 
                : 'text-orange-700 dark:text-orange-300'
            }`}>
              Balanço do Mês
            </CardTitle>
            <div className={`p-2 rounded-full ${
              monthlyBalance >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'
            }`}>
              <Scale className={`h-5 w-5 ${
                monthlyBalance >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-3xl font-bold font-headline mb-2 ${
              monthlyBalance >= 0 
                ? 'text-blue-800 dark:text-blue-200' 
                : 'text-orange-800 dark:text-orange-200'
            }`}>
              R$ {monthlyBalance.toFixed(2)}
            </div>
            <p className={`text-sm font-medium ${
              monthlyBalance >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              Receitas - Despesas no período
            </p>
          </CardContent>
        </Card>

        <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
          finalAccumulatedBalance >= 0 
            ? 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900' 
            : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900'
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${
            finalAccumulatedBalance >= 0 ? 'from-purple-500/10' : 'from-gray-500/10'
          } to-transparent`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className={`text-sm font-semibold uppercase tracking-wide ${
              finalAccumulatedBalance >= 0 
                ? 'text-purple-700 dark:text-purple-300' 
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              Saldo Acumulado
            </CardTitle>
            <div className={`p-2 rounded-full ${
              finalAccumulatedBalance >= 0 ? 'bg-purple-500/20' : 'bg-gray-500/20'
            }`}>
              <WalletCards className={`h-5 w-5 ${
                finalAccumulatedBalance >= 0 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-3xl font-bold font-headline mb-2 ${
              finalAccumulatedBalance >= 0 
                ? 'text-purple-800 dark:text-purple-200' 
                : 'text-gray-800 dark:text-gray-200'
            }`}>
              R$ {finalAccumulatedBalance.toFixed(2)}
            </div>
            <p className={`text-sm font-medium ${
              finalAccumulatedBalance >= 0 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              Saldo anterior + balanço atual
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <ErrorBoundary>
          <React.Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
            <SpendingVisualization transactions={filteredTransactions} />
          </React.Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <React.Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
            <CurrentBalanceChart data={balanceHistory} />
          </React.Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <React.Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
            <CreditCardForecastChart currentMonth={currentMonth || new Date()} />
          </React.Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <React.Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
            <CreditCardSpendingComparison currentMonth={currentMonth || new Date()} />
          </React.Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <React.Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
            <VehicleExpenseChart expenses={filteredVehicleExpenses} />
          </React.Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <React.Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
            <VehicleMaintenanceChart expenses={filteredVehicleExpenses} />
          </React.Suspense>
        </ErrorBoundary>
      </div>

      {/* Credit Card Components - Full Width */}
      <div className="grid gap-8 md:grid-cols-2">
        <ErrorBoundary>
          <React.Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
            <CreditCardLimitsOverview currentMonth={currentMonth || new Date()} />
          </React.Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <React.Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
            <UpcomingCreditCardBills currentMonth={currentMonth || new Date()} />
          </React.Suspense>
        </ErrorBoundary>
      </div>

      <div className="grid gap-8">
        <ErrorBoundary>
          <React.Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
            <AiTips />
          </React.Suspense>
        </ErrorBoundary>
      </div>

      <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="font-headline text-xl text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            Transações Recentes
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Suas últimas 5 movimentações no mês selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Nenhuma transação encontrada para o mês selecionado
                {selectedCategories.size > 0 ? ' com os filtros aplicados' : ''}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.slice(0, 5).map((transaction, index) => {
                if (!transaction || !transaction.id) return null;
                const Icon = getCategoryIcon(transaction.category);
                let accountOrCardElement: React.ReactNode = null;
                let logoKeyForLogo: string | undefined = undefined;
                let photoUrlForLogo: string | undefined = undefined;

                if (transaction.creditCardId) {
                  const card = getCreditCardById(transaction.creditCardId);
                  if (card) {
                    logoKeyForLogo = card.logoKey;
                    photoUrlForLogo = card.photoUrl;
                    accountOrCardElement = (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <CreditCard className="h-3 w-3" />
                        {card.bankName} ({card.cardFlag})
                      </Badge>
                    );
                  } else if (transaction.cardBrand) { 
                     accountOrCardElement = (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <CreditCard className="h-3 w-3" />
                        {transaction.cardBrand} (Manual)
                      </Badge>
                    );
                  } else {
                     accountOrCardElement = (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <CreditCard className="h-3 w-3" />
                        <span>Cartão desc.</span>
                      </Badge>
                    );
                  }
                } else if (transaction.cardBrand) { 
                  accountOrCardElement = (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <CreditCard className="h-3 w-3" />
                      {transaction.cardBrand}
                    </Badge>
                  );
                } else if (transaction.bankAccountId) {
                  const bankAccount = getBankAccountById(transaction.bankAccountId);
                  if (bankAccount) {
                    logoKeyForLogo = bankAccount.logoKey;
                    photoUrlForLogo = bankAccount.photoUrl;
                    accountOrCardElement = (
                       <Badge variant="outline" className="text-xs flex items-center gap-1 border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300">
                        <BankLogo logoKey={bankAccount.logoKey} photoUrl={bankAccount.photoUrl} className="h-3 w-3" />
                        {bankAccount.bankName} ({accountTypeLabels[bankAccount.accountType] || bankAccount.accountType})
                      </Badge>
                    );
                  } else {
                    accountOrCardElement = (
                      <Badge variant="outline" className="text-xs flex items-center gap-1 border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300">
                        <Landmark className="h-3 w-3" />
                        <span>Conta desc.</span>
                      </Badge>
                    );
                  }
                }

                return (
                  <div key={`transaction-${transaction.id}-${index}`} className="group flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        transaction.amount < 0 
                          ? 'bg-red-100 dark:bg-red-900/30' 
                          : 'bg-emerald-100 dark:bg-emerald-900/30'
                      }`}>
                        {logoKeyForLogo || photoUrlForLogo ? (
                          <BankLogo 
                            logoKey={logoKeyForLogo} 
                            photoUrl={photoUrlForLogo} 
                            className={`h-6 w-6 ${
                              transaction.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`} 
                          />
                        ) : (
                          <Icon className={`h-6 w-6 ${
                            transaction.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {transaction.date ? format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR }) : ''}
                          </span>
                          <Badge variant="outline" className="text-xs border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400">
                            {transaction.category}
                          </Badge>
                          {accountOrCardElement}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.amount < 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        R$ {transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
           {filteredTransactions.length > 5 && (
            <div className="mt-6 text-center">
              <Link href="/transactions">
                <Button 
                  variant="outline" 
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                >
                  Ver todas as transações
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
