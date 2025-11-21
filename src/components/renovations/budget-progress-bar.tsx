"use client";

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetProgressBarProps {
  totalBudget: number;
  adjustedBudget: number;
  totalSpent: number;
  safetyMarginPercent: number;
  stageName?: string;
  showDetails?: boolean;
  className?: string;
}

export function BudgetProgressBar({
  totalBudget,
  adjustedBudget,
  totalSpent,
  safetyMarginPercent,
  stageName,
  showDetails = true,
  className,
}: BudgetProgressBarProps) {
  // Calcular progresso em relação ao orçamento ajustado
  const adjustedProgress = (totalSpent / adjustedBudget) * 100;
  const baseProgress = (totalSpent / totalBudget) * 100;
  
  const remaining = adjustedBudget - totalSpent;
  const safetyMarginAmount = totalBudget * (safetyMarginPercent / 100);
  
  // Determinar status e cor
  const getStatus = () => {
    if (adjustedProgress >= 100) {
      return {
        status: 'critical',
        color: 'bg-red-500',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: AlertTriangle,
        label: 'Orçamento Excedido',
        message: `Você ultrapassou o orçamento ajustado em R$ ${Math.abs(remaining).toFixed(2)}`,
      };
    } else if (baseProgress >= 100) {
      return {
        status: 'warning-high',
        color: 'bg-orange-500',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950',
        borderColor: 'border-orange-200 dark:border-orange-800',
        icon: AlertTriangle,
        label: 'Margem de Segurança Atingida',
        message: `Você excedeu o orçamento base, mas ainda está dentro da margem de segurança`,
      };
    } else if (baseProgress >= 80) {
      return {
        status: 'warning',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        icon: TrendingUp,
        label: 'Atenção ao Orçamento',
        message: `Você já utilizou ${baseProgress.toFixed(1)}% do orçamento base`,
      };
    } else {
      return {
        status: 'good',
        color: 'bg-green-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: CheckCircle2,
        label: 'Orçamento Sob Controle',
        message: `Você utilizou ${baseProgress.toFixed(1)}% do orçamento base`,
      };
    }
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className={cn('pb-3', status.bgColor, status.borderColor, 'border-b')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn('h-5 w-5', status.textColor)} />
            <CardTitle className="text-base">
              {stageName ? `Progresso: ${stageName}` : 'Progresso do Orçamento'}
            </CardTitle>
          </div>
          <div className={cn('text-sm font-semibold', status.textColor)}>
            {adjustedProgress.toFixed(1)}%
          </div>
        </div>
        {showDetails && (
          <CardDescription className="flex items-center gap-1 mt-1">
            <Shield className="h-3 w-3" />
            Margem de segurança: {safetyMarginPercent}%
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Barra de Progresso Principal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gasto vs. Orçamento Ajustado</span>
            <span className="font-medium">
              R$ {totalSpent.toFixed(2)} / R$ {adjustedBudget.toFixed(2)}
            </span>
          </div>
          
          {/* Barra com múltiplas zonas */}
          <div className="relative h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            {/* Zona verde (0-80% do base) */}
            <div
              className="absolute h-full bg-green-500 transition-all duration-500"
              style={{ width: `${Math.min((80 / 100) * (totalBudget / adjustedBudget) * 100, 100)}%` }}
            />
            
            {/* Zona amarela (80-100% do base) */}
            <div
              className="absolute h-full bg-yellow-500 transition-all duration-500"
              style={{
                left: `${(80 / 100) * (totalBudget / adjustedBudget) * 100}%`,
                width: `${Math.min((20 / 100) * (totalBudget / adjustedBudget) * 100, 100)}%`,
              }}
            />
            
            {/* Zona laranja (margem de segurança) */}
            <div
              className="absolute h-full bg-orange-500 transition-all duration-500"
              style={{
                left: `${(totalBudget / adjustedBudget) * 100}%`,
                width: `${((adjustedBudget - totalBudget) / adjustedBudget) * 100}%`,
              }}
            />
            
            {/* Progresso real */}
            <div
              className={cn(
                'absolute h-full transition-all duration-500 flex items-center justify-end pr-2',
                status.color
              )}
              style={{ width: `${Math.min(adjustedProgress, 100)}%` }}
            >
              {adjustedProgress > 10 && (
                <span className="text-xs font-bold text-white">
                  {adjustedProgress.toFixed(0)}%
                </span>
              )}
            </div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Seguro (0-80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Atenção (80-100%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span>Margem ({safetyMarginPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Detalhes Financeiros */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-xs text-muted-foreground">Orçamento Base</div>
              <div className="text-sm font-semibold">R$ {totalBudget.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Margem de Segurança</div>
              <div className="text-sm font-semibold text-blue-600">
                R$ {safetyMarginAmount.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Gasto</div>
              <div className={cn('text-sm font-semibold', status.textColor)}>
                R$ {totalSpent.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Saldo Restante</div>
              <div className={cn(
                'text-sm font-semibold',
                remaining >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                R$ {remaining.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de Status */}
        <div className={cn(
          'p-3 rounded-lg flex items-start gap-2',
          status.bgColor,
          status.borderColor,
          'border'
        )}>
          <StatusIcon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', status.textColor)} />
          <div className="flex-1">
            <div className={cn('text-sm font-medium', status.textColor)}>
              {status.label}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {status.message}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
