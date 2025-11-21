# Módulo de Planejamento de Reformas

## 1. User Stories

### US-01: Criar Nova Reforma
**Como** usuário  
**Quero** criar um novo projeto de reforma  
**Para** planejar e controlar os custos de uma obra doméstica

**Critérios de Aceitação:**
- Posso definir nome da reforma (ex: "Reforma do Banheiro")
- Posso definir orçamento total previsto
- Posso definir data de início e término estimadas
- Posso adicionar uma descrição opcional
- Posso definir o status inicial (Planejada, Em Andamento, Concluída)

### US-02: Gerenciar Etapas da Reforma
**Como** usuário  
**Quero** dividir a reforma em etapas  
**Para** organizar melhor o cronograma e orçamento

**Critérios de Aceitação:**
- Posso criar múltiplas etapas (ex: Demolição, Hidráulica, Elétrica, Acabamento)
- Cada etapa tem orçamento próprio
- Cada etapa tem data de início e término
- Posso marcar etapas como concluídas
- A soma dos orçamentos das etapas não pode exceder o orçamento total

### US-03: Adicionar Despesas à Reforma
**Como** usuário  
**Quero** registrar despesas relacionadas à reforma  
**Para** acompanhar o quanto já gastei

**Critérios de Aceitação:**
- Posso vincular uma despesa a uma reforma específica
- Posso vincular uma despesa a uma etapa específica
- A despesa é automaticamente contabilizada nas transações gerais
- Posso adicionar fornecedor, nota fiscal e fotos
- Recebo alerta se o gasto ultrapassar o orçamento

### US-04: Gerenciar Fornecedores e Materiais
**Como** usuário  
**Quero** cadastrar fornecedores e materiais  
**Para** organizar orçamentos e compras

**Critérios de Aceitação:**
- Posso cadastrar fornecedores com nome, contato e especialidade
- Posso cadastrar materiais com nome, quantidade e preço unitário
- Posso vincular materiais a etapas específicas
- Posso marcar materiais como comprados

### US-05: Visualizar Dashboard da Reforma
**Como** usuário  
**Quero** ver um resumo visual da reforma  
**Para** entender rapidamente o status do projeto

**Critérios de Aceitação:**
- Vejo orçamento previsto vs. realizado
- Vejo progresso por etapa
- Vejo gráfico de burn-down do orçamento
- Vejo alertas de estouro de orçamento
- Vejo timeline das etapas

### US-06: Receber Alertas de Estouro
**Como** usuário  
**Quero** ser alertado quando ultrapassar o orçamento  
**Para** tomar decisões rápidas

**Critérios de Aceitação:**
- Recebo alerta quando atingir 80% do orçamento
- Recebo alerta quando ultrapassar 100% do orçamento
- Vejo indicador visual de estouro no dashboard
- Posso ver quanto excedi o orçamento

### US-07: Upload de Documentos
**Como** usuário  
**Quero** anexar notas fiscais e fotos  
**Para** manter registro organizado da reforma

**Critérios de Aceitação:**
- Posso fazer upload de PDFs (notas fiscais)
- Posso fazer upload de imagens (fotos do progresso)
- Posso visualizar os documentos anexados
- Posso excluir documentos

---

## 2. Modelo de Dados (TypeScript)

### Tipos e Interfaces

