import {CURRENCIES} from '@/constants';
import {
  DateFilterPreset,
  Transaction,
  TransactionFilters,
  TransactionType,
} from '@/types';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns';

export const getCurrencySymbol = (code: string): string =>
  CURRENCIES.find(c => c.code === code)?.symbol ?? code;

export const formatCurrency = (
  amount: number,
  currencyCode = 'INR',
  options?: {showSign?: boolean; type?: TransactionType},
): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (options?.showSign && options.type) {
    const sign = options.type === 'income' ? '+' : '-';
    return `${sign}${symbol}${formatted}`;
  }

  return `${symbol}${formatted}`;
};

export const formatDisplayDate = (iso: string): string => {
  try {
    return format(parseISO(iso), 'dd MMM yyyy');
  } catch {
    return iso;
  }
};

export const formatShortDate = (iso: string): string => {
  try {
    return format(parseISO(iso), 'dd MMM');
  } catch {
    return iso;
  }
};

export const toISODate = (date: Date): string => format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

export const getDateRangeForPreset = (
  preset: DateFilterPreset,
  startDate?: string | null,
  endDate?: string | null,
): {start: Date; end: Date} | null => {
  const now = new Date();

  switch (preset) {
    case 'today':
      return {start: startOfDay(now), end: endOfDay(now)};
    case 'yesterday': {
      const y = subDays(now, 1);
      return {start: startOfDay(y), end: endOfDay(y)};
    }
    case 'this_week':
      return {
        start: startOfWeek(now, {weekStartsOn: 1}),
        end: endOfWeek(now, {weekStartsOn: 1}),
      };
    case 'this_month':
      return {start: startOfMonth(now), end: endOfMonth(now)};
    case 'custom':
      if (startDate && endDate) {
        return {start: startOfDay(parseISO(startDate)), end: endOfDay(parseISO(endDate))};
      }
      return null;
    default:
      return null;
  }
};

export const filterTransactions = (
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] => {
  const range = getDateRangeForPreset(
    filters.datePreset,
    filters.startDate,
    filters.endDate,
  );
  const query = filters.search.trim().toLowerCase();

  let result = transactions.filter(tx => {
    if (filters.type !== 'all' && tx.type !== filters.type) {
      return false;
    }
    if (filters.categoryId && tx.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.paymentMethod && tx.paymentMethod !== filters.paymentMethod) {
      return false;
    }
    if (range) {
      const date = parseISO(tx.date);
      if (!isWithinInterval(date, range)) {
        return false;
      }
    }
    if (query) {
      const haystack = `${tx.description} ${tx.amount} ${tx.paymentMethod}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });

  result = [...result].sort((a, b) => {
    const aVal = filters.sortBy === 'amount' ? a.amount : parseISO(a.date).getTime();
    const bVal = filters.sortBy === 'amount' ? b.amount : parseISO(b.date).getTime();
    return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return result;
};

export const sumByType = (
  transactions: Transaction[],
  type: TransactionType,
): number =>
  transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);

export const calcBalance = (transactions: Transaction[]): number =>
  sumByType(transactions, 'income') - sumByType(transactions, 'expense');

export const getMonthTransactions = (
  transactions: Transaction[],
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear(),
): Transaction[] =>
  transactions.filter(t => {
    const d = parseISO(t.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const getPeriodRange = (
  period: 'daily' | 'weekly' | 'monthly' | 'yearly',
): {start: Date; end: Date} => {
  const now = new Date();
  switch (period) {
    case 'daily':
      return {start: startOfDay(now), end: endOfDay(now)};
    case 'weekly':
      return {
        start: startOfWeek(now, {weekStartsOn: 1}),
        end: endOfWeek(now, {weekStartsOn: 1}),
      };
    case 'yearly':
      return {start: startOfYear(now), end: endOfYear(now)};
    case 'monthly':
    default:
      return {start: startOfMonth(now), end: endOfMonth(now)};
  }
};

export const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });
