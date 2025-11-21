/**
 * Helpers para o módulo de Reformas
 * Contém a lógica de negócio principal
 */

import type { 
  Renovation, 
  RenovationExpense, 
  RenovationExpenseFormData,
  Transaction,
  TransactionFormData,
  RenovationStage,
  SupplierQuote,
  Material,
  MaterialAllocation
} from './types';

export interface AddExpenseResult {
  success: boolean;
  expense?: RenovationExpense;
  transaction?: Transaction;
  warnings: string[];
  errors: string[];
}

/**
 * Adiciona uma despesa à reforma e verifica estouro de orçamento
 * Esta é a função principal do módulo
 */
export function addRenovationExpense(
  renovation: Renovation,
  expenseData: RenovationExpenseFormData,
  transactionData: TransactionFormData,
  addTransaction: (data: TransactionFormData) => Transaction,
  addRenovationExpense: (data: RenovationExpenseFormData) => RenovationExpense,
  getAllExpenses: () => RenovationExpense[],
  getAllTransactions: () => Transaction[]
): AddExpenseResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // 1. Validar dados básicos
    if (!renovation) {
      errors.push('Reforma não encontrada');
      return { success: false, warnings, errors };
    }

    if (transactionData.amount <= 0) {
      errors.push('O valor da despesa deve ser maior que zero');
      return { success: false, warnings, errors };
    }

    // 2. Criar a transação geral primeiro
    const transaction = addTransaction({
      ...transactionData,
      type: 'expense',
      category: 'Reforma',
      renovationId: renovation.id,
    });

    // 3. Criar a despesa de reforma vinculada
    const renovationExpense = addRenovationExpense({
      ...expenseData,
      renovationId: renovation.id,
      transactionId: transaction.id,
    });

    // 4. Calcular total gasto na reforma
    const allExpenses = getAllExpenses();
    const allTransactions = getAllTransactions();
    const totalSpent = calculateTotalSpent(renovation.id, allExpenses, allTransactions);
    const budgetUsagePercent = (totalSpent / renovation.totalBudget) * 100;

    // 5. Verificar estouro de orçamento da reforma
    if (budgetUsagePercent >= 100) {
      const overspent = totalSpent - renovation.totalBudget;
      warnings.push(
        `⚠️ ORÇAMENTO EXCEDIDO! Você ultrapassou R$ ${overspent.toFixed(2)} do orçamento total da reforma.`
      );
    } else if (budgetUsagePercent >= 80) {
      warnings.push(
        `⚠️ Atenção! Você já utilizou ${budgetUsagePercent.toFixed(1)}% do orçamento da reforma.`
      );
    }

    // 6. Se houver etapa, verificar estouro da etapa também
    if (expenseData.stageId) {
      const stage = renovation.stages.find(s => s.id === expenseData.stageId);
      
      if (stage) {
        const stageSpent = calculateStageSpent(expenseData.stageId, allExpenses, allTransactions);
        const stageBudgetPercent = (stageSpent / stage.budget) * 100;

        if (stageBudgetPercent >= 100) {
          const stageOverspent = stageSpent - stage.budget;
          warnings.push(
            `⚠️ Etapa "${stage.name}" excedeu R$ ${stageOverspent.toFixed(2)} do orçamento previsto.`
          );
        } else if (stageBudgetPercent >= 80) {
          warnings.push(
            `⚠️ Etapa "${stage.name}" já utilizou ${stageBudgetPercent.toFixed(1)}% do orçamento.`
          );
        }
      }
    }

    return {
      success: true,
      expense: renovationExpense,
      transaction,
      warnings,
      errors,
    };

  } catch (error) {
    errors.push(`Erro ao adicionar despesa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return { success: false, warnings, errors };
  }
}

/**
 * Calcula o total gasto em uma reforma
 */
export function calculateTotalSpent(
  renovationId: string,
  expenses: RenovationExpense[],
  transactions: Transaction[]
): number {
  const renovationExpenses = expenses.filter(exp => exp.renovationId === renovationId);
  
  const total = renovationExpenses.reduce((sum, expense) => {
    const transaction = transactions.find(t => t.id === expense.transactionId);
    if (transaction) {
      return sum + Math.abs(transaction.amount);
    }
    return sum;
  }, 0);

  return total;
}

/**
 * Calcula o total gasto em uma etapa específica
 */
export function calculateStageSpent(
  stageId: string,
  expenses: RenovationExpense[],
  transactions: Transaction[]
): number {
  const stageExpenses = expenses.filter(exp => exp.stageId === stageId);
  
  const total = stageExpenses.reduce((sum, expense) => {
    const transaction = transactions.find(t => t.id === expense.transactionId);
    if (transaction) {
      return sum + Math.abs(transaction.amount);
    }
    return sum;
  }, 0);

  return total;
}

/**
 * Calcula o progresso do orçamento (0-100+)
 */
export function calculateBudgetProgress(
  totalSpent: number,
  totalBudget: number
): number {
  if (totalBudget === 0) return 0;
  return (totalSpent / totalBudget) * 100;
}

/**
 * Verifica se o orçamento está próximo do limite (>= 80%)
 */
export function isNearBudgetLimit(budgetProgress: number): boolean {
  return budgetProgress >= 80 && budgetProgress < 100;
}

/**
 * Verifica se o orçamento foi excedido (>= 100%)
 */
export function isOverBudget(budgetProgress: number): boolean {
  return budgetProgress >= 100;
}

/**
 * Calcula gastos por categoria de despesa
 */
export function calculateSpendingByCategory(
  renovationId: string,
  expenses: RenovationExpense[],
  transactions: Transaction[]
): Record<string, number> {
  const renovationExpenses = expenses.filter(exp => exp.renovationId === renovationId);
  
  const byCategory: Record<string, number> = {};

  renovationExpenses.forEach(expense => {
    const transaction = transactions.find(t => t.id === expense.transactionId);
    if (transaction) {
      const category = expense.category;
      byCategory[category] = (byCategory[category] || 0) + Math.abs(transaction.amount);
    }
  });

  return byCategory;
}

/**
 * Calcula gastos por etapa
 */
export function calculateSpendingByStage(
  renovation: Renovation,
  expenses: RenovationExpense[],
  transactions: Transaction[]
): Array<{ stage: RenovationStage; spent: number; progress: number }> {
  return renovation.stages.map(stage => {
    const spent = calculateStageSpent(stage.id, expenses, transactions);
    const progress = calculateBudgetProgress(spent, stage.budget);
    
    return {
      stage,
      spent,
      progress,
    };
  });
}

/**
 * Gera relatório resumido da reforma
 */
export function generateRenovationSummary(
  renovation: Renovation,
  expenses: RenovationExpense[],
  transactions: Transaction[]
) {
  const totalSpent = calculateTotalSpent(renovation.id, expenses, transactions);
  const budgetProgress = calculateBudgetProgress(totalSpent, renovation.totalBudget);
  const remaining = renovation.totalBudget - totalSpent;
  const spendingByCategory = calculateSpendingByCategory(renovation.id, expenses, transactions);
  const spendingByStage = calculateSpendingByStage(renovation, expenses, transactions);

  return {
    renovation,
    totalSpent,
    budgetProgress,
    remaining,
    isOverBudget: isOverBudget(budgetProgress),
    isNearLimit: isNearBudgetLimit(budgetProgress),
    spendingByCategory,
    spendingByStage,
    totalExpenses: expenses.filter(exp => exp.renovationId === renovation.id).length,
    completedStages: renovation.stages.filter(s => s.status === 'completed').length,
    totalStages: renovation.stages.length,
  };
}

/**
 * Labels em português para categorias de despesa
 */
export const renovationCategoryLabels: Record<string, string> = {
  demolition: 'Demolição',
  masonry: 'Alvenaria',
  plumbing: 'Hidráulica',
  electrical: 'Elétrica',
  painting: 'Pintura',
  flooring: 'Piso',
  carpentry: 'Marcenaria',
  finishing: 'Acabamento',
  labor: 'Mão de obra',
  materials: 'Materiais',
  other: 'Outros',
};

/**
 * Labels em português para status de reforma
 */
export const renovationStatusLabels: Record<string, string> = {
  planned: 'Planejada',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  on_hold: 'Pausada',
};

/**
 * Labels em português para status de etapa
 */
export const stageStatusLabels: Record<string, string> = {
  not_started: 'Não Iniciada',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
};

// ============================================
// FUNCIONALIDADES AVANÇADAS
// ============================================

/**
 * Calcula o orçamento ajustado com margem de segurança
 * @param baseBudget - Orçamento base
 * @param safetyMarginPercent - Margem de segurança em % (ex: 10)
 * @returns Orçamento ajustado
 */
export function calculateAdjustedBudget(
  baseBudget: number,
  safetyMarginPercent: number
): number {
  if (safetyMarginPercent < 0 || safetyMarginPercent > 100) {
    throw new Error('Margem de segurança deve estar entre 0 e 100%');
  }
  
  const marginAmount = baseBudget * (safetyMarginPercent / 100);
  return baseBudget + marginAmount;
}

/**
 * Calcula a margem de segurança em valor absoluto
 */
export function calculateSafetyMarginAmount(
  baseBudget: number,
  safetyMarginPercent: number
): number {
  return baseBudget * (safetyMarginPercent / 100);
}

/**
 * Recalcula o orçamento de uma reforma com nova margem
 */
export function recalculateRenovationBudget(
  renovation: Renovation,
  newSafetyMarginPercent: number
): Renovation {
  const adjustedBudget = calculateAdjustedBudget(
    renovation.totalBudget,
    newSafetyMarginPercent
  );

  return {
    ...renovation,
    safetyMarginPercent: newSafetyMarginPercent,
    adjustedBudget,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Compara cotações de fornecedores e retorna a melhor
 */
export function comparePriceQuotes(quotes: SupplierQuote[]): {
  bestQuote: SupplierQuote | null;
  worstQuote: SupplierQuote | null;
  averagePrice: number;
  savings: number; // Economia ao escolher a melhor
} {
  if (quotes.length === 0) {
    return {
      bestQuote: null,
      worstQuote: null,
      averagePrice: 0,
      savings: 0,
    };
  }

  const sortedByPrice = [...quotes].sort((a, b) => a.totalPrice - b.totalPrice);
  const bestQuote = sortedByPrice[0];
  const worstQuote = sortedByPrice[sortedByPrice.length - 1];
  const averagePrice = quotes.reduce((sum, q) => sum + q.totalPrice, 0) / quotes.length;
  const savings = worstQuote.totalPrice - bestQuote.totalPrice;

  return {
    bestQuote,
    worstQuote,
    averagePrice,
    savings,
  };
}

/**
 * Rateia um material entre múltiplas etapas
 */
export function allocateMaterialToStages(
  material: Material,
  allocations: Array<{ stageId: string; stageName: string; quantity: number }>
): MaterialAllocation[] {
  const totalAllocated = allocations.reduce((sum, a) => sum + a.quantity, 0);

  if (totalAllocated > material.quantity) {
    throw new Error(
      `Quantidade total alocada (${totalAllocated}) excede a quantidade disponível (${material.quantity})`
    );
  }

  return allocations.map(allocation => ({
    stageId: allocation.stageId,
    stageName: allocation.stageName,
    quantity: allocation.quantity,
    allocatedCost: (allocation.quantity / material.quantity) * material.totalPrice,
  }));
}

/**
 * Calcula o custo total alocado para uma etapa específica
 */
export function calculateStageAllocatedCost(
  stageId: string,
  materials: Material[]
): number {
  return materials.reduce((sum, material) => {
    if (material.isAllocated && material.allocations) {
      const allocation = material.allocations.find(a => a.stageId === stageId);
      return sum + (allocation?.allocatedCost || 0);
    } else if (material.stageId === stageId) {
      return sum + material.totalPrice;
    }
    return sum;
  }, 0);
}

/**
 * Gera cronograma financeiro (fluxo de caixa) da reforma
 */
export function generateCashFlowSchedule(
  renovation: Renovation,
  expenses: RenovationExpense[],
  transactions: Transaction[]
): Array<{
  date: string;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  cumulativePlanned: number;
  cumulativeActual: number;
  status: 'paid' | 'pending' | 'overdue';
}> {
  const renovationExpenses = expenses.filter(exp => exp.renovationId === renovation.id);
  
  // Agrupar por data
  const cashFlowMap = new Map<string, {
    plannedAmount: number;
    actualAmount: number;
    items: Array<{ description: string; amount: number; status: string }>;
  }>();

  renovationExpenses.forEach(expense => {
    const transaction = transactions.find(t => t.id === expense.transactionId);
    if (!transaction) return;

    const date = expense.dueDate || transaction.date;
    const dateKey = date.split('T')[0];

    if (!cashFlowMap.has(dateKey)) {
      cashFlowMap.set(dateKey, {
        plannedAmount: 0,
        actualAmount: 0,
        items: [],
      });
    }

    const entry = cashFlowMap.get(dateKey)!;
    const amount = Math.abs(transaction.amount);

    if (expense.isPaid) {
      entry.actualAmount += amount;
    } else {
      entry.plannedAmount += amount;
    }

    entry.items.push({
      description: transaction.description,
      amount,
      status: expense.isPaid ? 'paid' : 'pending',
    });
  });

  // Converter para array e ordenar por data
  const sortedEntries = Array.from(cashFlowMap.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

  // Calcular acumulados
  let cumulativePlanned = 0;
  let cumulativeActual = 0;

  return sortedEntries.map(([date, data]) => {
    cumulativePlanned += data.plannedAmount;
    cumulativeActual += data.actualAmount;

    const now = new Date();
    const entryDate = new Date(date);
    const isOverdue = entryDate < now && data.plannedAmount > 0;

    return {
      date,
      description: data.items.map(i => i.description).join(', '),
      plannedAmount: data.plannedAmount,
      actualAmount: data.actualAmount,
      cumulativePlanned,
      cumulativeActual,
      status: isOverdue ? 'overdue' : data.actualAmount > 0 ? 'paid' : 'pending',
    };
  });
}

/**
 * Verifica se há dinheiro suficiente para um pagamento futuro
 */
export function checkCashAvailability(
  plannedExpenseDate: string,
  plannedAmount: number,
  currentBalance: number,
  upcomingExpenses: Array<{ date: string; amount: number }>
): {
  hasEnoughCash: boolean;
  projectedBalance: number;
  shortfall: number;
  warning?: string;
} {
  const expenseDate = new Date(plannedExpenseDate);
  
  // Calcular despesas anteriores à data planejada
  const priorExpenses = upcomingExpenses
    .filter(exp => new Date(exp.date) < expenseDate)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const projectedBalance = currentBalance - priorExpenses - plannedAmount;
  const hasEnoughCash = projectedBalance >= 0;
  const shortfall = hasEnoughCash ? 0 : Math.abs(projectedBalance);

  let warning: string | undefined;
  if (!hasEnoughCash) {
    warning = `Saldo insuficiente! Faltarão R$ ${shortfall.toFixed(2)} na data ${new Date(plannedExpenseDate).toLocaleDateString('pt-BR')}`;
  } else if (projectedBalance < plannedAmount * 0.2) {
    warning = `Atenção! Saldo ficará baixo após este pagamento (R$ ${projectedBalance.toFixed(2)})`;
  }

  return {
    hasEnoughCash,
    projectedBalance,
    shortfall,
    warning,
  };
}

/**
 * Calcula métricas avançadas da reforma
 */
export function calculateAdvancedMetrics(
  renovation: Renovation,
  expenses: RenovationExpense[],
  transactions: Transaction[],
  materials: Material[]
) {
  const totalSpent = calculateTotalSpent(renovation.id, expenses, transactions);
  const budgetProgress = calculateBudgetProgress(totalSpent, renovation.adjustedBudget);
  const safetyMarginAmount = calculateSafetyMarginAmount(
    renovation.totalBudget,
    renovation.safetyMarginPercent
  );
  
  // Verificar se está dentro da margem de segurança
  const isWithinSafetyMargin = totalSpent <= renovation.adjustedBudget;
  const hasExceededBaseBudget = totalSpent > renovation.totalBudget;
  
  // Calcular custos de materiais alocados
  const totalMaterialCost = materials
    .filter(m => m.renovationId === renovation.id)
    .reduce((sum, m) => sum + m.totalPrice, 0);

  const totalMaterialPurchased = materials
    .filter(m => m.renovationId === renovation.id && m.isPurchased)
    .reduce((sum, m) => sum + m.totalPrice, 0);

  return {
    totalSpent,
    budgetProgress,
    safetyMarginAmount,
    isWithinSafetyMargin,
    hasExceededBaseBudget,
    remainingBudget: renovation.adjustedBudget - totalSpent,
    remainingBaseBudget: renovation.totalBudget - totalSpent,
    totalMaterialCost,
    totalMaterialPurchased,
    pendingMaterialCost: totalMaterialCost - totalMaterialPurchased,
  };
}