```typescript
// Status da reforma
export type RenovationStatus = 'planned' | 'in_progress' | 'completed' | 'on_hold';

// Status da etapa
export type StageStatus = 'not_started' | 'in_progress' | 'completed';

// Categoria de despesa de reforma
export type RenovationExpenseCategory = 
  | 'demolition'      // Demolição
  | 'masonry'         // Alvenaria
  | 'plumbing'        // Hidráulica
  | 'electrical'      // Elétrica
  | 'painting'        // Pintura
  | 'flooring'        // Piso
  | 'carpentry'       // Marcenaria
  | 'finishing'       // Acabamento
  | 'labor'           // Mão de obra
  | 'materials'       // Materiais
  | 'other';          // Outros

// Reforma principal
export interface Renovation {
  id: string;
  name: string;                    // Ex: "Reforma do Banheiro"
  description?: string;
  totalBudget: number;             // Orçamento total previsto
  startDate: string;               // ISO string
  endDate: string;                 // ISO string
  status: RenovationStatus;
  stages: RenovationStage[];       // Etapas da reforma
  createdAt: string;               // ISO string
  updatedAt: string;               // ISO string
}

// Etapa da reforma
export interface RenovationStage {
  id: string;
  renovationId: string;
  name: string;                    // Ex: "Demolição", "Hidráulica"
  description?: string;
  budget: number;                  // Orçamento desta etapa
  startDate: string;               // ISO string
  endDate: string;                 // ISO string
  status: StageStatus;
  order: number;                   // Ordem de execução
}

// Despesa da reforma (vinculada a Transaction)
export interface RenovationExpense {
  id: string;
  renovationId: string;
  stageId?: string;                // Opcional: vincular a uma etapa
  transactionId: string;           // Referência à transação geral
  category: RenovationExpenseCategory;
  supplierId?: string;             // Opcional: fornecedor
  invoiceUrl?: string;             // URL da nota fiscal (base64 ou cloud)
  photoUrls?: string[];            // URLs de fotos
  notes?: string;
}

// Fornecedor
export interface Supplier {
  id: string;
  name: string;
  contact?: string;                // Telefone ou email
  specialty?: string;              // Ex: "Pedreiro", "Eletricista"
  notes?: string;
}

// Material
export interface Material {
  id: string;
  renovationId: string;
  stageId?: string;
  name: string;                    // Ex: "Cimento", "Tinta"
  quantity: number;
  unit: string;                    // Ex: "kg", "litros", "unidades"
  unitPrice: number;
  totalPrice: number;              // quantity * unitPrice
  supplierId?: string;
  isPurchased: boolean;
  purchaseDate?: string;           // ISO string
}

// Form Data Types
export type RenovationFormData = Omit<Renovation, 'id' | 'createdAt' | 'updatedAt' | 'stages'>;
export type RenovationStageFormData = Omit<RenovationStage, 'id'>;
export type RenovationExpenseFormData = Omit<RenovationExpense, 'id'>;
export type SupplierFormData = Omit<Supplier, 'id'>;
export type MaterialFormData = Omit<Material, 'id' | 'totalPrice'>;
```

---

## 3. Estrutura de Telas

### 3.1 Tela Principal - Lista de Reformas
**Rota:** `/renovations`

**Componentes:**
- Header com botão "Nova Reforma"
- Cards de reformas com:
  - Nome e status
  - Progresso visual (barra)
  - Orçamento previsto vs. realizado
  - Indicador de estouro (se aplicável)
  - Botões: Ver Detalhes, Editar, Excluir

### 3.2 Tela de Detalhes da Reforma
**Rota:** `/renovations/[id]`

**Componentes:**
- **Header:** Nome, status, datas
- **Resumo Financeiro:**
  - Orçamento Total
  - Total Gasto
  - Saldo Restante
  - Progresso (%)
- **Gráfico Burn-down:** Mostra evolução dos gastos ao longo do tempo
- **Timeline de Etapas:** Visualização das etapas com status
- **Lista de Despesas Recentes**
- **Botões de Ação:**
  - Adicionar Despesa
  - Gerenciar Etapas
  - Gerenciar Fornecedores
  - Ver Materiais

### 3.3 Tela de Gerenciamento de Etapas
**Rota:** `/renovations/[id]/stages`

**Componentes:**
- Lista de etapas ordenadas
- Para cada etapa:
  - Nome, datas, orçamento
  - Status e progresso
  - Despesas vinculadas
- Botão "Nova Etapa"
- Drag-and-drop para reordenar

### 3.4 Tela de Fornecedores
**Rota:** `/renovations/[id]/suppliers`

**Componentes:**
- Lista de fornecedores
- Informações de contato
- Total gasto por fornecedor
- Botão "Novo Fornecedor"

### 3.5 Tela de Materiais
**Rota:** `/renovations/[id]/materials`

**Componentes:**
- Lista de materiais
- Status: Comprado / Pendente
- Orçamento vs. Realizado
- Botão "Novo Material"

---

## 4. Lógica de Negócio Principal

### 4.1 Adicionar Despesa à Reforma

```typescript
// Pseudocódigo da função principal
function addRenovationExpense(
  renovationId: string,
  expenseData: RenovationExpenseFormData,
  transactionData: TransactionFormData
): { success: boolean; warning?: string; expense?: RenovationExpense } {
  
  // 1. Criar a transação geral primeiro
  const transaction = addTransaction({
    ...transactionData,
    type: 'expense',
    category: 'Reforma', // Categoria especial
  });
  
  // 2. Criar a despesa de reforma vinculada
  const renovationExpense: RenovationExpense = {
    id: generateId(),
    renovationId,
    transactionId: transaction.id,
    ...expenseData,
  };
  
  // 3. Salvar despesa
  saveRenovationExpense(renovationExpense);
  
  // 4. Verificar estouro de orçamento
  const renovation = getRenovationById(renovationId);
  const totalSpent = calculateTotalSpent(renovationId);
  const budgetUsagePercent = (totalSpent / renovation.totalBudget) * 100;
  
  let warning: string | undefined;
  
  if (budgetUsagePercent >= 100) {
    const overspent = totalSpent - renovation.totalBudget;
    warning = `⚠️ ORÇAMENTO EXCEDIDO! Você ultrapassou R$ ${overspent.toFixed(2)}`;
  } else if (budgetUsagePercent >= 80) {
    warning = `⚠️ Atenção! Você já utilizou ${budgetUsagePercent.toFixed(1)}% do orçamento.`;
  }
  
  // 5. Se houver etapa, verificar estouro da etapa também
  if (expenseData.stageId) {
    const stage = getStageById(expenseData.stageId);
    const stageSpent = calculateStageSpent(expenseData.stageId);
    const stageBudgetPercent = (stageSpent / stage.budget) * 100;
    
    if (stageBudgetPercent >= 100) {
      const stageOverspent = stageSpent - stage.budget;
      warning = (warning || '') + `\n⚠️ Etapa "${stage.name}" excedeu R$ ${stageOverspent.toFixed(2)}`;
    }
  }
  
  return {
    success: true,
    warning,
    expense: renovationExpense,
  };
}

// Função auxiliar: calcular total gasto
function calculateTotalSpent(renovationId: string): number {
  const expenses = getRenovationExpenses(renovationId);
  const transactions = expenses.map(exp => getTransactionById(exp.transactionId));
  return transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

// Função auxiliar: calcular gasto por etapa
function calculateStageSpent(stageId: string): number {
  const expenses = getRenovationExpenses().filter(exp => exp.stageId === stageId);
  const transactions = expenses.map(exp => getTransactionById(exp.transactionId));
  return transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
}
```

---

## 5. Integração com Sistema Existente

### 5.1 Impacto nas Transações
- Toda despesa de reforma cria uma `Transaction` com `category: 'Reforma'`
- A transação impacta o saldo geral do usuário
- Campo adicional: `renovationId?: string` na interface `Transaction`

### 5.2 Impacto no Dashboard Principal
- Adicionar card "Reformas Ativas"
- Mostrar total gasto em reformas no mês
- Alertas de estouro de orçamento

### 5.3 Backup e Sincronização
- Adicionar aos dados de backup:
  - `renovations: Renovation[]`
  - `renovationExpenses: RenovationExpense[]`
  - `suppliers: Supplier[]`
  - `materials: Material[]`

---

## 6. Componentes UI Sugeridos

### 6.1 RenovationCard
- Exibe resumo da reforma
- Barra de progresso
- Badge de status
- Indicador de alerta

### 6.2 RenovationBurndownChart
- Gráfico de linha mostrando:
  - Orçamento planejado (linha reta)
  - Gastos reais acumulados (linha curva)

### 6.3 StageTimeline
- Timeline horizontal ou vertical
- Cada etapa com:
  - Ícone de status
  - Nome e datas
  - Progresso

### 6.4 BudgetAlert
- Toast ou banner de alerta
- Cores: amarelo (80%), vermelho (100%+)

---

## 7. Fluxo de Navegação

```
/renovations (Lista)
  ├─ /renovations/new (Criar)
  ├─ /renovations/[id] (Detalhes)
  │   ├─ /renovations/[id]/stages (Etapas)
  │   ├─ /renovations/[id]/suppliers (Fornecedores)
  │   ├─ /renovations/[id]/materials (Materiais)
  │   └─ /renovations/[id]/expenses (Despesas)
  └─ /renovations/[id]/edit (Editar)
```

---

## 8. Melhorias Futuras (V2)

- Integração com calendário para lembretes
- Comparação de orçamentos de fornecedores
- Geração de relatório PDF
- Compartilhamento com outros usuários (família)
- Integração com IA para sugestão de custos
- Modo offline com sincronização
