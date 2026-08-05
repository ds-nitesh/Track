import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {BarChart, LineChart, PieChart} from 'react-native-chart-kit';
import {useAppTheme} from '@/hooks/useAppTheme';
import {CategorySpend, ChartPoint} from '@/types';
import {AppCard} from '../common/AppCard';
import {spacing} from '@/theme';

const width = Dimensions.get('window').width - spacing.md * 4;

export const IncomeExpenseChart: React.FC<{data: ChartPoint[]}> = ({data}) => {
  const {colors, isDark} = useAppTheme();
  if (!data.length) {
    return null;
  }

  return (
    <AppCard>
      <Text style={{color: colors.text, fontWeight: '700', marginBottom: spacing.sm}}>
        Income vs Expense
      </Text>
      <BarChart
        data={{
          labels: data.map(d => d.label),
          datasets: [
            {data: data.map(d => d.income || 0)},
            {data: data.map(d => d.expense || 0)},
          ],
        }}
        width={width}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          color: (opacity = 1) =>
            isDark ? `rgba(45, 212, 191, ${opacity})` : `rgba(15, 118, 110, ${opacity})`,
          labelColor: () => colors.textSecondary,
          barPercentage: 0.45,
          decimalPlaces: 0,
        }}
        style={styles.chart}
        showValuesOnTopOfBars={false}
        fromZero
      />
    </AppCard>
  );
};

export const SavingsTrendChart: React.FC<{data: ChartPoint[]}> = ({data}) => {
  const {colors, isDark} = useAppTheme();
  if (!data.length) {
    return null;
  }

  return (
    <AppCard style={{marginTop: spacing.md}}>
      <Text style={{color: colors.text, fontWeight: '700', marginBottom: spacing.sm}}>
        Savings Trend
      </Text>
      <LineChart
        data={{
          labels: data.map(d => d.label),
          datasets: [{data: data.map(d => d.savings || 0)}],
        }}
        width={width}
        height={200}
        chartConfig={{
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          color: (opacity = 1) =>
            isDark ? `rgba(56, 189, 248, ${opacity})` : `rgba(14, 165, 233, ${opacity})`,
          labelColor: () => colors.textSecondary,
          decimalPlaces: 0,
          propsForDots: {r: '4'},
        }}
        bezier
        style={styles.chart}
      />
    </AppCard>
  );
};

export const CategoryPieChart: React.FC<{data: CategorySpend[]}> = ({data}) => {
  const {colors} = useAppTheme();
  if (!data.length) {
    return (
      <AppCard>
        <Text style={{color: colors.textSecondary}}>No expense data for this period.</Text>
      </AppCard>
    );
  }

  const pieData = data.slice(0, 6).map(item => ({
    name: item.name,
    amount: item.amount,
    color: item.color,
    legendFontColor: colors.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <AppCard style={{marginTop: spacing.md}}>
      <Text style={{color: colors.text, fontWeight: '700', marginBottom: spacing.sm}}>
        Expense by Category
      </Text>
      <PieChart
        data={pieData}
        width={width}
        height={200}
        chartConfig={{
          color: () => colors.primary,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="12"
        absolute
      />
    </AppCard>
  );
};

export const SpendingBarChart: React.FC<{
  data: {label: string; value: number}[];
  title?: string;
}> = ({data, title = 'Monthly Spending'}) => {
  const {colors, isDark} = useAppTheme();
  if (!data.length) {
    return null;
  }

  return (
    <AppCard style={{marginTop: spacing.md}}>
      <Text style={{color: colors.text, fontWeight: '700', marginBottom: spacing.sm}}>
        {title}
      </Text>
      <BarChart
        data={{
          labels: data.map(d => d.label),
          datasets: [{data: data.map(d => d.value || 0)}],
        }}
        width={width}
        height={200}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          color: (opacity = 1) =>
            isDark ? `rgba(248, 113, 113, ${opacity})` : `rgba(220, 38, 38, ${opacity})`,
          labelColor: () => colors.textSecondary,
          decimalPlaces: 0,
        }}
        style={styles.chart}
        fromZero
      />
    </AppCard>
  );
};

const styles = StyleSheet.create({
  chart: {
    borderRadius: 16,
    marginLeft: -spacing.sm,
  },
});
