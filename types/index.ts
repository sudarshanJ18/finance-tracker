export const CATEGORIES = [
  'food',
  'transportation',
  'entertainment',
  'utilities',
  'shopping',
  'healthcare',
  'education',
  'other',
] as const;

export type Category = typeof CATEGORIES[number];

export interface Transaction {
  _id?: string;
  amount: number;
  date: string; // ISO string
  description: string;
  category: Category; // Changed from optional to required
  type: 'income' | 'expense';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}

export interface CategoryExpense {
  category: Category;
  amount: number;
  percentage: number;
}

export interface Budget {
  _id?: string;
  category: Category;
  amount: number;
  month: string;
  year: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BudgetComparison {
  category: Category;
  budgetAmount: number;
  actualAmount: number;
  difference: number;
  percentage: number;
  status: 'under' | 'over' | 'on-track';
}

export interface SpendingInsight {
  type: 'warning' | 'success' | 'info';
  category: Category;
  message: string;
  amount?: number;
  percentage?: number;
}

export interface CategorySummary {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
}

export interface DashboardSummary {
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  categoryBreakdown: CategorySummary[];
  recentTransactions: Transaction[];
}