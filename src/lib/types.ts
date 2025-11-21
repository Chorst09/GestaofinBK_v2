

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // ISO string format (e.g., "2023-10-26T00:00:00.000Z")
  cardBrand?: string; // Bandeira do cartão (opcional)
  creditCardId?: string; // ID do cartão de crédito associado, se aplicável
  bankAccountId?: string; // ID da conta bancária associada, se aplicável
  status: 'paid' | 'pending'; // Status da transação: pago ou pendente
  travelId?: string; // ID da viagem associada, se aplicável
  renovationId?: string; // ID da reforma associada, se aplicável
}

export type TransactionFormData = Omit<Transaction, 'id'>;

// For CSV import, expecting these headers
export interface CSVRow {
  Date: string; // Expects format that can be parsed by new Date() e.g. YYYY-MM-DD
  Description: string;
  Amount: string; // Will be parsed to number
  Type: string; // 'income' or 'expense' (case-insensitive)
  Category: string;
  CardBrand?: string; // Bandeira do cartão (opcional)
}

export interface ForecastItem {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // ISO string for the first day of the month of the forecast (e.g., "2024-08-01T00:00:00.000Z")
  creditCardId?: string; // ID do cartão de crédito associado, se aplicável
  explicitBankName?: string; // Nome do banco digitado manualmente, se creditCardId não for usado
  isFixed?: boolean; // Indica se a despesa é considerada fixa
  // For installments
  installmentId?: string;
  currentInstallment?: number;
  totalInstallments?: number;
}

export type ForecastItemFormData = Omit<ForecastItem, 'id' | 'installmentId'> & {
  isInstallment?: boolean; // Form helper to trigger installment creation logic
  isRecurring?: boolean; // Form helper to trigger recurring forecast creation logic
  recurringMonths?: number; // Number of months for recurring forecasts (12 or 24)
};


export interface CreditCard {
  id: string;
  bankName: string;
  cardFlag: string; // Bandeira (ex: Visa, Mastercard)
  dueDateDay: number; // Dia do vencimento da fatura (1-31)
  creditLimit?: number; // Limite do cartão (opcional)
  logoKey?: string;
  photoUrl?: string;
}

export type CreditCardFormData = Omit<CreditCard, 'id'>;

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'investment' | 'other'; // Tipo de conta
  balance: number; // Saldo atual
  overdraftLimit?: number; // Limite do cheque especial (opcional)
  logoKey?: string;
  photoUrl?: string;
}

export type BankAccountFormData = Omit<BankAccount, 'id'>;

export interface Vehicle {
  id: string;
  name: string; // e.g., "Meu Carro", "Moto do Trabalho"
  brand: string; // e.g., "Honda"
  model: string; // e.g., "Civic"
  year: number;
  plate?: string; // e.g., "ABC1D23"
  purchaseOdometer?: number; // KM da compra
  photoUrl?: string; // Data URI of the vehicle's photo
  logoKey?: string;
}
export type VehicleFormData = Omit<Vehicle, 'id'>;


export type FuelType = 'alcohol' | 'common_gasoline' | 'additive_gasoline' | 'premium_gasoline';

export interface VehicleExpense {
  id: string;
  vehicleId: string;
  date: string; // ISO string
  description: string;
  amount: number; // Always positive, represents an expense
  expenseType: 'fuel' | 'maintenance' | 'documents' | 'insurance' | 'other';
  odometer: number; // Quilometragem no momento da despesa
  liters?: number; // Litros abastecidos (usado para 'fuel')
  station?: string; // Nome do posto (usado para 'fuel')
  fuelType?: FuelType;
  maintenanceType?: string; // Categoria específica de manutenção. Ex: "Troca de Óleo"
  quantity?: number;
  fileDataUri?: string; // Base64 encoded file
  fileName?: string;
  fileType?: string;
}

export type VehicleExpenseFormData = Omit<VehicleExpense, 'id'>;

export interface ScheduledMaintenance {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  description: string;
  quantity?: number;
  amount?: number;
  nextServiceOdometer?: number;
  fileDataUri?: string;
  fileName?: string;
  fileType?: string;
}

export type ScheduledMaintenanceFormData = Omit<ScheduledMaintenance, 'id'>;

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
}
export type FinancialGoalFormData = Omit<FinancialGoal, 'id'>;

