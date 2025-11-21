# Exemplos de Uso - Módulo de Reformas

## 1. Exemplo Completo: Adicionar Despesa com Verificação de Estouro

```typescript
import { useRenovations } from '@/hooks/useRenovations';
import { useRenovationExpenses } from '@/hooks/useRenovationExpenses';
import { useTransactions } from '@/hooks/useTransactions';
import { addRenovationExpense } from '@/lib/renovation-helpers';
import { useToast } from '@/hooks/use-toast';

function AddExpenseExample() {
  const { getRenovationById } = useRenovations();
  const { addRenovationExpense: saveExpense, renovationExpenses } = useRenovationExpenses();
  const { addTransaction, transactions } = useTransactions();
  const { toast } = useToast();

  const handleAddExpense = () => {
    const renovationId = 'abc-123';
    const renovation = getRenovationById(renovationId);

    if (!renovation) {
      toast({ title: 'Erro', description: 'Reforma não encontrada' });
      return;
    }

    // Dados da transação
    const transactionData = {
      description: 'Compra de cimento e areia',
      amount: 850.00,
      type: 'expense' as const,
      category: 'Reforma',
      date: new Date().toISOString(),
      status: 'paid' as const,
    };

    // Dados da despesa de reforma
    const expenseData = {
      renovationId: renovation.id,
      stageId: 'stage-123', // Opcional
      category: 'materials' as const,
      supplierId: 'supplier-456', // Opcional
      notes: 'Material para fundação',
    };

    // Adicionar despesa com verificação de estouro
    const result = addRenovationExpense(
      renovation,
      expenseData,
      transactionData,
      addTransaction,
      saveExpense,
      () => renovationExpenses,
      () => transactions
    );

    if (result.success) {
      // Mostrar avisos se houver
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          toast({
            title: 'Atenção',
            description: warning,
            variant: 'destructive',
          });
        });
      } else {
        toast({
          title: 'Despesa adicionada!',
          description: 'A despesa foi registrada com sucesso.',
        });
      }
    } else {
      toast({
        title: 'Erro',
        description: result.errors.join('\n'),
        variant: 'destructive',
      });
    }
  };

  return (
    <button onClick={handleAddExpense}>
      Adicionar Despesa
    </button>
  );
}
```

---

## 2. Exemplo: Calcular Resumo da Reforma

```typescript
import { generateRenovationSummary } from '@/lib/renovation-helpers';

function RenovationSummaryExample() {
  const { getRenovationById } = useRenovations();
  const { renovationExpenses } = useRenovationExpenses();
  const { transactions } = useTransactions();

  const renovationId = 'abc-123';
  const renovation = getRenovationById(renovationId);

  if (!renovation) return null;

  const summary = generateRenovationSummary(
    renovation,
    renovationExpenses,
    transactions
  );

  return (
    <div>
      <h2>{summary.renovation.name}</h2>
      <p>Total Gasto: R$ {summary.totalSpent.toFixed(2)}</p>
      <p>Progresso: {summary.budgetProgress.toFixed(1)}%</p>
      <p>Saldo: R$ {summary.remaining.toFixed(2)}</p>
      
      {summary.isOverBudget && (
        <div className="alert alert-danger">
          ⚠️ Orçamento excedido!
        </div>
      )}
      
      {summary.isNearLimit && !summary.isOverBudget && (
        <div className="alert alert-warning">
          ⚠️ Atenção! Próximo do limite do orçamento
        </div>
      )}

      <h3>Gastos por Etapa</h3>
      {summary.spendingByStage.map(({ stage, spent, progress }) => (
        <div key={stage.id}>
          <p>{stage.name}: R$ {spent.toFixed(2)} ({progress.toFixed(1)}%)</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 3. Exemplo: Criar Reforma com Etapas

```typescript
import { useRenovations } from '@/hooks/useRenovations';

