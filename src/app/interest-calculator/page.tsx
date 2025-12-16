"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, DollarSign, TrendingUp, Info, Percent } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InterestCalculatorPage() {
  // Estados para calculadora reversa (descobrir taxa)
  const [purchaseValue, setPurchaseValue] = React.useState<string>("3590");
  const [installmentValue, setInstallmentValue] = React.useState<string>("450");
  const [numberOfInstallments, setNumberOfInstallments] = React.useState<string>("10");
  const [downPayment, setDownPayment] = React.useState<string>("0");

  // Estados para calculadora personalizada (calcular parcela)
  const [customPurchaseValue, setCustomPurchaseValue] = React.useState<string>("10000");
  const [customInterestRate, setCustomInterestRate] = React.useState<string>("2.5");
  const [customInstallments, setCustomInstallments] = React.useState<string>("12");
  const [customDownPayment, setCustomDownPayment] = React.useState<string>("2000");

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

  // Cálculos para calculadora personalizada
  const customPurchaseAmount = parseFloat(customPurchaseValue) || 0;
  const customRate = parseFloat(customInterestRate) || 0;
  const customInstallmentsNum = parseInt(customInstallments) || 0;
  const customDownPaymentAmount = parseFloat(customDownPayment) || 0;

  // Valor a ser financiado (valor total - entrada)
  const financedAmount = customPurchaseAmount - customDownPaymentAmount;

  // Cálculo da parcela usando a fórmula de Price (juros compostos)
  // PMT = PV * [(1+i)^n * i] / [(1+i)^n - 1]
  const monthlyRateDecimal = customRate / 100;
  let customInstallmentAmount = 0;
  
  if (financedAmount > 0 && customRate > 0 && customInstallmentsNum > 0) {
    const factor = Math.pow(1 + monthlyRateDecimal, customInstallmentsNum);
    customInstallmentAmount = financedAmount * (factor * monthlyRateDecimal) / (factor - 1);
  } else if (financedAmount > 0 && customRate === 0 && customInstallmentsNum > 0) {
    // Sem juros - divisão simples
    customInstallmentAmount = financedAmount / customInstallmentsNum;
  }

  const customTotalToPay = (customInstallmentAmount * customInstallmentsNum) + customDownPaymentAmount;
  const customTotalInterest = customTotalToPay - customPurchaseAmount;

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

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Descobrir Taxa
          </TabsTrigger>
          <TabsTrigger value="calculate" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Calcular Parcela
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="calculate" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Formulário Personalizado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-blue-600" />
                  Calcular Parcela
                </CardTitle>
                <CardDescription>
                  Insira a taxa de juros, entrada e parcelas para calcular o valor mensal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-purchase-value">Valor Total do Produto (R$)</Label>
                  <Input
                    id="custom-purchase-value"
                    type="number"
                    step="0.01"
                    value={customPurchaseValue}
                    onChange={(e) => setCustomPurchaseValue(e.target.value)}
                    placeholder="10000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-interest-rate">Taxa de Juros Mensal (%)</Label>
                  <Input
                    id="custom-interest-rate"
                    type="number"
                    step="0.01"
                    value={customInterestRate}
                    onChange={(e) => setCustomInterestRate(e.target.value)}
                    placeholder="2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-installments">Nº Parcelas</Label>
                    <Input
                      id="custom-installments"
                      type="number"
                      value={customInstallments}
                      onChange={(e) => setCustomInstallments(e.target.value)}
                      placeholder="12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-down-payment">Entrada (R$)</Label>
                    <Input
                      id="custom-down-payment"
                      type="number"
                      step="0.01"
                      value={customDownPayment}
                      onChange={(e) => setCustomDownPayment(e.target.value)}
                      placeholder="2000"
                    />
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    O cálculo usa a Tabela Price (juros compostos) para determinar o valor da parcela.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Resultado Personalizado */}
            <Card className="bg-gradient-to-br from-blue-900 to-blue-800 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-400" />
                  Resultado do Financiamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Valor da Parcela */}
                <div className="bg-blue-800/50 p-6 rounded-lg text-center">
                  <div className="text-sm text-blue-300 mb-2">VALOR DA PARCELA</div>
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(customInstallmentAmount)}
                  </div>
                  <div className="text-sm text-blue-300 mt-1">
                    {customInstallmentsNum}x de {formatCurrency(customInstallmentAmount)}
                  </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Valor do produto:</span>
                    <span className="font-semibold">{formatCurrency(customPurchaseAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Entrada:</span>
                    <span className="font-semibold">{formatCurrency(customDownPaymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Valor financiado:</span>
                    <span className="font-semibold">{formatCurrency(financedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Total a pagar:</span>
                    <span className="font-semibold">{formatCurrency(customTotalToPay)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-red-900/30 rounded-lg border border-red-800">
                    <span className="text-red-200">Juros totais:</span>
                    <span className="font-bold text-red-300">{formatCurrency(customTotalInterest)}</span>
                  </div>
                </div>

                <div className="text-xs text-blue-300 mt-4">
                  *Cálculo baseado na Tabela Price (Sistema Francês de Amortização).
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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