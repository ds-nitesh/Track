import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppTheme} from '@/hooks/useAppTheme';
import {formatCurrency} from '@/utils/format';
import {AppCard} from './AppCard';
import {spacing} from '@/theme';

type Props = {
  label: string;
  amount: number;
  currency: string;
  icon: string;
  tone?: 'default' | 'income' | 'expense' | 'warning';
};

export const StatCard: React.FC<Props> = ({
  label,
  amount,
  currency,
  icon,
  tone = 'default',
}) => {
  const {colors} = useAppTheme();
  const accent =
    tone === 'income'
      ? colors.income
      : tone === 'expense'
        ? colors.expense
        : tone === 'warning'
          ? colors.warning
          : colors.primary;

  return (
    <AppCard style={styles.card} padding={spacing.md}>
      <View style={[styles.icon, {backgroundColor: `${accent}22`}]}>
        <Icon name={icon} size={20} color={accent} />
      </View>
      <Text style={{color: colors.textSecondary, marginTop: spacing.sm}}>{label}</Text>
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: '700',
          marginTop: 4,
        }}
        numberOfLines={1}>
        {formatCurrency(amount, currency)}
      </Text>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