function CreateRenovationWithStages() {
  const { addRenovation, addStageToRenovation } = useRenovations();

  const handleCreate = () => {
    // 1. Criar a reforma
    const renovation = addRenovation({
      name: 'Reforma da Cozinha',
      description: 'Renovação completa da cozinha',
      totalBudget: 25000,
      startDate: new Date('2024-12-01').toISOString(),
      endDate: new Date('2025-02-28').toISOString(),
      status: 'planned',
    });

    // 2. Adicionar etapas
    const stages = [
      {
        renovationId: renovation.id,
        name: 'Demolição',
        description: 'Remoção de azulejos e armários antigos',
        budget: 3000,
        startDate: new Date('2024-12-01').toISOString(),
        endDate: new Date('2024-12-10').toISOString(),
        status: 'not_started' as const,
        order: 1,
      },
      {
        renovationId: renovation.id,
        name: 'Hidráulica',
        description: 'Instalação de novos encanamentos',
        budget: 5000,
        startDate: new Date('2024-12-11').toISOString(),
        endDate: new Date('2024-12-25').toISOString(),
        status: 'not_started' as const,
        order: 2,
      },
      {
        renovationId: renovation.id,
        name: 'Elétrica',
        description: 'Nova instalação elétrica',
        budget: 4000,
        startDate: new Date('2024-12-26').toISOString(),
        endDate: new Date('2025-01-10').toISOString(),
        status: 'not_started' as const,
        order: 3,
      },
      {
        renovationId: renovation.id,
        name: 'Acabamento',
        description: 'Pintura, azulejos e instalação de armários',
        budget: 13000,
        startDate: new Date('2025-01-11').toISOString(),
        endDate: new Date('2025-02-28').toISOString(),
        status: 'not_started' as const,
        order: 4,
      },
    ];

    stages.forEach(stage => {
      addStageToRenovation(renovation.id, stage);
    });

    console.log('Reforma criada com sucesso!', renovation);
  };

  return <button onClick={handleCreate}>Criar Reforma Completa</button>;
}
```

---

## 4. Exemplo: Atualizar Status de Etapa

```typescript
import { useRenovations } from '@/hooks/useRenovations';

function UpdateStageStatus() {
  const { getRenovationById, updateStage } = useRenovations();

  const handleCompleteStage = (renovationId: string, stageId: string) => {
    const renovation = getRenovationById(renovationId);
    if (!renovation) return;

    const stage = renovation.stages.find(s => s.id === stageId);
    if (!stage) return;

    // Marcar etapa como concluída
    updateStage(renovationId, {
      ...stage,
      status: 'completed',
    });

    console.log(`Etapa "${stage.name}" marcada como concluída!`);
  };

  return (
    <button onClick={() => handleCompleteStage('renovation-id', 'stage-id')}>
      Concluir Etapa
    </button>
  );
}
```

---

## 5. Exemplo: Listar Reformas Ativas

```typescript
import { useRenovations } from '@/hooks/useRenovations';

