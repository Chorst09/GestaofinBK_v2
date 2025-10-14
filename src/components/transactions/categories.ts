
import type { LucideIcon } from 'lucide-react';
import { 
  Landmark, Utensils, ShoppingCart, HomeIcon, Bus, Shirt, Activity, Film, GraduationCap, Plane, Gift, HelpCircle, TrendingUp, TrendingDown, FileText, Briefcase, Settings, CreditCard as CreditCardIcon, Zap, ArrowDownCircle
} from 'lucide-react'; // Renomeado para evitar conflito

export interface CategoryConfig {
  name: string;
  icon: LucideIcon;
  type: 'income' | 'expense' | 'general';
  isCreditCard?: boolean; // Novo campo para identificar categorias de cartão de crédito
}

export const TRANSACTION_CATEGORIES: CategoryConfig[] = [
  // Expenses
  { name: 'Alimentação', icon: Utensils, type: 'expense' },
  { name: 'Supermercado', icon: ShoppingCart, type: 'expense' },
  { name: 'Moradia', icon: HomeIcon, type: 'expense' },
  { name: 'Transporte', icon: Bus, type: 'expense' },
  { name: 'Vestuário', icon: Shirt, type: 'expense' },
  { name: 'Contas e Serviços', icon: FileText, type: 'expense' },
  { name: 'Saúde', icon: Activity, type: 'expense' },
  { name: 'Lazer', icon: Film, type: 'expense' },
  { name: 'Educação', icon: GraduationCap, type: 'expense' },
  { name: 'Viagem', icon: Plane, type: 'expense' },
  { name: 'Impostos', icon: FileText, type: 'expense' }, // Ícone ajustado
  { name: 'Cartão de Crédito', icon: CreditCardIcon, type: 'expense', isCreditCard: true }, // Categoria específica
  { name: 'Investimentos (saída)', icon: Zap, type: 'expense' }, 
  { name: 'Débito em Conta Bancária', icon: ArrowDownCircle, type: 'expense' },
  { name: 'Outras Despesas', icon: TrendingDown, type: 'expense' },
  
  // Incomes
  { name: 'Salário', icon: Briefcase, type: 'income' },
  { name: 'Presentes', icon: Gift, type: 'income' },
  { name: 'Freelance', icon: Settings, type: 'income' },
  { name: 'Investimentos (entrada)', icon: Landmark, type: 'income' },
  { name: 'Saldo em Conta', icon: Landmark, type: 'income' },
  { name: 'Outras Receitas', icon: TrendingUp, type: 'income' },
  
  // General/Default
  { name: 'Não Categorizado', icon: HelpCircle, type: 'general' },
];

export const getCategoryByName = (categoryName?: string): CategoryConfig | undefined => {
  if (!categoryName) return undefined;
  return TRANSACTION_CATEGORIES.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
};

export const getCategoryIcon = (categoryName?: string): LucideIcon => {
  const category = getCategoryByName(categoryName);
  return category ? category.icon : HelpCircle;
};

export const getCategoriesByType = (type: 'income' | 'expense'): CategoryConfig[] => {
  return TRANSACTION_CATEGORIES.filter(cat => cat.type === type || cat.type === 'general');
};

export const CARD_BRANDS = [
  { value: 'Visa', label: 'Visa' },
  { value: 'Mastercard', label: 'Mastercard' },
  { value: 'Elo', label: 'Elo' },
  { value: 'American Express', label: 'American Express' },
  { value: 'Hipercard', label: 'Hipercard' },
  { value: 'Outra', label: 'Outra' },
];