export interface GoalContribution {
  id: string;
  goalId: string;
  date: string; // ISO string
  amount: number; // Positive for contribution, negative for withdrawal
  description: string;
}
export type GoalContributionFormData = Omit<GoalContribution, 'id'>;

export interface CustomCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string; // The name of a lucide-react icon
}
export type CustomCategoryFormData = Omit<CustomCategory, 'id'>;

export interface FixedIncomeAsset {
  id: string;
  name: string;
  type: 'CDB' | 'LCI_LCA' | 'TESOURO_DIRETO' | 'OUTRO';
  investedAmount: number;
  currentValue: number;
  dueDate?: string;
}
export type FixedIncomeAssetFormData = Omit<FixedIncomeAsset, 'id'>;

export interface VariableIncomeAsset {
  id: string;
  ticker: string;
  type: 'ACAO' | 'FII' | 'BDR' | 'ETF' | 'CRIPTO';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
}
export type VariableIncomeAssetFormData = Omit<VariableIncomeAsset, 'id'>;

// Travel Planning Types
export type TravelCategory = 'hospedagem' | 'aereo' | 'alimentacao' | 'passeios' | 'transporte' | 'compras' | 'outros';

export interface TravelBudgetItem {
  category: TravelCategory;
  budgetedAmount: number;
}

export interface TravelRoutePoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  order: number;
  notes?: string;
  arrivalTime?: string; // ISO string
  departureTime?: string; // ISO string
}