function ActiveRenovationsList() {
  const { getActiveRenovations } = useRenovations();

  const activeRenovations = getActiveRenovations();

  return (
    <div>
      <h2>Reformas Ativas</h2>
      {activeRenovations.length === 0 ? (
        <p>Nenhuma reforma ativa no momento</p>
      ) : (
        <ul>
          {activeRenovations.map(renovation => (
            <li key={renovation.id}>
              {renovation.name} - {renovation.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 6. Exemplo: Adicionar Fornecedor

```typescript
import { useSuppliers } from '@/hooks/useSuppliers';

function AddSupplierExample() {
  const { addSupplier } = useSuppliers();

  const handleAddSupplier = () => {
    const supplier = addSupplier({
      name: 'Construtora ABC',
      contact: '(11) 98765-4321',
      specialty: 'Pedreiro',
      notes: 'Trabalho de qualidade, pontual',
    });

    console.log('Fornecedor adicionado:', supplier);
  };

  return <button onClick={handleAddSupplier}>Adicionar Fornecedor</button>;
}
```

---

## 7. Exemplo: Adicionar Material

```typescript
import { useMaterials } from '@/hooks/useMaterials';

function AddMaterialExample() {
  const { addMaterial } = useMaterials();

  const handleAddMaterial = () => {
    const material = addMaterial({
      renovationId: 'renovation-123',
      stageId: 'stage-456', // Opcional
      name: 'Cimento CP-II',
      quantity: 50,
      unit: 'sacos',
      unitPrice: 35.00,
      supplierId: 'supplier-789', // Opcional
      isPurchased: false,
    });

    console.log('Material adicionado:', material);
    console.log('Preço total:', material.totalPrice); // 50 * 35 = 1750
  };

  return <button onClick={handleAddMaterial}>Adicionar Material</button>;
}
```

---

## 8. Exemplo: Calcular Gastos por Categoria

```typescript
import { calculateSpendingByCategory, renovationCategoryLabels } from '@/lib/renovation-helpers';

function SpendingByCategoryChart() {
  const { renovationExpenses } = useRenovationExpenses();
  const { transactions } = useTransactions();

  const renovationId = 'abc-123';
  const spendingByCategory = calculateSpendingByCategory(
    renovationId,
    renovationExpenses,
    transactions
  );

  return (
    <div>
      <h3>Gastos por Categoria</h3>
      {Object.entries(spendingByCategory).map(([category, amount]) => (
        <div key={category}>
          <span>{renovationCategoryLabels[category] || category}:</span>
          <span>R$ {amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 9. Exemplo: Verificar Estouro de Orçamento

```typescript
import { 
  calculateBudgetProgress, 
  isOverBudget, 
  isNearBudgetLimit 
} from '@/lib/renovation-helpers';

function BudgetStatusIndicator({ totalSpent, totalBudget }: { totalSpent: number; totalBudget: number }) {
  const progress = calculateBudgetProgress(totalSpent, totalBudget);
  const overBudget = isOverBudget(progress);
  const nearLimit = isNearBudgetLimit(progress);

  return (
    <div>
      <div className="progress-bar">
        <div style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
      
      {overBudget && (
        <div className="alert alert-danger">
          ⚠️ Orçamento excedido em R$ {(totalSpent - totalBudget).toFixed(2)}
        </div>
      )}
      
      {nearLimit && !overBudget && (
        <div className="alert alert-warning">
          ⚠️ Você já utilizou {progress.toFixed(1)}% do orçamento
        </div>
      )}
      
      {!overBudget && !nearLimit && (
        <div className="alert alert-success">
          ✅ Orçamento sob controle ({progress.toFixed(1)}%)
        </div>
      )}
    </div>
  );
}
```

---

## 10. Exemplo: Filtrar Materiais Não Comprados

```typescript
import { useMaterials } from '@/hooks/useMaterials';

function PendingMaterialsList() {
  const { getMaterialsByRenovation } = useMaterials();

  const renovationId = 'abc-123';
  const allMaterials = getMaterialsByRenovation(renovationId);
  const pendingMaterials = allMaterials.filter(m => !m.isPurchased);

  const totalPending = pendingMaterials.reduce((sum, m) => sum + m.totalPrice, 0);

  return (
    <div>
      <h3>Materiais Pendentes de Compra</h3>
      <p>Total a comprar: R$ {totalPending.toFixed(2)}</p>
      
      <ul>
        {pendingMaterials.map(material => (
          <li key={material.id}>
            {material.name} - {material.quantity} {material.unit} - R$ {material.totalPrice.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Cenário Completo: Fluxo de Trabalho

```typescript
// 1. Criar reforma
const renovation = addRenovation({
  name: 'Reforma do Banheiro',
  totalBudget: 15000,
  startDate: new Date('2024-12-01').toISOString(),
  endDate: new Date('2025-01-31').toISOString(),
  status: 'planned',
});

// 2. Adicionar etapas
addStageToRenovation(renovation.id, {
  renovationId: renovation.id,
  name: 'Demolição',
  budget: 2000,
  startDate: new Date('2024-12-01').toISOString(),
  endDate: new Date('2024-12-05').toISOString(),
  status: 'not_started',
  order: 1,
});

// 3. Adicionar fornecedor
const supplier = addSupplier({
  name: 'João Pedreiro',
  contact: '(11) 99999-9999',
  specialty: 'Pedreiro',
});

// 4. Adicionar material
const material = addMaterial({
  renovationId: renovation.id,
  name: 'Cimento',
  quantity: 20,
  unit: 'sacos',
  unitPrice: 35,
  supplierId: supplier.id,
  isPurchased: false,
});

// 5. Registrar despesa
const result = addRenovationExpense(
  renovation,
  {
    renovationId: renovation.id,
    category: 'materials',
    supplierId: supplier.id,
    notes: 'Compra de cimento',
  },
  {
    description: 'Cimento para fundação',
    amount: 700,
    type: 'expense',
    category: 'Reforma',
    date: new Date().toISOString(),
    status: 'paid',
  },
  addTransaction,
  saveExpense,
  () => renovationExpenses,
  () => transactions
);

// 6. Verificar alertas
if (result.warnings.length > 0) {
  console.log('Alertas:', result.warnings);
}

// 7. Gerar relatório
const summary = generateRenovationSummary(renovation, renovationExpenses, transactions);
console.log('Resumo:', summary);
```
