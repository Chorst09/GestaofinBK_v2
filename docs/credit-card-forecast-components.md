# Componentes de Previsão de Gastos com Cartões de Crédito

Este documento descreve os novos componentes adicionados ao dashboard para visualização e análise de gastos com cartões de crédito.

## Componentes Criados

### 1. CreditCardForecastChart
**Localização:** `src/components/dashboard/credit-card-forecast-chart.tsx`

**Funcionalidade:**
- Exibe previsão de gastos com cartões de crédito nos próximos 6 meses
- Mostra dados por cartão (banco + bandeira)
- Utiliza dados reais para meses passados e previsões para meses futuros
- Gráfico de barras agrupadas por mês

**Dados utilizados:**
- Transações realizadas (para meses passados)
- Previsões cadastradas (para meses futuros)
- Informações dos cartões de crédito

### 2. CreditCardSpendingComparison
**Localização:** `src/components/dashboard/credit-card-spending-comparison.tsx`

**Funcionalidade:**
- Compara gastos previstos vs realizados nos últimos 6 meses
- Calcula precisão das previsões
- Mostra diferenças mensais (acima/abaixo do previsto)
- Gráfico combinado (barras + linha) com resumo detalhado

**Métricas exibidas:**
- Total previsto vs realizado
- Precisão das previsões (%)
- Diferenças mensais
- Detalhes por mês

### 3. CreditCardLimitsOverview
**Localização:** `src/components/dashboard/credit-card-limits-overview.tsx`

**Funcionalidade:**
- Monitora utilização dos limites dos cartões
- Calcula utilização atual + previsão do mês
- Sistema de alertas (seguro/atenção/alto risco)
- Barra de progresso visual para cada cartão

**Status de risco:**
- **Seguro:** < 70% do limite
- **Atenção:** 70-89% do limite  
- **Alto Risco:** ≥ 90% do limite

### 4. UpcomingCreditCardBills
**Localização:** `src/components/dashboard/upcoming-credit-card-bills.tsx`

**Funcionalidade:**
- Lista próximas faturas de cartão (próximos 3 meses)
- Calcula valores baseados em gastos atuais + previsões
- Alertas para faturas vencidas ou próximas do vencimento
- Considera o dia de vencimento configurado para cada cartão

**Status das faturas:**
- **Vencida:** Data de vencimento já passou
- **Próxima:** Vence em até 7 dias
- **Futura:** Vence em mais de 7 dias

## Integração no Dashboard

Os componentes foram integrados na página principal do dashboard (`src/app/dashboard/page.tsx`) na seguinte ordem:

1. **Grid 2 colunas:**
   - SpendingVisualization (existente)
   - CurrentBalanceChart (existente)
   - CreditCardForecastChart (novo)
   - CreditCardSpendingComparison (novo)
   - VehicleExpenseChart (existente)
   - VehicleMaintenanceChart (existente)

2. **Grid 2 colunas (seção adicional):**
   - CreditCardLimitsOverview (novo)
   - UpcomingCreditCardBills (novo)

## Dependências

Os componentes utilizam as seguintes bibliotecas e hooks existentes:

- **Hooks:** `useCreditCards`, `useForecasts`, `useTransactions`
- **UI Components:** Card, Badge, Progress, ChartContainer
- **Charts:** Recharts (BarChart, ComposedChart, Line, Bar)
- **Utilitários:** date-fns para manipulação de datas
- **Ícones:** Lucide React

## Configuração Necessária

Para que os gráficos funcionem corretamente, é necessário:

1. **Cartões cadastrados** com informações completas (banco, bandeira, dia de vencimento)
2. **Limites definidos** nos cartões (para o componente de limites)
3. **Previsões cadastradas** associadas aos cartões
4. **Transações registradas** com cartões associados

## Funcionalidades dos Gráficos

### Responsividade
- Todos os componentes são responsivos
- Adaptam-se a diferentes tamanhos de tela
- Grid layout ajustável

### Interatividade
- Tooltips informativos nos gráficos
- Cores consistentes com o tema da aplicação
- Indicadores visuais de status (cores, ícones, badges)

### Dados Dinâmicos
- Atualização automática baseada no mês selecionado no dashboard
- Cálculos em tempo real baseados nos dados disponíveis
- Tratamento de casos sem dados (mensagens informativas)

## Personalização

### Cores dos Gráficos
As cores seguem o padrão definido em `--chart-1` a `--chart-10` do tema CSS.

### Períodos de Análise
- **Previsão:** 6 meses futuros
- **Comparação:** 6 meses passados
- **Faturas:** 3 meses futuros
- **Limites:** Mês atual

### Formatação
- Valores monetários em Real (R$)
- Datas em português brasileiro
- Percentuais com 1 casa decimal
- Valores monetários com 2 casas decimais