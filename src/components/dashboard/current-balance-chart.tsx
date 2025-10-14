
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WalletCards } from 'lucide-react';

interface BalanceHistoryPoint {
  date: string; // Expects 'yyyy-MM-dd'
  balance: number;
}

interface CurrentBalanceChartProps {
  data: BalanceHistoryPoint[];
}

const chartConfig = {
  balance: {
    label: "Saldo", // Simplified label for the legend
    color: "hsl(var(--chart-1))",
  },
};

export function CurrentBalanceChart({ data }: CurrentBalanceChartProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const formattedData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.filter(point => point && typeof point.balance === 'number').map(point => ({
      ...point,
    }));
  }, [data]);

  if (!data || data.length < 2) { // A line chart needs at least 2 points
    return (
      <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm">
              <WalletCards className="h-5 w-5 text-white" />
            </div>
            Histórico do Saldo
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
            Evolução do seu saldo ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-80">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <WalletCards className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
            Dados insuficientes para exibir o gráfico de saldo.<br />
            <span className="text-sm">São necessários pelo menos dois pontos de dados.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm">
            <WalletCards className="h-5 w-5 text-white" />
          </div>
          Histórico do Saldo
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
          Evolução do saldo baseada nas transações e saldo inicial das contas
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2 pr-6 pb-6 pt-0"> {/* Adjusted padding for better axis visibility */}
        {isClient ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 5, // Reduced right margin
                left: 15, // Increased left margin for Y-axis labels
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(parseISO(value), 'dd/MM', { locale: ptBR })}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // padding={{ left: 10, right: 10 }} // Handled by margins and container padding
              />
              <YAxis
                tickFormatter={(value) => `R$${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={['auto', 'auto']}
                width={70} // Width for Y-axis labels
              />
              <ChartTooltip
                cursor={true}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => format(parseISO(label), "dd/MM/yyyy", { locale: ptBR })}
                    formatter={(value, nameKey) => { // nameKey here is 'balance'
                       const numValue = Number(value);
                       const formattedValue = isNaN(numValue) ? 'R$ 0,00' : numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                       // Access label from chartConfig using the dataKey
                       const configEntry = chartConfig[nameKey as keyof typeof chartConfig];
                       return [formattedValue, configEntry?.label || nameKey];
                    }}
                    itemStyle={{ color: 'var(--color-balance)'}}
                  />
                }
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="var(--color-balance)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  strokeWidth: 1,
                }}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                }}
                name={chartConfig.balance.label} // Used by Legend
              />
            </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />
        )}
      </CardContent>
    </Card>
  );
}
