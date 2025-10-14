
"use client"

import * as React from "react"
import { PieChart, Pie, Cell } from "recharts"

import {
  ChartContainer,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { cn } from "@/lib/utils"

interface GoalProgressChartProps {
    progress: number;
}

export function GoalProgressChart({ progress }: GoalProgressChartProps) {
  const chartData = [
    { name: 'achieved', value: progress, fill: 'hsl(var(--accent))' },
    { name: 'pending', value: 100 - progress, fill: 'hsl(var(--muted))' }
  ];

  const chartConfig = {
    achieved: { label: "Alcançado", color: "hsl(var(--accent))" },
    pending: { label: "Pendente", color: "hsl(var(--muted))" },
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full max-h-[250px] relative"
    >
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          startAngle={90}
          endAngle={450}
          cornerRadius={50}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
       <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
                <p className="text-3xl font-bold font-headline">
                    {progress.toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground">Alcançado</p>
            </div>
        </div>
    </ChartContainer>
  )
}
