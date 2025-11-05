
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
import { PlusCircle, Edit, Trash2, Scale, Landmark, DollarSign, CreditCard as CreditCardIconLucide, CalendarIcon, Filter, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
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

  const creditCardInstallmentItems = React.useMemo(() => { // This should filter from filteredForecastItems
    const isCreditCardInstallment = (item: ForecastItem) => item.type === 'expense' && item.installmentId !== undefined && item.installmentId !== null && getCategoryByName(item.category)?.isCreditCard;
    return filteredForecastItems.filter(isCreditCardInstallment);
  }, [date, selectedCategories, forecastItems]);

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

  const totalCreditCardInstallments = React.useMemo(() => {
    let cardInstallmentTotal: number = 0; // Initialize as number
    creditCardInstallmentItems.forEach(item => {
      const amount = Number(item.amount); // Ensure amount is a number
      if (!isNaN(amount)) { // Check if it's a valid number
        cardInstallmentTotal += Math.abs(amount);
      }
    });
    return cardInstallmentTotal; // Return the calculated total
  }, [creditCardInstallmentItems]); // Depend on creditCardInstallmentItems

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight mb-6">Dashboard de Previsões</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body">Receitas Previstas {hasFilters ? '(Período)' : '(Geral)'}</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline text-accent-foreground bg-accent/30 rounded px-2 py-1 w-fit">
                R$ {income.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {hasFilters ? 'Soma das previsões no período/filtros.' : 'Soma de todas as previsões de receita.'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-body">Despesas Previstas {hasFilters ? '(Período)' : '(Geral)'}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline text-destructive">
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">Comparativo: Receitas vs. Despesas</CardTitle>
              <CardDescription>
                {hasFilters ? `Visualização das previsões para o período/filtros selecionados.` : 'Visualização geral das suas previsões.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {(income > 0 || expenses > 0) ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
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
      <div className="space-y-6">
        <PredictionsSummaryCard />
        <PredictionsCard />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-headline font-semibold">Gerenciar Itens de Previsão</h2>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenFormForAdd} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Item de Previsão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline">
                  {editingForecastItem ? 'Editar Item de Previsão' : 'Adicionar Novo Item de Previsão'}
                </DialogTitle>
                <DialogDescription>
                  {editingForecastItem ? 'Atualize os detalhes do item de previsão.' : 'Preencha os detalhes do novo item de previsão.'}
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

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Lista Detalhada de Previsões</CardTitle>
            <CardDescription>Visualize e gerencie seus itens de previsão de receitas e despesas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}>
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span className="sr-only">Mês anterior</span>
                </Button>
                <span className="text-lg font-semibold font-headline min-w-[120px] text-center">
                  {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                </span>
                <Button variant="outline" size="icon" onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}>
                  <ChevronRightIcon className="h-4 w-4" />
                  <span className="sr-only">Próximo mês</span>
                </Button>
                {/* Popover for date picker could go here if needed, currently not implemented */}
                {/* <Popover></Popover> */}
              </div>

              <Button variant="outline" size="sm" onClick={() => setDatePreset('this_month')}>Este Mês</Button>
              <Button variant="outline" size="sm" onClick={() => setDatePreset('last_month')}>Mês Passado</Button>
              <Button variant="outline" size="sm" onClick={() => setDatePreset('this_year')}>Este Ano</Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Categorias
                    {selectedCategories.size > 0 && <Badge variant="secondary" className="ml-2">{selectedCategories.size}</Badge>}
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
                <Button variant="ghost" onClick={() => { setSelectedMonth(startOfMonth(new Date())); setSelectedCategories(new Set()); }}>Limpar Filtros</Button>
              )}
            </div>

            {filteredForecastItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {hasFilters ? 'Nenhuma previsão encontrada para o período/filtros selecionados.' : 'Nenhum item de previsão registrado ainda.'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês/Ano</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Cartão/Banco Associado</TableHead>
                    <TableHead className="text-right">Valor Previsto</TableHead>
                    <TableHead>Fixo?</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForecastItems.map((item) => {
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
                        <TableCell>{formattedDate}</TableCell>
                        <TableCell>{item.description}{isInstallment ? <span className="text-muted-foreground ml-1">{`(${item.currentInstallment}/${item.totalInstallments})`}</span> : ''}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Icon className="h-3 w-3" />
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{cardDetailsElement}</TableCell>
                        <TableCell className={`text-right font-medium ${itemAmount < 0 ? 'text-destructive' : 'text-accent-foreground bg-accent/30 rounded px-1 py-0.5'}`}>
                          R$ {Math.abs(itemAmount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {item.type === 'expense' && item.isFixed ? 'Sim' : 'Não'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenFormForEdit(item)} className="mr-2">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteConfirmation(item)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                {hasFilters && (
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold text-lg">Totais do Período</TableCell>
                      <TableCell className="text-right font-bold">
                        <div className="flex flex-col gap-1 items-end">
                          <span className="text-accent-foreground text-base">R$ {income.toFixed(2)}</span>
                          <span className="text-destructive text-base">- R$ {expenses.toFixed(2)}</span>
                          <Separator className="my-1" />
                          <span className={`text-lg ${balance >= 0 ? 'text-accent-foreground' : 'text-destructive'}`}>
                            R$ {balance.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New section for Credit Card Installment Forecasts */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Previsões de Compras Parceladas no Cartão</CardTitle>
            <CardDescription>Visualize e gerencie suas previsões de despesas parceladas no cartão de crédito.</CardDescription>
          </CardHeader>
          <CardContent>
            {creditCardInstallmentItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {hasFilters ? 'Nenhuma previsão de compra parcelada no cartão encontrada para o período/filtros selecionados.' : 'Nenhum item de previsão de compra parcelada no cartão registrado ainda.'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês/Ano</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Cartão Associado</TableHead>
                    <TableHead className="text-right">Valor Previsto</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditCardInstallmentItems
                    .map((item) => {
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
                            cardDetailsElement = <span className="text-xs text-muted-foreground\">Cartão não encontrado</span>;
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
                          <TableCell>{formattedDate}</TableCell>
                          <TableCell>{item.description}{isInstallment ? <span className="text-muted-foreground ml-1">{`(${item.currentInstallment}/${item.totalInstallments})`}</span> : ''}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Icon className="h-3 w-3" />
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{cardDetailsElement}</TableCell>
                          <TableCell className={`text-right font-medium ${itemAmount < 0 ? 'text-destructive' : 'text-accent-foreground bg-accent/30 rounded px-1 py-0.5'}`}>
                            R$ {Math.abs(itemAmount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenFormForEdit(item)} className="mr-2"><Edit className="h-4 w-4" /><span className="sr-only">Editar</span></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteConfirmation(item)}><Trash2 className="h-4 w-4" /><span className="sr-only">Excluir</span></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
                {creditCardInstallmentItems.length > 0 && (
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold text-lg">Total Parcelado</TableCell>
                      <TableCell className="text-right font-bold text-destructive text-base">R$ {totalCreditCardInstallments.toFixed(2)}</TableCell>
                      <TableCell colSpan={1}></TableCell> {/* Span the remaining columns */}
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
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
  );
}
