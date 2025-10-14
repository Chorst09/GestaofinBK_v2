"use client";

import * as React from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Fuel, DollarSign, Gauge, Droplets, Car } from 'lucide-react';

import type { Vehicle, VehicleExpense, FuelType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';


interface VehicleFuelChartsProps {
  expenses: VehicleExpense[];
  allVehicles: Vehicle[]; // Although not directly used in calculations here, keep for consistency with prompt
}

interface MonthlyFuelData {
  monthYear: string;
  totalCost: number;
  totalLiters: number;
  totalKmDriven: number;
  avgCostPerLiter: number;
  avgKmPerLiter: number;
  avgCostPerKm: number;
}

export function VehicleFuelCharts({ expenses, allVehicles }: VehicleFuelChartsProps) {

  const monthlyFuelData = React.useMemo(() => {
    const fuelExpenses = expenses.filter(e => e.expenseType === 'fuel');

    if (fuelExpenses.length < 2) {
      return []; // Need at least two fuel entries to calculate any driven distance or consumption
    }

    // Sort fuel expenses chronologically by date and then odometer
    const sortedFuelExpenses = [...fuelExpenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.odometer - b.odometer;
    });

    const dataMap = new Map<string, {
      totalCost: number,
      totalLiters: number,
      firstOdometer: number,
      lastOdometer: number,
      segmentLiters: number[], // Liters from previous fill-ups within the month
      segmentCosts: number[],   // Cost of the fill-up at the end of the segment within the month
      segmentKmDriven: number[] // Km driven in each segment within the month
    }>();

    sortedFuelExpenses.forEach((expense, index) => {
      const date = parseISO(expense.date);
      if (!isValid(date)) return;

      const monthYearKey = format(date, 'yyyy-MM');

      if (!dataMap.has(monthYearKey)) {
        dataMap.set(monthYearKey, {
          totalCost: 0,
          totalLiters: 0,
          firstOdometer: expense.odometer, // Initialize with the first odometer reading in the month
          lastOdometer: expense.odometer,  // Initialize with the first odometer reading in the month
          segmentLiters: [],
          segmentCosts: [],
          segmentKmDriven: []
        });
      }

      const monthData = dataMap.get(monthYearKey)!;
      monthData.totalCost += expense.amount;
      monthData.totalLiters += expense.liters || 0;
      monthData.lastOdometer = expense.odometer; // Update with the last odometer reading in the month

      // Calculate segment data if this is not the very first fuel entry overall
      if (index > 0) {
        const previousExpense = sortedFuelExpenses[index - 1];
        const kmDriven = expense.odometer - previousExpense.odometer;

        // Only consider segments that end within the current month key
        const previousDate = parseISO(previousExpense.date);
         if (isValid(previousDate) && format(previousDate, 'yyyy-MM') === monthYearKey) {
             // If the previous fill-up was in the same month, use its liters for consumption calculation
             monthData.segmentLiters.push(previousExpense.liters || 0);
             monthData.segmentCosts.push(expense.amount); // Cost of the current fill-up
             monthData.segmentKmDriven.push(kmDriven);
         } else if (isValid(previousDate) && format(previousDate, 'yyyy-MM') !== monthYearKey) {
             // If the previous fill-up was in a DIFFERENT month, we can't calculate a precise segment Km/L for this month
             // starting from that previous fill-up. We\'ll use data only from fill-ups *within* this month.
             // The first fill-up of a month (that isn't the overall first) doesn\'t have a previous fill-up within the month
             // to calculate consumption from based on our segment logic.
             // We only add segment data for segments that start AND end within the current month key for monthly averages.
             // The segments array will thus contain data for fill-ups *after* the first fill-up of the month,
             // and up to the last fill-up of the month.
         }

      }
    });

    // Calculate averages for each month
    const monthlyDataArray: MonthlyFuelData[] = [];
    const sortedMonthKeys = Array.from(dataMap.keys()).sort(); // Ensure chronological order

    sortedMonthKeys.forEach(monthYearKey => {
      const monthData = dataMap.get(monthYearKey)!;

      // For monthly averages, we sum the segment data *within* the month.
      const totalSegmentLiters = monthData.segmentLiters.reduce((sum, liters) => sum + liters, 0);
      const totalSegmentCosts = monthData.segmentCosts.reduce((sum, cost) => sum + cost, 0);
      const totalSegmentKmDriven = monthData.segmentKmDriven.reduce((sum, km) => sum + km, 0);


      const avgCostPerLiter = monthData.totalLiters > 0 ? monthData.totalCost / monthData.totalLiters : 0;
      // Monthly average Km/Liter and Cost/Km based on segments that occurred *within* the month
      const avgKmPerLiter = totalSegmentLiters > 0 ? totalSegmentKmDriven / totalSegmentLiters : 0;
      const avgCostPerKm = totalSegmentKmDriven > 0 ? totalSegmentCosts / totalSegmentKmDriven : 0;

      // Display month name for the chart
      const displayMonthYear = format(parseISO(`${monthYearKey}-01`), 'MMM yyyy', { locale: ptBR });


      monthlyDataArray.push({
        monthYear: displayMonthYear,
        totalCost: monthData.totalCost,
        totalLiters: monthData.totalLiters,
        totalKmDriven: monthData.lastOdometer - monthData.firstOdometer, // Total KM difference within the month
        avgCostPerLiter,
        avgKmPerLiter,
        avgCostPerKm,
      });
    });


    return monthlyDataArray;

  }, [expenses]);


  const hasEnoughDataForCharts = monthlyFuelData.length > 0;

  const chartConfigCost = React.useMemo(() => ({
    totalCost: {
      label: 'Custo Total (R$)',
      color: 'hsl(var(--destructive))',
    },
  }), []);

   const chartConfigKmPerLiter = React.useMemo(() => ({
    avgKmPerLiter: {
      label: 'Km/Litro',
      color: 'hsl(var(--primary))',
    },
  }), []);

   const chartConfigCostPerKm = React.useMemo(() => ({
    avgCostPerKm: {
      label: 'R$/Km',
      color: 'hsl(var(--destructive))',
    },
  }), []);

    const chartConfigCostPerLiter = React.useMemo(() => ({
    avgCostPerLiter: {
      label: 'R$/Litro',
      color: 'hsl(var(--destructive))',
    },
  }), []);


  if (!hasEnoughDataForCharts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2"><Fuel /> Gráficos de Combustível</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-center text-muted-foreground py-8">
             Não há dados de combustível suficientes (pelo menos 2 abastecimentos) para gerar os gráficos.
           </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Total Fuel Cost Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2"><DollarSign /> Custo Total por Mês</CardTitle>
          <CardDescription>Visualização do custo total de combustível mensal.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfigCost} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFuelData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="monthYear" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis
                    tickFormatter={(value) => `R$ ${(Number(value) || 0).toFixed(0)}`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                 />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent
                      formatter={(value, name) => {
                        const numValue = Number(value);
                        const formattedValue = isNaN(numValue) ? '0.00' : numValue.toFixed(2);
                        return (
                          <div className="flex flex-col">
                            <span className="capitalize text-sm font-medium">{name === 'totalCost' ? 'Custo Total' : name}</span>
                            <span className="text-sm text-muted-foreground">R$ {formattedValue}</span>
                          </div>
                        );
                      }}
                    />}
                 />
                 <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="totalCost" fill="var(--color-totalCost)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Average Km/Liter Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2"><Gauge /> Km/Litro Médio por Mês</CardTitle>
          <CardDescription>Visualização da eficiência de combustível mensal.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfigKmPerLiter} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyFuelData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="monthYear" tickLine={false} tickMargin={10} axisLine={false} />
                 <YAxis
                    tickFormatter={(value) => (Number(value) || 0).toFixed(1)}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                 />
                <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent
                      formatter={(value, name) => {
                        const numValue = Number(value);
                        const formattedValue = isNaN(numValue) ? '0.00' : numValue.toFixed(2);
                        return (
                          <div className="flex flex-col">
                            <span className="capitalize text-sm font-medium">{name === 'avgKmPerLiter' ? 'Km/Litro' : name}</span>
                            <span className="text-sm text-muted-foreground">{formattedValue} Km/L</span>
                          </div>
                        );
                      }}
                    />}
                />
                 <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="avgKmPerLiter" stroke="var(--color-avgKmPerLiter)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

       {/* Average Cost/Km Chart */}
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2"><Car /> Custo Médio por Km por Mês</CardTitle>
          <CardDescription>Visualização do custo por quilômetro rodado mensal.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfigCostPerKm} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyFuelData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="monthYear" tickLine={false} tickMargin={10} axisLine={false} />
                 <YAxis
                    tickFormatter={(value) => `R$ ${(Number(value) || 0).toFixed(2)}`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                 />
                <ChartTooltip
                    cursor={true}
                     content={<ChartTooltipContent
                      formatter={(value, name) => {
                        const numValue = Number(value);
                        const formattedValue = isNaN(numValue) ? '0.00' : numValue.toFixed(2);
                        return (
                          <div className="flex flex-col">
                            <span className="capitalize text-sm font-medium">{name === 'avgCostPerKm' ? 'Custo/Km' : name}</span>
                            <span className="text-sm text-muted-foreground">R$ {formattedValue}</span>
                          </div>
                        );
                      }}
                    />}
                />
                 <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="avgCostPerKm" stroke="var(--color-avgCostPerKm)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

       {/* Average Cost/Liter Chart */}
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2"><Droplets /> Custo Médio por Litro por Mês</CardTitle>
          <CardDescription>Visualização do custo médio por litro de combustível mensal.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfigCostPerLiter} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyFuelData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="monthYear" tickLine={false} tickMargin={10} axisLine={false} />
                 <YAxis
                    tickFormatter={(value) => `R$ ${(Number(value) || 0).toFixed(2)}`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                 />
                <ChartTooltip
                    cursor={true}
                     content={<ChartTooltipContent
                       formatter={(value, name) => {
                        const numValue = Number(value);
                        const formattedValue = isNaN(numValue) ? '0.00' : numValue.toFixed(2);
                        return (
                          <div className="flex flex-col">
                            <span className="capitalize text-sm font-medium">{name === 'avgCostPerLiter' ? 'Custo/Litro' : name}</span>
                            <span className="text-sm text-muted-foreground">R$ {formattedValue}</span>
                          </div>
                        );
                      }}
                     />}
                />
                 <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="avgCostPerLiter" stroke="var(--color-avgCostPerLiter)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}