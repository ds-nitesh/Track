import React, { useMemo } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BudgetProgressCard, EmptyState, GradientHeader } from '@/components';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { removeBudget } from '@/redux/slices/budgetsSlice';
import { AppDispatch } from '@/redux/store';
import { BudgetStackParamList } from '@/types';
import { getMonthTransactions, sumByType } from '@/utils/format';
import { toast } from '@/services/toast';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<BudgetStackParamList, 'Budget'>;

export const deleteBudgetConfirm = (dispatch: AppDispatch, id: string) => {
  Alert.alert('Delete budget', 'Remove this budget?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        await dispatch(removeBudget(id));
        toast.success('Budget deleted');
      },
    },
  ]);
};

export const BudgetScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const budgets = useAppSelector(s => s.budgets.items);
  const transactions = useAppSelector(s => s.transactions.items);
  const categories = useAppSelector(s => s.categories.items);
  const currency = useAppSelector(s => s.profile.data?.currency ?? s.settings.currency);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const monthBudgets = useMemo(
    () => budgets.filter(b => b.month === month && b.year === year),
    [budgets, month, year],
  );

  const monthTx = useMemo(
    () => getMonthTransactions(transactions, month, year),
    [transactions, month, year],
  );

  const overallBudget = monthBudgets
    .filter(b => !b.categoryId)
    .reduce((s, b) => s + b.amount, 0);
  const overallSpent = sumByType(monthTx, 'expense');

  const rows = monthBudgets.map(budget => {
    const cat = categories.find(c => c.id === budget.categoryId);
    const spent = budget.categoryId
      ? monthTx
        .filter(t => t.type === 'expense' && t.categoryId === budget.categoryId)
        .reduce((s, t) => s + t.amount, 0)
      : overallSpent;
    return {
      budget,
      title: cat?.name ?? 'Overall Monthly Budget',
      spent,
    };
  });

  const exceeded = rows.some(r => r.spent > r.budget.amount);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GradientHeader
        title="Budget"
        subtitle={`${now.toLocaleString('default', { month: 'long' })} ${year}`}
        compact
        showBack={false}
      />
      <View style={styles.content}>
        {overallBudget > 0 ? (
          <BudgetProgressCard
            title="Overall"
            spent={overallSpent}
            budget={overallBudget}
            currency={currency}
          />
        ) : null}

        <FlatList
          data={rows.filter(r => r.budget.categoryId)}
          keyExtractor={item => item.budget.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="chart-arc"
              title="No category budgets"
              subtitle="Set monthly limits to stay on track"
            />
          }
          ListHeaderComponent={
            exceeded ? (
              <Text style={{ color: colors.error, marginBottom: spacing.sm, fontWeight: '600' }}>
                Warning: one or more budgets exceeded
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <BudgetProgressCard
              title={item.title}
              spent={item.spent}
              budget={item.budget.amount}
              currency={currency}
            />
          )}
        />
      </View>
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color="#FFF"
        onPress={() => navigation.navigate('BudgetForm')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing.md },
  fab: { position: 'absolute', right: 20, bottom: 24, borderRadius: 18 },
});
