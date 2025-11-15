
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
import { ModernCard, ModernCardContent, ModernCardDescription, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, DollarSign, Scale, CreditCard, Landmark, Filter, ChevronLeft, ChevronRight, WalletCards, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-2 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline font-bold tracking-tight gradient-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Visão geral das suas finanças
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/transactions" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto button-modern">
                  <PlusCircle className="mr-2 h-4 w-4" /> 
                  Adicionar Transação
                </Button>
            </Link>
        </div>
      </div>
      
      {/* Filter Section */}
      <ModernCard variant="glass" className="animate-slide-in">
        <ModernCardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => changeMonth('prev')}
                  className="button-modern"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="bg-card px-4 py-2 rounded-lg shadow-sm border border-border">
                  <h2 className="text-xl font-bold text-foreground text-center w-48 capitalize">
                    {currentMonth ? format(currentMonth, 'MMMM yyyy', { locale: ptBR }) : ''}
                  </h2>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => changeMonth('next')}
                  className="button-modern"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
             
            <div className="flex items-center gap-3 flex-wrap">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline"
                          className="button-modern"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Categorias
                            {selectedCategories.size > 0 && (
                              <Badge variant="secondary" className="ml-2 badge-modern">
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
                      className="button-modern"
                    >
                      Limpar Filtros
                    </Button>
                )}
            </div>
        </ModernCardContent>
      </ModernCard>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita do Mês"
          value={`R$ ${totalIncomeFromTransactions.toFixed(2)}`}
          description={summaryPeriodText}
          icon={TrendingUp}
          variant="success"
          className="animate-scale-in"
          style={{ animationDelay: '0.1s' }}
        />

        <StatCard
          title="Despesa do Mês"
          value={`R$ ${totalExpensesFromTransactions.toFixed(2)}`}
          description={summaryPeriodText}
          icon={TrendingDown}
          variant="error"
          className="animate-scale-in"
          style={{ animationDelay: '0.2s' }}
        />

        <StatCard
          title="Balanço do Mês"
          value={`R$ ${monthlyBalance.toFixed(2)}`}
          description="Receitas - Despesas no período"
          icon={Scale}
          variant={monthlyBalance >= 0 ? "info" : "warning"}
          className="animate-scale-in"
          style={{ animationDelay: '0.3s' }}
        />

        <StatCard
          title="Saldo Acumulado"
          value={`R$ ${finalAccumulatedBalance.toFixed(2)}`}
          description="Saldo anterior + balanço atual"
          icon={WalletCards}
          variant={finalAccumulatedBalance >= 0 ? "success" : "error"}
          className="animate-scale-in"
          style={{ animationDelay: '0.4s' }}
        />
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

      <ModernCard variant="gradient" className="animate-fade-in">
        <ModernCardHeader className="pb-4">
          <ModernCardTitle className="font-headline text-xl flex items-center gap-2">
            <div className="p-2 bg-muted rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            Transações Recentes
          </ModernCardTitle>
          <ModernCardDescription>
            Suas últimas 5 movimentações no mês selecionado
          </ModernCardDescription>
        </ModernCardHeader>
        <ModernCardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
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
                  <div 
                    key={`transaction-${transaction.id}-${index}`} 
                    className="group flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-sm card-modern animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-full transition-transform group-hover:scale-110",
                        transaction.amount < 0 ? 'bg-destructive/10' : 'bg-success/10'
                      )}>
                        {logoKeyForLogo || photoUrlForLogo ? (
                          <BankLogo 
                            logoKey={logoKeyForLogo} 
                            photoUrl={photoUrlForLogo} 
                            className={cn(
                              "h-6 w-6",
                              transaction.amount < 0 ? 'text-destructive' : 'text-success'
                            )} 
                          />
                        ) : (
                          <Icon className={cn(
                            "h-6 w-6",
                            transaction.amount < 0 ? 'text-destructive' : 'text-success'
                          )} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            {transaction.date ? format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR }) : ''}
                          </span>
                          <Badge variant="outline" className="text-xs badge-modern">
                            {transaction.category}
                          </Badge>
                          {accountOrCardElement}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-lg font-bold",
                        transaction.amount < 0 ? 'text-destructive' : 'text-success'
                      )}>
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
                  className="button-modern"
                >
                  Ver todas as transações
                </Button>
              </Link>
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
    </div>
  );
}
