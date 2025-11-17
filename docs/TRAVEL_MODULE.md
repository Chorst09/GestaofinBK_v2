# Módulo de Planejamento de Viagens e Lazer

## Visão Geral

O módulo de Planejamento de Viagens permite que você planeje, acompanhe e controle os gastos das suas viagens de forma organizada e eficiente.

## Funcionalidades

### 1. Criação de Eventos de Viagem

Cada viagem possui:
- **Nome**: Identificação da viagem (ex: "Férias em Paris")
- **Destino**: Local da viagem
- **Datas**: Data de início e término
- **Orçamento Total**: Valor total planejado para a viagem
- **Status**: Planejada, Em Andamento ou Concluída
- **Descrição**: Detalhes adicionais (opcional)

### 2. Orçamento por Categoria

Distribua o orçamento entre categorias específicas de viagem:
- **Hospedagem**: Hotéis, pousadas, Airbnb
- **Aéreo**: Passagens aéreas e transporte principal
- **Alimentação**: Refeições e bebidas
- **Passeios**: Atrações turísticas e atividades
- **Transporte**: Transporte local (táxi, metrô, aluguel de carro)
- **Compras**: Souvenirs e compras
- **Outros**: Outras despesas

### 3. Vinculação de Transações

- Ao criar ou editar uma transação, você pode vinculá-la a uma viagem específica
- Todas as despesas vinculadas são automaticamente contabilizadas no orçamento da viagem
- As transações vinculadas podem ser visualizadas diretamente da página da viagem

### 4. Acompanhamento em Tempo Real

Para cada viagem, você visualiza:
- **Orçamento Total vs. Gasto Total**
- **Saldo Restante** (ou valor excedido)
- **Progresso do Orçamento** (barra de progresso visual)
- **Orçado vs. Realizado por Categoria**
  - Valor gasto em cada categoria
  - Percentual utilizado
  - Saldo restante ou excedido por categoria

### 5. Alertas e Indicadores

- ⚠️ Alerta visual quando o orçamento é excedido
- Cores diferenciadas para saldo positivo (verde) e negativo (vermelho)
- Barras de progresso por categoria

## Como Usar

### Criar uma Nova Viagem

1. Acesse **Viagens e Lazer** no menu lateral
2. Clique em **Nova Viagem**
3. Preencha os dados:
   - Nome e destino da viagem
   - Datas de início e término
   - Orçamento total
   - Status (geralmente "Planejada" para novas viagens)
4. Adicione categorias de orçamento:
   - Clique em **Adicionar** para cada categoria
   - Selecione a categoria e defina o valor orçado
5. Clique em **Criar Viagem**

### Vincular Despesas à Viagem

1. Ao criar ou editar uma **Transação**
2. No formulário, selecione a viagem no campo **Viagem Associada**
3. A despesa será automaticamente contabilizada no orçamento da viagem

### Acompanhar o Progresso

1. Na página **Viagens e Lazer**, visualize todas as suas viagens
2. Cada card de viagem mostra:
   - Resumo financeiro (orçamento, gasto, saldo)
   - Barra de progresso geral
   - Detalhamento por categoria
3. Clique em **Ver Transações desta Viagem** para ver todas as despesas vinculadas

### Editar ou Excluir Viagem

- Use os ícones de **Editar** (lápis) ou **Excluir** (lixeira) no card da viagem
- Ao excluir uma viagem, as transações vinculadas não são excluídas, apenas desvinculadas

## Estrutura de Arquivos

```
src/
├── app/
│   └── travel/
│       └── page.tsx              # Página principal de viagens
├── components/
│   └── travel/
│       └── travel-form.tsx       # Formulário de criação/edição
├── hooks/
│   └── useTravelEvents.ts        # Hook para gerenciar viagens
└── lib/
    └── types.ts                  # Tipos TypeScript (TravelEvent, etc.)
```

## Tipos de Dados

### TravelEvent
```typescript
interface TravelEvent {
  id: string;
  name: string;
  destination: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  totalBudget: number;
  budgetByCategory: TravelBudgetItem[];
  description?: string;
  status: 'planned' | 'ongoing' | 'completed';
}
```

### TravelBudgetItem
```typescript
interface TravelBudgetItem {
  category: TravelCategory;
  budgetedAmount: number;
}
```

### TravelCategory
```typescript
type TravelCategory = 
  | 'hospedagem' 
  | 'aereo' 
  | 'alimentacao' 
  | 'passeios' 
  | 'transporte' 
  | 'compras' 
  | 'outros';
```

## Integração com Outros Módulos

- **Transações**: Campo `travelId` permite vincular despesas a viagens
- **Backup**: Viagens são incluídas no backup automático do Google Drive
- **Dashboard**: Pode ser expandido para incluir métricas de viagens

## Próximas Melhorias Sugeridas

1. Gráficos de pizza para visualização de gastos por categoria
2. Comparação entre múltiplas viagens
3. Exportação de relatório de viagem em PDF
4. Galeria de fotos da viagem
5. Checklist de itens para levar
6. Integração com calendário para lembretes
7. Conversão de moedas para viagens internacionais
8. Compartilhamento de viagem com outros usuários

## Notas Técnicas

- Os dados são armazenados localmente usando `localStorage`
- Sincronização automática com Google Drive (se configurado)
- Validação de formulários com Zod
- Interface responsiva para mobile e desktop
- Suporte a temas claro e escuro
