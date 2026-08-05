import {Share} from 'react-native';
import {formatCurrency, formatDisplayDate} from '@/utils/format';
import {Category, Transaction} from '@/types';

export const exportSummary = async (params: {
  periodLabel: string;
  income: number;
  expense: number;
  savings: number;
  currency: string;
  transactions: Transaction[];
  categories: Category[];
}): Promise<void> => {
  const catName = (id: string) =>
    params.categories.find(c => c.id === id)?.name ?? 'Unknown';

  const lines = [
    `Track — ${params.periodLabel} Summary`,
    `Income: ${formatCurrency(params.income, params.currency)}`,
    `Expense: ${formatCurrency(params.expense, params.currency)}`,
    `Savings: ${formatCurrency(params.savings, params.currency)}`,
    '',
    'Transactions:',
    ...params.transactions.slice(0, 50).map(
      t =>
        `${formatDisplayDate(t.date)} | ${t.type.toUpperCase()} | ${formatCurrency(
          t.amount,
          params.currency,
        )} | ${catName(t.categoryId)} | ${t.description || '-'}`,
    ),
  ];

  await Share.share({
    title: 'Track Report',
    message: lines.join('\n'),
  });
};
