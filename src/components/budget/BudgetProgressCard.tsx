import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ProgressBar, Text} from 'react-native-paper';
import {useAppTheme} from '@/hooks/useAppTheme';
import {formatCurrency} from '@/utils/format';
import {AppCard} from '../common/AppCard';
import {spacing} from '@/theme';

type Props = {
  title: string;
  spent: number;
  budget: number;
  currency: string;
};

export const BudgetProgressCard: React.FC<Props> = ({
  title,
  spent,
  budget,
  currency,
}) => {
  const {colors} = useAppTheme();
  const progress = budget > 0 ? Math.min(1, spent / budget) : 0;
  const exceeded = spent > budget && budget > 0;
  const remaining = budget - spent;

  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <Text style={{color: colors.text, fontWeight: '700', flex: 1}}>{title}</Text>
        <Text style={{color: exceeded ? colors.error : colors.textSecondary}}>
          {formatCurrency(spent, currency)} / {formatCurrency(budget, currency)}
        </Text>
      </View>
      <ProgressBar
        progress={progress}
        color={exceeded ? colors.error : colors.primary}
        style={[styles.bar, {backgroundColor: colors.surfaceVariant}]}
      />
      <Text
        style={{
          color: exceeded ? colors.error : colors.textSecondary,
          marginTop: spacing.sm,
        }}>
        {exceeded
          ? `Over budget by ${formatCurrency(Math.abs(remaining), currency)}`
          : `${formatCurrency(remaining, currency)} remaining`}
      </Text>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bar: {
    height: 10,
    borderRadius: 8,
  },
});
