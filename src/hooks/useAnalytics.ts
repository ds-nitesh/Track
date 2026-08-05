import {useMemo} from 'react';
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';
import {useAppSelector} from '@/redux/hooks';
import {CategorySpend, ChartPoint, ReportPeriod} from '@/types';
import {getPeriodRange} from '@/utils/format';

export const useAnalytics = (period: ReportPeriod = 'monthly') => {
  const transactions = useAppSelector(s => s.transactions.items);
  const categories = useAppSelector(s => s.categories.items);
  const budgets = useAppSelector(s => s.budgets.items);

  return useMemo(() => {
    const range = getPeriodRange(period);
    const inRange = transactions.filter(t => {
      const d = parseISO(t.date);
      return d >= range.start && d <= range.end;
    });

    const income = inRange
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expense = inRange
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const expenseByCategoryMap = new Map<string, number>();
    inRange
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expenseByCategoryMap.set(
          t.categoryId,
          (expenseByCategoryMap.get(t.categoryId) ?? 0) + t.amount,
        );
      });

    const expenseByCategory: CategorySpend[] = Array.from(expenseByCategoryMap.entries())
      .map(([categoryId, amount]) => {
        const cat = categories.find(c => c.id === categoryId);
        return {
          categoryId,
          name: cat?.name ?? 'Unknown',
          color: cat?.color ?? '#64748B',
          icon: cat?.icon ?? 'help-circle',
          amount,
          percentage: expense > 0 ? (amount / expense) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const months = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), 5)),
      end: startOfMonth(new Date()),
    });

    const monthlyTrend: ChartPoint[] = months.map(monthDate => {
      const m = monthDate.getMonth() + 1;
      const y = monthDate.getFullYear();
      const monthTx = transactions.filter(t => {
        const d = parseISO(t.date);
        return d.getMonth() + 1 === m && d.getFullYear() === y;
      });
      const inc = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return {
        label: format(monthDate, 'MMM'),
        income: inc,
        expense: exp,
        savings: inc - exp,
      };
    });

    const dailySpend =
      period === 'weekly' || period === 'daily'
        ? eachDayOfInterval(range).map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const dayExpense = inRange
              .filter(t => t.type === 'expense' && format(parseISO(t.date), 'yyyy-MM-dd') === key)
              .reduce((s, t) => s + t.amount, 0);
            return {label: format(day, 'EEE'), value: dayExpense};
          })
        : monthlyTrend.map(m => ({label: m.label, value: m.expense}));

    const now = new Date();
    const monthBudgets = budgets.filter(
      b => b.month === now.getMonth() + 1 && b.year === now.getFullYear(),
    );

    return {
      income,
      expense,
      savings: income - expense,
      expenseByCategory,
      monthlyTrend,
      dailySpend,
      monthBudgets,
      count: inRange.length,
    };
  }, [transactions, categories, budgets, period]);
};
