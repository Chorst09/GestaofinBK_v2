"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, DollarSign, TrendingUp, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InterestCalculatorPage() {
  const [purchaseValue, setPurchaseValue] = React.useState<string>("3590");
  const [installmentValue, setInstallmentValue] = React.useState<string>("450");
  const [numberOfInstallments, setNumberOfInstallments] = React.useState<string>("10");
  const [downPayment, setDownPayment] = React.useState<string>("0");

  // Cálculos
  const purchaseAmount = parseFloat(purchaseValue) || 0;
  const installmentAmount = parseFloat(installmentValue) || 0;
  const installments = parseInt(numberOfInstallments) || 0;
  const downPaymentAmount = parseFloat(downPayment) || 0;

  const totalToPay = (installmentAmount * installments) + downPaymentAmount;
  const totalInterest = totalToPay - purchaseAmount;
  const interestPercentage = purchaseAmount > 0 ? (totalInterest / purchaseAmount) * 100 : 0;

  // Cálculo da taxa mensal usando a fórmula de juros compostos
  // (1 + i)^n = Total a Pagar / Valor à Vista
  const monthlyRate = purchaseAmount > 0 && installments > 0 
    ? (Math.pow(totalToPay / purchaseAmount, 1 / installments) - 1) * 100 
    : 0;

  // Taxa anual equivalente
  const annualRate = Math.pow(1 + (monthlyRate / 100), 12) - 1;
  const annualRatePercentage = annualRate * 100;

  // CET (Custo Efetivo Total) - aproximação
  const cet = annualRatePercentage;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-headline font-semibold">Calculadora de Juros Reais</h1>
          <p className="text-muted-foreground">Descubra a taxa de juros escondida no parcelamento</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário de Entrada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Dados da Compra
            </CardTitle>
            <CardDescription>
              Insira os valores para calcular os juros reais do parcelamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purchase-value">Valor à Vista (R$)</Label>
              <Input
                id="purchase-value"
                type="number"
                step="0.01"
                value={purchaseValue}
                onChange={(e) => setPurchaseValue(e.target.value)}
                placeholder="3590"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installment-value">Valor da Parcela (R$)</Label>
              <Input
                id="installment-value"
                type="number"
                step="0.01"
                value={installmentValue}
                onChange={(e) => setInstallmentValue(e.target.value)}
                placeholder="450"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installments">Nº Parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  value={numberOfInstallments}
                  onChange={(e) => setNumberOfInstallments(e.target.value)}
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="down-payment">Entrada (Opcional)</Label>
                <Input
                  id="down-payment"
                  type="number"
                  step="0.01"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                O cálculo é feito automaticamente conforme você edita os valores.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Resultado da Análise */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Resultado da Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Taxas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                <div className="text-sm text-slate-400 mb-1">TAXA MENSAL</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatPercentage(monthlyRate)}
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                <div className="text-sm text-slate-400 mb-1">TAXA ANUAL</div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatPercentage(annualRatePercentage)}
                </div>
              </div>
            </div>

            {/* Valores */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Valor à vista:</span>
                <span className="font-semibold">{formatCurrency(purchaseAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total a pagar (parcelado):</span>
                <span className="font-semibold">{formatCurrency(totalToPay)}</span>
              </div>
              <div className="flex justify-between p-3 bg-red-900/30 rounded-lg border border-red-800">
                <span className="text-red-200">Juros pagos (Custo extra):</span>
                <span className="font-bold text-red-300">{formatCurrency(totalInterest)}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 mt-4">
              *Cálculo baseado no método de equivalência de fluxos de caixa.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo da Operação */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Operação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Você paga</div>
              <div className="text-2xl font-bold">
                {installments}x de {formatCurrency(installmentAmount)}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Diferença Total</div>
              <div className="text-2xl font-bold text-red-600">
                +{formatPercentage(interestPercentage)}
              </div>
              <div className="text-sm text-muted-foreground">de acréscimo sobre o valor à vista</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Coeficiente CET (Estimado)</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPercentage(cet)} a.a.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Dicas Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Taxa alta?</strong> Compare com investimentos seguros como CDI ou Poupança antes de parcelar.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Alternativa:</strong> Se possível, negocie desconto no pagamento à vista.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}