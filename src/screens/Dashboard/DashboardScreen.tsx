import React, { useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { FAB, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BudgetProgressCard,
  CategoryPieChart,
  EmptyState,
  GradientHeader,
  IncomeExpenseChart,
  SectionHeader,
  SkeletonCard,
  StatCard,
  TransactionItem,
} from '@/components';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCategoryMap, useDashboardStats } from '@/hooks/useAppBootstrap';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setTransactionsRefreshing } from '@/redux/slices/transactionsSlice';
import { DashboardStackParamList } from '@/types';
import { formatCurrency } from '@/utils/format';
import { spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const stats = useDashboardStats();
  const analytics = useAnalytics('monthly');
  const categoryMap = useCategoryMap();
  const loading = useAppSelector(s => s.transactions.loading);
  const refreshing = useAppSelector(s => s.transactions.refreshing);
  const profile = useAppSelector(s => s.profile.data);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GradientHeader
        title={`${greeting}${profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}`}
        subtitle="Here’s your financial overview"
        showBack={false}
        right={
          <Pressable
            onPress={() => navigation.navigate('Categories')}
            style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Icon name="shape-outline" size={22} color="#FFF" />
          </Pressable>
        }>
        <View style={styles.balanceCard}>
          <Text style={{ color: 'rgba(255,255,255,0.85)' }}>Current Balance</Text>
          <Text style={[typography.hero, { color: '#FFF', marginTop: 4 }]}>
            {formatCurrency(stats.balance, stats.currency)}
          </Text>
        </View>
      </GradientHeader>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              dispatch(setTransactionsRefreshing(true));
              setTimeout(() => dispatch(setTransactionsRefreshing(false)), 600);
            }}
            tintColor={colors.primary}
          />
        }>
        {loading && !stats.recent.length ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard
                label="Monthly Income"
                amount={stats.monthlyIncome}
                currency={stats.currency}
                icon="arrow-down-bold"
                tone="income"
              />
              <StatCard
                label="Monthly Expense"
                amount={stats.monthlyExpense}
                currency={stats.currency}
                icon="arrow-up-bold"
                tone="expense"
              />
            </View>
            <View style={[styles.statsGrid, { marginTop: spacing.sm }]}>
              <StatCard
                label="Savings"
                amount={stats.savings}
                currency={stats.currency}
                icon="piggy-bank"
              />
              <StatCard
                label="Remaining Budget"
                amount={stats.remainingBudget}
                currency={stats.currency}
                icon="wallet"
                tone={stats.remainingBudget < 0 ? 'warning' : 'default'}
              />
            </View>

            <SectionHeader title="Quick Actions" />
            <View style={styles.actions}>
              {[
                {
                  label: 'Add',
                  icon: 'plus',
                  onPress: () => navigation.navigate('AddTransaction'),
                },
                {
                  label: 'Categories',
                  icon: 'shape',
                  onPress: () => navigation.navigate('Categories'),
                },
                {
                  label: 'Income',
                  icon: 'cash-plus',
                  onPress: () => navigation.navigate('AddTransaction'),
                },
                {
                  label: 'Expense',
                  icon: 'cash-minus',
                  onPress: () => navigation.navigate('AddTransaction'),
                },
              ].map(action => (
                <Pressable
                  key={action.label}
                  onPress={action.onPress}
                  style={[styles.action, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Icon name={action.icon} size={22} color={colors.primary} />
                  <Text style={{ color: colors.text, marginTop: 6, fontSize: 12 }}>
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {stats.monthlyBudget > 0 ? (
              <>
                <SectionHeader title="Budget Progress" />
                <BudgetProgressCard
                  title="Monthly Budget"
                  spent={stats.monthlyExpense}
                  budget={stats.monthlyBudget}
                  currency={stats.currency}
                />
              </>
            ) : null}

            <SectionHeader title="Charts" />
            <IncomeExpenseChart data={analytics.monthlyTrend} />
            <View style={{ height: spacing.md }} />
            <CategoryPieChart data={analytics.expenseByCategory} />

            <SectionHeader
              title="Recent Transactions"
              actionLabel="See all"
              onAction={() => navigation.getParent()?.navigate('TransactionsTab')}
            />
            {stats.recent.length === 0 ? (
              <EmptyState
                icon="swap-horizontal"
                title="No transactions yet"
                subtitle="Tap + to add your first income or expense"
              />
            ) : (
              stats.recent.map(tx => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  category={categoryMap.get(tx.categoryId)}
                  currency={stats.currency}
                  onPress={() =>
                    navigation.navigate('AddTransaction', { transactionId: tx.id })
                  }
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color="#FFF"
        onPress={() => navigation.navigate('AddTransaction')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: 100 },
  balanceCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statsGrid: { flexDirection: 'row', gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: { position: 'absolute', right: 20, bottom: 24, borderRadius: 18 },
});