export interface TravelRoute {
  id: string;
  travelId: string;
  name: string;
  points: TravelRoutePoint[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface TravelEvent {
  id: string;
  name: string;
  destination: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  totalBudget: number;
  budgetByCategory: TravelBudgetItem[];
  description?: string;
  status: 'planned' | 'ongoing' | 'completed';
  routes?: TravelRoute[];
  // Tipo de viagem e custos de transporte
  travelType?: 'car' | 'bus' | 'plane';
  transportCosts?: {
    vehicleId?: string;
    vehicleName?: string;
    origin?: string;
    destination?: string;
    distance?: string;
    duration?: string;
    fuelCost?: number;
    tollCost?: number;
    totalCost?: number;
    isRoundTrip?: boolean;
  };
}
export type TravelEventFormData = Omit<TravelEvent, 'id'>;
export type TravelRouteFormData = Omit<TravelRoute, 'id' | 'createdAt' | 'updatedAt'>;

// ---- Simulated Trip Route Types ----
export interface SimulatedTripRoute {
  id: string;
  vehicleId: string;
  vehicleName: string;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  fuelLiters: string;
  fuelCost: string;
  tollCost: string;
  totalCost: string;
  isRoundTrip: boolean;
  tollPlazas?: Array<{ name: string; value: number; route: string; concessionaire: string }>;
  createdAt: string;
}

// ---- Renovation Types ----

export type RenovationStatus = 'planned' | 'in_progress' | 'completed' | 'on_hold';
export type StageStatus = 'not_started' | 'in_progress' | 'completed';
export type RenovationExpenseCategory = 
  | 'demolition'
  | 'masonry'
  | 'plumbing'
  | 'electrical'
  | 'painting'
  | 'flooring'
  | 'carpentry'
  | 'finishing'
  | 'labor'
  | 'materials'
  | 'other';

export interface RenovationStage {
  id: string;
  renovationId: string;
  name: string;
  description?: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: StageStatus;
  order: number;
}

export interface Renovation {
  id: string;
  name: string;
  description?: string;
  totalBudget: number;
  safetyMarginPercent: number; // Margem de segurança (ex: 10%)
  adjustedBudget: number; // Orçamento com margem aplicada
  startDate: string;
  endDate: string;
  status: RenovationStatus;
  stages: RenovationStage[];
  createdAt: string;
  updatedAt: string;
}

export interface RenovationExpense {
  id: string;
  renovationId: string;
  stageId?: string;
  transactionId: string;
  category: RenovationExpenseCategory;
  supplierId?: string;
  invoiceUrl?: string;
  photoUrls?: string[];
  notes?: string;
  // Cronograma financeiro
  dueDate?: string; // Data de vencimento/pagamento
  isPaid: boolean;
  paidDate?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  specialty?: string;
  notes?: string;
}

export interface SupplierQuote {
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  quotedAt: string;
}

export interface MaterialAllocation {
  stageId: string;
  stageName: string;
  quantity: number;
  allocatedCost: number;
}

export interface Material {
  id: string;
  renovationId: string;
  stageId?: string; // Etapa principal (se não houver rateio)
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplierId?: string;
  isPurchased: boolean;
  purchaseDate?: string;
  // Novos campos para funcionalidades avançadas
  quotes?: SupplierQuote[]; // Cotações de múltiplos fornecedores
  allocations?: MaterialAllocation[]; // Rateio entre etapas
  isAllocated: boolean; // Se o material foi rateado
}

export type RenovationFormData = Omit<Renovation, 'id' | 'createdAt' | 'updatedAt' | 'stages'>;
export type RenovationStageFormData = Omit<RenovationStage, 'id'>;
export type RenovationExpenseFormData = Omit<RenovationExpense, 'id'>;
export type SupplierFormData = Omit<Supplier, 'id'>;
export type MaterialFormData = Omit<Material, 'id' | 'totalPrice'>;

// Cronograma Financeiro
export interface CashFlowEntry {
  id: string;
  renovationId: string;
  stageId?: string;
  description: string;
  amount: number;
  type: 'planned_expense' | 'actual_expense' | 'planned_payment' | 'actual_payment';
  plannedDate: string;
  actualDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  relatedExpenseId?: string;
}

export type CashFlowEntryFormData = Omit<CashFlowEntry, 'id'>;

// ---- Backup & Google Drive Types ----

export interface UserProfile {
    name: string;
    email: string;
    imageUrl: string;
}

export interface BackupData {
    transactions: Transaction[];
    bankAccounts: BankAccount[];
    creditCards: CreditCard[];
    forecastItems: ForecastItem[];
    vehicles: Vehicle[];
    vehicleExpenses: VehicleExpense[];
    scheduledMaintenances: ScheduledMaintenance[];
    financialGoals: FinancialGoal[];
    goalContributions: GoalContribution[];
    customCategories: CustomCategory[];
    fixedIncomeAssets: FixedIncomeAsset[];
    variableIncomeAssets: VariableIncomeAsset[];
    travelEvents: TravelEvent[];
    renovations: Renovation[];
    renovationExpenses: RenovationExpense[];
    suppliers: Supplier[];
    materials: Material[];
    cashFlowEntries: CashFlowEntry[];
}

// Define the shape of the context value
export interface DataBackupContextType {
  isLoggedIn: boolean;
  isInitializing: boolean;
  isSaving: boolean;
  isRestoring: boolean;
  isDataLoaded: boolean;
  login: (forceConsent?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  restoreFromBackup: () => Promise<void>;
  saveToDrive: (options?: { showSuccessToast?: boolean }) => Promise<void>;
  userProfile: UserProfile | null;
  lastBackupDate: Date | null;
  error: string | null;
  getLatestBackupData: () => BackupData;
  restoreFunctions: {
    setTransactions: (value: Transaction[] | ((val: Transaction[]) => Transaction[])) => void;
    setBankAccounts: (value: BankAccount[] | ((val: BankAccount[]) => BankAccount[])) => void;
    setCreditCards: (value: CreditCard[] | ((val: CreditCard[]) => CreditCard[])) => void;
    setForecastItems: (value: ForecastItem[] | ((val: ForecastItem[]) => ForecastItem[])) => void;
    setVehicles: (value: Vehicle[] | ((val: Vehicle[]) => Vehicle[])) => void;
    setVehicleExpenses: (value: VehicleExpense[] | ((val: VehicleExpense[]) => VehicleExpense[])) => void;
    setScheduledMaintenances: (value: ScheduledMaintenance[] | ((val: ScheduledMaintenance[]) => ScheduledMaintenance[])) => void;
    setFinancialGoals: (value: FinancialGoal[] | ((val: FinancialGoal[]) => FinancialGoal[])) => void;
    setGoalContributions: (value: GoalContribution[] | ((val: GoalContribution[]) => GoalContribution[])) => void;
    setCustomCategories: (value: CustomCategory[] | ((val: CustomCategory[]) => CustomCategory[])) => void;
    setFixedIncomeAssets: (value: FixedIncomeAsset[] | ((val: FixedIncomeAsset[]) => FixedIncomeAsset[])) => void;
    setVariableIncomeAssets: (value: VariableIncomeAsset[] | ((val: VariableIncomeAsset[]) => VariableIncomeAsset[])) => void;
    setTravelEvents: (value: TravelEvent[] | ((val: TravelEvent[]) => TravelEvent[])) => void;
  };
}

    