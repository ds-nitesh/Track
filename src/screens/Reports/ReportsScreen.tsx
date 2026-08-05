import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {SegmentedButtons, Text} from 'react-native-paper';
import {
  CategoryPieChart,
  GradientHeader,
  IncomeExpenseChart,
  PrimaryButton,
  SavingsTrendChart,
  SpendingBarChart,
  StatCard,
} from '@/components';
import {useAnalytics} from '@/hooks/useAnalytics';
import {useAppTheme} from '@/hooks/useAppTheme';
import {useAppSelector} from '@/redux/hooks';
import {exportSummary} from '@/services/exportService';
import {ReportPeriod} from '@/types';
import {toast} from '@/services/toast';
import {spacing} from '@/theme';

export const ReportsScreen: React.FC = () => {
  const {colors} = useAppTheme();
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const analytics = useAnalytics(period);
  const currency = useAppSelector(s => s.profile.data?.currency ?? s.settings.currency);
  const transactions = useAppSelector(s => s.transactions.items);
  const categories = useAppSelector(s => s.categories.items);

  const periodLabel =
    period === 'daily'
      ? 'Daily'
      : period === 'weekly'
        ? 'Weekly'
        : period === 'yearly'
          ? 'Yearly'
          : 'Monthly';

  const onExport = async () => {
    try {
      await exportSummary({
        periodLabel,
        income: analytics.income,
        expense: analytics.expense,
        savings: analytics.savings,
        currency,
        transactions,
        categories,
      });
      toast.success('Summary ready to share');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <GradientHeader title="Reports" subtitle="Insights across time" compact showBack={false} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <SegmentedButtons
          value={period}
          onValueChange={v => setPeriod(v as ReportPeriod)}
          buttons={[
            {value: 'daily', label: 'Day'},
            {value: 'weekly', label: 'Week'},
            {value: 'monthly', label: 'Month'},
            {value: 'yearly', label: 'Year'},
          ]}
          style={{marginBottom: spacing.md}}
        />

        <View style={styles.statsGrid}>
          <StatCard
            label="Income"
            amount={analytics.income}
            currency={currency}
            icon="arrow-down"
            tone="income"
          />
          <StatCard
            label="Expense"
            amount={analytics.expense}
            currency={currency}
            icon="arrow-up"
            tone="expense"
          />
        </View>
        <View style={[styles.statsGrid, {marginTop: spacing.sm}]}>
          <StatCard
            label="Savings"
            amount={analytics.savings}
            currency={currency}
            icon="piggy-bank"
          />
          <StatCard
            label="Net flow"
            amount={analytics.income - analytics.expense}
            currency={currency}
            icon="swap-horizontal"
          />
        </View>

        <Text style={{color: colors.textSecondary, marginVertical: spacing.sm}}>
          Showing {analytics.count} transactions for this {periodLabel.toLowerCase()} period
        </Text>

        <IncomeExpenseChart data={analytics.monthlyTrend} />
        <SpendingBarChart data={analytics.dailySpend} title={`${periodLabel} Spending`} />
        <CategoryPieChart data={analytics.expenseByCategory} />
        <SavingsTrendChart data={analytics.monthlyTrend} />

        <PrimaryButton label="Export Summary" onPress={onExport} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {padding: spacing.md, paddingBottom: spacing.xxl},
  statsGrid: {flexDirection: 'row', gap: spacing.sm},
});
