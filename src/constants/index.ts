import {Category, PaymentMethod} from '@/types';

export const APP_NAME = 'Spendly';
export const APP_TAGLINE = 'Smart expense tracking';

export const CURRENCIES = [
  {code: 'INR', symbol: '₹', name: 'Indian Rupee'},
  {code: 'USD', symbol: '$', name: 'US Dollar'},
  {code: 'EUR', symbol: '€', name: 'Euro'},
  {code: 'GBP', symbol: '£', name: 'British Pound'},
  {code: 'JPY', symbol: '¥', name: 'Japanese Yen'},
  {code: 'AUD', symbol: 'A$', name: 'Australian Dollar'},
  {code: 'CAD', symbol: 'C$', name: 'Canadian Dollar'},
  {code: 'SGD', symbol: 'S$', name: 'Singapore Dollar'},
] as const;

export const PAYMENT_METHODS: {value: PaymentMethod; label: string; icon: string}[] = [
  {value: 'cash', label: 'Cash', icon: 'cash'},
  {value: 'card', label: 'Card', icon: 'credit-card'},
  {value: 'upi', label: 'UPI', icon: 'qrcode'},
  {value: 'bank', label: 'Bank Transfer', icon: 'bank'},
  {value: 'wallet', label: 'Wallet', icon: 'wallet'},
  {value: 'other', label: 'Other', icon: 'dots-horizontal'},
];

export const CATEGORY_COLORS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#84CC16',
  '#22C55E',
  '#14B8A6',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#A855F7',
  '#EC4899',
  '#F43F5E',
  '#64748B',
];

export const CATEGORY_ICONS = [
  'food',
  'shopping',
  'airplane',
  'file-document',
  'medical-bag',
  'cash-plus',
  'chart-line',
  'gift',
  'home',
  'car',
  'school',
  'gamepad-variant',
  'coffee',
  'dumbbell',
  'phone',
  'wifi',
  'music',
  'paw',
];

/** Seed categories created for every new user */
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'uid'>[] = [
  {name: 'Food', icon: 'food', color: '#F97316', type: 'expense', isDefault: true},
  {name: 'Shopping', icon: 'shopping', color: '#EC4899', type: 'expense', isDefault: true},
  {name: 'Travel', icon: 'airplane', color: '#3B82F6', type: 'expense', isDefault: true},
  {name: 'Bills', icon: 'file-document', color: '#6366F1', type: 'expense', isDefault: true},
  {name: 'Medical', icon: 'medical-bag', color: '#EF4444', type: 'expense', isDefault: true},
  {name: 'Salary', icon: 'cash-plus', color: '#22C55E', type: 'income', isDefault: true},
  {name: 'Investment', icon: 'chart-line', color: '#14B8A6', type: 'income', isDefault: true},
  {name: 'Gift', icon: 'gift', color: '#A855F7', type: 'income', isDefault: true},
];

export const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  BUDGETS: 'budgets',
} as const;

export const STORAGE_PATHS = {
  RECEIPTS: 'receipts',
  PROFILES: 'profiles',
} as const;

export const PAGE_SIZE = 20;

export const LANGUAGES = [
  {code: 'en', label: 'English'},
  {code: 'hi', label: 'Hindi'},
  {code: 'es', label: 'Spanish'},
  {code: 'fr', label: 'French'},
] as const;

export const MMKV_KEYS = {
  REMEMBER_ME: 'remember_me',
  REMEMBERED_EMAIL: 'remembered_email',
  THEME: 'theme',
  SETTINGS: 'settings',
} as const;
