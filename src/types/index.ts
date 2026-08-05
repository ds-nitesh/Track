/** Shared domain types for Track expense tracker */

export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'upi'
  | 'bank'
  | 'wallet'
  | 'other';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type DateFilterPreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'custom';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  currency: string;
  photo: string | null;
  createdAt: string;
  fcmToken?: string | null;
}

export interface Category {
  id: string;
  uid: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault?: boolean;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  uid: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  paymentMethod: PaymentMethod;
  description: string;
  receiptImage: string | null;
  date: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  uid: string;
  categoryId: string | null;
  amount: number;
  month: number;
  year: number;
  createdAt?: string;
}

export interface AppSettings {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  currency: string;
  language: string;
  rememberMe: boolean;
  dailyReminder: boolean;
  budgetAlerts: boolean;
  monthlyReminder: boolean;
}

export interface TransactionFilters {
  search: string;
  type: TransactionType | 'all';
  categoryId: string | null;
  paymentMethod: PaymentMethod | null;
  datePreset: DateFilterPreset;
  startDate: string | null;
  endDate: string | null;
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

export interface DashboardStats {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savings: number;
  monthlyBudget: number;
  remainingBudget: number;
  budgetProgress: number;
}

export interface CategorySpend {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface ChartPoint {
  label: string;
  income: number;
  expense: number;
  savings: number;
}

export interface AuthFormValues {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  rememberMe?: boolean;
}

export interface TransactionFormValues {
  amount: string;
  type: TransactionType;
  categoryId: string;
  paymentMethod: PaymentMethod;
  description: string;
  date: Date;
  receiptImage: string | null;
}

export interface CategoryFormValues {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface BudgetFormValues {
  categoryId: string | null;
  amount: string;
  month: number;
  year: number;
}

export interface ProfileFormValues {
  name: string;
  currency: string;
  photo: string | null;
}

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  TransactionsTab: undefined;
  BudgetTab: undefined;
  ReportsTab: undefined;
  ProfileTab: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  AddTransaction: {transactionId?: string} | undefined;
  Categories: undefined;
  CategoryForm: {categoryId?: string} | undefined;
};

export type TransactionsStackParamList = {
  Transactions: undefined;
  TransactionDetail: {transactionId: string};
  AddTransaction: {transactionId?: string} | undefined;
};

export type BudgetStackParamList = {
  Budget: undefined;
  BudgetForm: {budgetId?: string} | undefined;
};

export type ReportsStackParamList = {
  Reports: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
};
