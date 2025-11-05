# Componente Resumo Mensal de Previsões

## Descrição
O componente `PredictionsSummaryCard` é um dashboard mensal completo que integra e compara todas as previsões financeiras do sistema para um mês específico, fornecendo uma visão consolidada da situação financeira prevista mensal.

## Funcionalidades

### 📊 **Integração de Dados Mensal**
- **Previsões Formais**: Dados do sistema de previsões filtrados por mês
- **Previsões Personalizadas**: Dados do card de previsões customizado (sempre mensais)
- **Receitas Previstas**: Receitas cadastradas para o mês selecionado
- **Gastos com Cartões**: Identificação automática via categoria `isCreditCard` no mês
- **Navegação Mensal**: Controles para navegar entre meses

### 🎯 **Métricas Principais (Por Mês)**
1. **Receitas Previstas**: Total das receitas cadastradas no mês selecionado
2. **Gastos Formais**: Despesas do sistema de previsões no mês selecionado
3. **Gastos com Cartões**: Despesas específicas de cartão de crédito no mês
4. **Previsões Personalizadas**: Soma dos gastos semanais, final de semana, alimentação e combustível (sempre mensais)

### 🗓️ **Controles de Navegação**
- **Setas de Navegação**: Navegar entre meses anterior/próximo
- **Indicador do Mês**: Mostra o mês/ano atual selecionado
- **Botão "Mês Atual"**: Volta rapidamente para o mês corrente
- **Indicador de Dados**: Avisa quando não há previsões formais no mês

### 📈 **Análise Financeira**
- **Saldo Previsto**: Receitas - Total de Gastos
- **Comprometimento da Renda**: Percentual dos gastos sobre as receitas
- **Barra de Progresso**: Visualização do comprometimento
- **Status Visual**: Indicadores de situação favorável ou atenção necessária

### 🔍 **Detalhamento**
- **Breakdown das Previsões Personalizadas**:
  - Gastos Semanais (x4 semanas)
  - Final de Semana (x4 fins de semana)
  - Alimentação mensal
  - Combustível mensal
  - Percentual de cada categoria

### ⚠️ **Alertas Inteligentes**
- **Situação Favorável**: Saldo positivo previsto
- **Atenção Necessária**: Saldo apertado ou negativo
- **Recomendações**: Sugestões baseadas na análise

## Estrutura Visual

### 🎨 **Cards de Resumo**
- **Verde**: Receitas Previstas (positivo)
- **Azul**: Gastos Formais (neutro)
- **Roxo**: Gastos com Cartões (específico)
- **Laranja**: Previsões Personalizadas (customizado)

### 📱 **Layout Responsivo**
- **Desktop**: 4 colunas
- **Tablet**: 2 colunas
- **Mobile**: 1 coluna

## Integração com Sistema

### 🔗 **Hooks Utilizados**
- `useForecasts()`: Dados das previsões formais
- `localStorage`: Previsões personalizadas

### 🏷️ **Identificação de Categorias**
- Usa `getCategoryByName()` para identificar gastos com cartão
- Verifica `categoryConfig?.isCreditCard`
- Fallback para `item.creditCardId`

## Cálculos

### 💰 **Fórmulas**
```typescript
// Previsões Personalizadas
totalCustom = (weeklyExpenses * 4) + (weekendExpenses * 4) + foodExpenses + fuelExpenses

// Saldo Final
balance = totalIncome - (totalExpenses + totalCustom)

// Comprometimento
expenseRatio = (totalExpenses + totalCustom) / totalIncome * 100
```

### 📊 **Status**
- **Positivo**: `balance >= 0`
- **Negativo**: `balance < 0`
- **Crítico**: `expenseRatio > 100%`

## Localização
- **Componente**: `src/components/forecasts/predictions-summary-card.tsx`
- **Página**: Integrado na página `/forecasts` (primeiro card)
- **Posição**: Acima do card de previsões personalizadas

## Benefícios

### 👥 **Para o Usuário**
- Visão consolidada de todas as previsões
- Identificação rápida de problemas financeiros
- Comparação entre diferentes tipos de gastos
- Alertas proativos sobre a situação financeira

### 🔧 **Para o Sistema**
- Integração perfeita com dados existentes
- Reutilização de componentes UI
- Formatação consistente (padrão brasileiro)
- Performance otimizada com `useMemo`

## Tecnologias
- React com TypeScript
- Componentes UI do shadcn/ui
- Lucide React para ícones
- Formatação brasileira (`toLocaleString`)
- Progress bar para visualização
- localStorage para persistência

## Exemplo de Uso
O componente é automaticamente renderizado na página de previsões e se atualiza em tempo real conforme:
- Previsões formais são adicionadas/editadas
- Previsões personalizadas são modificadas
- Dados são carregados do localStorage

Fornece uma visão executiva completa da situação financeira prevista do usuário.