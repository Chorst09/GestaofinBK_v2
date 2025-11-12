
"use client";

import * as React from 'react';
import { useForecasts } from '@/hooks/useForecasts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ForecastForm } from '@/components/forecasts/forecast-form';
import type { ForecastItem, CreditCard as CreditCardType } from '@/lib/types';
import { format, parseISO, startOfMonth, subMonths, startOfYear, endOfYear, startOfDay, endOfDay, endOfMonth, addMonths, endOfMonth as endOfMonthFns } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Keep only one import for ptBR
import { PlusCircle, Edit, Trash2, Scale, Landmark, DollarSign, CreditCard as CreditCardIconLucide, CalendarIcon, Filter, ChevronLeftIcon, ChevronRightIcon, TrendingUp, RefreshCw } from 'lucide-react';
import { getCategoryIcon, getCategoryByName, TRANSACTION_CATEGORIES } from '@/components/transactions/categories';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ForecastedCardSpendingChart } from '@/components/forecasts/forecasted-card-spending-chart';
import { ForecastedCategorySpendingChart } from '@/components/forecasts/forecasted-category-spending-chart';
import { PredictionsCard } from '@/components/forecasts/predictions-card';
import { PredictionsSummaryCard } from '@/components/forecasts/predictions-summary-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

export default function ForecastsPage() {
  const {
    forecastItems,
    addForecastItem,
    updateForecastItem,
    deleteForecastItem,
  } = useForecasts();
  const { getCreditCardById } = useCreditCards();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingForecastItem, setEditingForecastItem] = React.useState<ForecastItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ForecastItem | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { toast } = useToast();

  const [selectedMonth, setSelectedMonth] = React.useState(startOfMonth(new Date()));
  const [selectedCategories, setSelectedCategories] = React.useState<Set<string>>(new Set()); // Renamed for clarity

  const dateRangeForFilter: DateRange = { from: startOfMonth(selectedMonth), to: endOfMonth(selectedMonth) };

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

  const setDatePreset = (preset: 'this_month' | 'last_month' | 'this_year') => {
    const now = new Date();
    if (preset === 'this_month') {
      setSelectedMonth(startOfMonth(now));
    } else if (preset === 'last_month') {
      const lastMonth = subMonths(now, 1);
      setSelectedMonth(startOfMonth(lastMonth));
    } // Note: 'this_year' preset doesn't make sense with month-based filtering, omitted.
  };

  const creditCardCategoryName = TRANSACTION_CATEGORIES.find(c => c.isCreditCard && c.type === 'expense')?.name || 'Cartão de Crédito';
  const date = dateRangeForFilter; // Using the computed date range for clarity in subsequent logic
  const hasFilters = !!date?.from || selectedCategories.size > 0;

  const filteredForecastItems = React.useMemo(() => {
    let filtered = forecastItems;

    // Date filter
    if (date?.from) {
      const fromDate = startOfDay(date.from);
      const toDate = date.to ? endOfDay(date.to) : endOfDay(date.from);
      filtered = filtered.filter(item => {
        try {
          const forecastDate = parseISO(item.date);
          return forecastDate >= fromDate && forecastDate <= toDate;
        } catch {
          return false;
        }
      });
    }

    // Category filter
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(item => selectedCategories.has(item.category));
    }

    // Filter for credit card installments
    // Moved filtering for credit card installments to a separate memo

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [date, selectedCategories, forecastItems]); // Dependency on 'date' which is derived from 'selectedMonth'

  // Calculate totals for ALL forecast items (without filters)
  const { totalIncome, totalExpenses, totalBalance } = React.useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    forecastItems.forEach(item => {
      if (item.type === 'income') {
        totalIncome += Number(item.amount) || 0;
      } else {
        totalExpenses += Math.abs(Number(item.amount) || 0);
      }
    });

    return { totalIncome, totalExpenses, totalBalance: totalIncome - totalExpenses };
  }, [forecastItems]);

  // Separar diferentes tipos de previsões
  const creditCardInstallmentItems = React.useMemo(() => {
    const isCreditCardInstallment = (item: ForecastItem) => item.type === 'expense' && item.installmentId !== undefined && item.installmentId !== null && getCategoryByName(item.category)?.isCreditCard;
    return filteredForecastItems.filter(isCreditCardInstallment);
  }, [filteredForecastItems]);

  const otherExpenseItems = React.useMemo(() => {
    const isOtherExpense = (item: ForecastItem) => {
      if (item.type !== 'expense') return false;
      // Excluir compras parceladas no cartão
      const categoryConfig = getCategoryByName(item.category);
      const isInstallment = item.installmentId !== undefined && item.installmentId !== null;
      if (categoryConfig?.isCreditCard && isInstallment) return false;
      return true;
    };
    return filteredForecastItems.filter(isOtherExpense);
  }, [filteredForecastItems]);

  const incomeItems = React.useMemo(() => {
    return filteredForecastItems.filter(item => item.type === 'income');
  }, [filteredForecastItems]);

  // Calculate totals for the filtered items
  const { income, expenses, balance, cardExpenses } = React.useMemo(() => {
    let income = 0;
    let expenses = 0;
    let cardExpenses = 0;

    filteredForecastItems.forEach(item => {
      if (item.type === 'income') {
        income += item.amount;
      } else {
        expenses += Math.abs(item.amount);
        if (item.category === creditCardCategoryName) {
          cardExpenses += Math.abs(item.amount);
        }
      }
    });

    return { income, expenses, balance: income - expenses, cardExpenses };
  }, [filteredForecastItems, creditCardCategoryName]);

  // Calcular totais por seção
  const sectionTotals = React.useMemo(() => {
    let cardInstallmentTotal = 0;
    let otherExpensesTotal = 0;
    let incomeTotal = 0;

    creditCardInstallmentItems.forEach(item => {
      const amount = Number(item.amount);
      if (!isNaN(amount)) {
        cardInstallmentTotal += Math.abs(amount);
      }
    });

    otherExpenseItems.forEach(item => {
      const amount = Number(item.amount);
      if (!isNaN(amount)) {
        otherExpensesTotal += Math.abs(amount);
      }
    });

    incomeItems.forEach(item => {
      const amount = Number(item.amount);
      if (!isNaN(amount)) {
        incomeTotal += Math.abs(amount);
      }
    });

    return {
      cardInstallmentTotal,
      otherExpensesTotal,
      incomeTotal
    };
  }, [creditCardInstallmentItems, otherExpenseItems, incomeItems]);

  const chartData = React.useMemo(() => [{
    name: hasFilters ? 'Período/Filtros' : 'Previsões Gerais',
    receitas: income,
    despesas: expenses,
  },
  ], [income, expenses, hasFilters]);

  const chartConfig = React.useMemo(() => ({
    receitas: {
      label: 'Receitas Previstas',
      color: 'hsl(var(--accent))',
    },
    despesas: {
      label: 'Despesas Previstas',
      color: 'hsl(var(--destructive))',
    },
  }), []);


  const handleOpenFormForEdit = (item: ForecastItem) => {
    setEditingForecastItem(item);
    setIsFormOpen(true);
  };

  const handleOpenFormForAdd = () => {
    setEditingForecastItem(null);
    setIsFormOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular um pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 500));
    // Forçar re-render dos dados
    setSelectedMonth(prev => new Date(prev.getTime()));
    setIsRefreshing(false);
    toast({
      title: "Dados atualizados",
      description: "As previsões foram atualizadas com sucesso."
    });
  };

  const handleFormSubmitSuccess = () => {
    setIsFormOpen(false);
    setEditingForecastItem(null);
  };

  const handleDeleteConfirmation = (item: ForecastItem) => {
    setDeleteTarget(item);
  };

  const executeDelete = (deleteAllRelated: boolean) => {
    if (!deleteTarget) return;
    deleteForecastItem(deleteTarget.id, deleteAllRelated);
    toast({ title: "Previsão excluída", description: "O item de previsão foi removido com sucesso." });
    setDeleteTarget(null);
  };

  // Função auxiliar para renderizar tabela de previsões
  const renderForecastTable = (items: ForecastItem[], emptyMessage: string, total?: number) => {
    if (items.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-8">
          {emptyMessage}
        </p>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">Mês/Ano</TableHead>
              <TableHead className="min-w-[150px]">Descrição</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[120px]">Categoria</TableHead>
              <TableHead className="hidden md:table-cell min-w-[150px]">Cartão/Banco</TableHead>
              <TableHead className="text-right min-w-[100px]">Valor</TableHead>
              <TableHead className="hidden lg:table-cell">Fixo?</TableHead>
              <TableHead className="text-center min-w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const Icon = getCategoryIcon(item.category);
              let formattedDate = 'Data inválida';
              try {
                const dateStr = String(item.date);
                const parsedDate = parseISO(dateStr);
                if (!isNaN(parsedDate.getTime())) {
                  const displayDate = new Date(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate());
                  formattedDate = format(displayDate, 'MMMM yyyy', { locale: ptBR });
                }
              } catch (e) {
                console.error("Erro ao formatar data da previsão:", e, "Data original:", item.date);
              }
              const itemAmount = Number(item.amount) || 0;

              let cardDetailsElement = <span className="text-muted-foreground">-</span>;
              const categoryConfig = getCategoryByName(item.category);

              if (item.type === 'expense' && categoryConfig?.isCreditCard) {
                if (item.creditCardId) {
                  const card = getCreditCardById(item.creditCardId);
                  if (card) {
                    cardDetailsElement = (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <CreditCardIconLucide className="h-3 w-3 text-muted-foreground" />
                        {card.bankName} ({card.cardFlag})
                      </Badge>
                    );
                  } else {
                    cardDetailsElement = <span className="text-xs text-muted-foreground">Cartão não encontrado</span>;
                  }
                } else if (item.explicitBankName) {
                  cardDetailsElement = (
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <CreditCardIconLucide className="h-3 w-3 text-muted-foreground" />
                      {item.explicitBankName} (Manual)
                    </Badge>
                  );
                }
              }

              const isInstallment = item.installmentId && item.currentInstallment && item.totalInstallments;

              return (
                <TableRow key={item.id}>
                  <TableCell className="text-xs sm:text-sm">{format(parseISO(String(item.date)), 'MMM/yy', { locale: ptBR })}</TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <div className="max-w-[150px] sm:max-w-none truncate">
                      {item.description}
                      {isInstallment && <span className="text-muted-foreground ml-1 text-xs">{`(${item.currentInstallment}/${item.totalInstallments})`}</span>}
                    </div>
                    <div className="sm:hidden mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Icon className="h-3 w-3 mr-1" />
                        {item.category}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="flex items-center gap-1 w-fit text-xs">
                      <Icon className="h-3 w-3" />
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs">{cardDetailsElement}</TableCell>
                  <TableCell className={`text-right font-medium text-xs sm:text-sm ${itemAmount < 0 ? 'text-destructive' : 'text-accent-foreground bg-accent/30 rounded px-1 py-0.5'}`}>
                    R$ {Math.abs(itemAmount).toFixed(2)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs">
                    {item.type === 'expense' && item.isFixed ? 'Sim' : 'Não'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenFormForEdit(item)} className="h-8 w-8 p-0">
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-8 w-8 p-0" onClick={() => handleDeleteConfirmation(item)}>
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          {total !== undefined && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold text-lg">Total da Seção</TableCell>
                <TableCell className="text-right font-bold text-base">
                  R$ {total.toFixed(2)}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight mb-4 sm:mb-6">Dashboard de Previsões</h1>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium font-body">Receitas Previstas {hasFilters ? '(Período)' : '(Geral)'}</CardTitle>
              <Landmark className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold font-headline text-accent-foreground bg-accent/30 rounded px-2 py-1 w-fit">
                R$ {income.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {hasFilters ? 'Soma das previsões no período/filtros.' : 'Soma de todas as previsões de receita.'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium font-body">Despesas Previstas {hasFilters ? '(Período)' : '(Geral)'}</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold font-headline text-destructive">
                R$ {expenses.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {hasFilters ? 'Soma das previsões no período/filtros.' : 'Soma de todas as previsões de despesa.'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body">Saldo Previsto {hasFilters ? '(Período)' : '(Geral)'}</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-headline ${balance >= 0 ? 'text-accent-foreground' : 'text-destructive'}`}>
                R$ {balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground pt-1">Diferença entre receitas e despesas previstas.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body">Despesas de Cartão {hasFilters ? '(Período)' : '(Geral)'}</CardTitle>
              <CreditCardIconLucide className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline text-destructive">
                R$ {cardExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground pt-1">Soma das previsões na categoria '{creditCardCategoryName}'.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline text-lg sm:text-xl">Comparativo: Receitas vs. Despesas</CardTitle>
              <CardDescription className="text-sm">
                {hasFilters ? `Visualização das previsões para o período/filtros selecionados.` : 'Visualização geral das suas previsões.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {(income > 0 || expenses > 0) ? (
                <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={(value) => {
                          const numValue = Number(value);
                          if (isNaN(numValue)) return 'R$ 0k';
                          return `R$ ${(numValue || 0) / 1000}k`;
                        }}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        domain={[0, (dataMax: number) => Math.max(Number(dataMax) || 0, income, expenses) + 100]}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent
                          formatter={(value, name) => {
                            const numValue = Number(value);
                            const formattedValue = isNaN(numValue) ? '0.00' : (numValue || 0).toFixed(2);
                            return (
                              <div className="flex flex-col">
                                <span className="capitalize text-sm font-medium">{name === 'receitas' ? 'Receitas Previstas' : 'Despesas Previstas'}</span>
                                <span className="text-sm text-muted-foreground">R$ {formattedValue}</span>
                              </div>
                            );
                          }}
                        />}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="receitas" fill="var(--color-receitas)" radius={4} />
                      <Bar dataKey="despesas" fill="var(--color-despesas)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {hasFilters ? 'Nenhuma previsão no período/filtros para exibir gráfico.' : 'Nenhuma previsão registrada para exibir o gráfico.'}
                </p>
              )}
            </CardContent>
          </Card>

          <ForecastedCardSpendingChart forecastItems={filteredForecastItems} />
          <ForecastedCategorySpendingChart forecastItems={filteredForecastItems} />
        </div>
      </div>

      {/* Cards de Previsões Independentes */}
      <div className="space-y-4 sm:space-y-6">
        <PredictionsSummaryCard />
        <PredictionsCard />
      </div>

      {/* Seção de Gerenciamento - Cabeçalho Global */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-headline font-semibold">Gerenciar Previsões por Categoria</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="default"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Atualizar</span>
            </Button>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenFormForAdd} className="flex-1 sm:flex-none">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Previsão
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-headline">
                    {editingForecastItem ? 'Editar Previsão' : 'Adicionar Nova Previsão'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingForecastItem ? 'Atualize os detalhes da previsão.' : 'Preencha os detalhes da nova previsão.'}
                  </DialogDescription>
                </DialogHeader>
                <ForecastForm
                  onSubmitSuccess={handleFormSubmitSuccess}
                  initialData={editingForecastItem}
                  onAddForecastItem={addForecastItem}
                  onUpdateForecastItem={updateForecastItem}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Cards de Gerenciamento - Empilhados Verticalmente */}
        <div className="space-y-3 sm:space-y-4">
          {/* Seção 1: Receitas Previstas */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="font-headline flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Receitas Previstas
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Visualize e gerencie suas previsões de receitas e entradas financeiras.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-2 bg-muted rounded-lg p-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}>
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span className="sr-only">Mês anterior</span>
                  </Button>
                  <span className="text-sm sm:text-base font-semibold font-headline min-w-[100px] sm:min-w-[140px] text-center capitalize">
                    {format(selectedMonth, 'MMM yyyy', { locale: ptBR })}
                  </span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}>
                    <ChevronRightIcon className="h-4 w-4" />
                    <span className="sr-only">Próximo mês</span>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDatePreset('this_month')}>Este Mês</Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDatePreset('last_month')}>Mês Passado</Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs hidden sm:inline-flex" onClick={() => setDatePreset('this_year')}>Este Ano</Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1 sm:gap-2">
                      <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">Categorias</span>
                      {selectedCategories.size > 0 && <Badge variant="secondary" className="h-4 px-1 text-xs">{selectedCategories.size}</Badge>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>Filtrar por Categoria</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {TRANSACTION_CATEGORIES.filter(c => c.type !== 'general').map(category => (
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

                {hasFilters && (
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setSelectedMonth(startOfMonth(new Date())); setSelectedCategories(new Set()); }}>
                    Limpar Filtros
                  </Button>
                )}
              </div>

              {renderForecastTable(
                incomeItems,
                hasFilters ? 'Nenhuma receita encontrada para o período/filtros selecionados.' : 'Nenhuma receita registrada ainda.',
                sectionTotals.incomeTotal
              )}
            </CardContent>
          </Card>

          {/* Seção 2: Outras Despesas (Moradia, Financiamento, etc.) */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="font-headline flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Outras Despesas
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Despesas gerais como moradia, financiamento, contas fixas e outras categorias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderForecastTable(
                otherExpenseItems,
                hasFilters ? 'Nenhuma despesa encontrada para o período/filtros selecionados.' : 'Nenhuma despesa registrada ainda.',
                sectionTotals.otherExpensesTotal
              )}
            </CardContent>
          </Card>

          {/* Seção 3: Compras Parceladas no Cartão */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="font-headline flex items-center gap-2 text-base sm:text-lg">
                <CreditCardIconLucide className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                Compras Parceladas no Cartão
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Visualize e gerencie suas previsões de despesas parceladas no cartão de crédito.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderForecastTable(
                creditCardInstallmentItems,
                hasFilters ? 'Nenhuma compra parcelada encontrada para o período/filtros selecionados.' : 'Nenhuma compra parcelada registrada ainda.',
                sectionTotals.cardInstallmentTotal
              )}
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              {deleteTarget?.installmentId ? (
                <>
                  <AlertDialogTitle>Confirmar Exclusão de Parcela</AlertDialogTitle>
                  <AlertDialogDescription>
                    Este item faz parte de uma compra parcelada. Deseja excluir apenas esta parcela ou esta e todas as parcelas futuras?
                  </AlertDialogDescription>
                </>
              ) : (
                <>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este item de previsão? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
              {deleteTarget?.installmentId ? (
                <>
                  <AlertDialogAction onClick={() => executeDelete(false)}>Excluir Somente Esta</AlertDialogAction>
                  <AlertDialogAction onClick={() => executeDelete(true)} className="bg-destructive hover:bg-destructive/90">Excluir Todas Futuras</AlertDialogAction>
                </>
              ) : (
                <AlertDialogAction onClick={() => executeDelete(false)} className="bg-destructive hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}