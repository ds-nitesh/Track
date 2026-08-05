import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Category, Transaction} from '@/types';
import {useAppTheme} from '@/hooks/useAppTheme';
import {formatCurrency, formatShortDate} from '@/utils/format';
import {spacing} from '@/theme';

type Props = {
  transaction: Transaction;
  category?: Category;
  currency: string;
  onPress?: () => void;
  onLongPress?: () => void;
};

export const TransactionItem: React.FC<Props> = ({
  transaction,
  category,
  currency,
  onPress,
  onLongPress,
}) => {
  const {colors} = useAppTheme();
  const isIncome = transaction.type === 'income';
  const accent = isIncome ? colors.income : colors.expense;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({pressed}) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View
        style={[
          styles.icon,
          {backgroundColor: `${category?.color ?? accent}22`},
        ]}>
        <Icon
          name={category?.icon ?? (isIncome ? 'arrow-down' : 'arrow-up')}
          size={22}
          color={category?.color ?? accent}
        />
      </View>
      <View style={styles.meta}>
        <Text style={{color: colors.text, fontWeight: '600'}} numberOfLines={1}>
          {transaction.description || category?.name || 'Transaction'}
        </Text>
        <Text style={{color: colors.textSecondary, marginTop: 2}}>
          {category?.name ?? 'Uncategorized'} · {formatShortDate(transaction.date)}
        </Text>
      </View>
      <Text style={{color: accent, fontWeight: '700'}}>
        {formatCurrency(transaction.amount, currency, {
          showSign: true,
          type: transaction.type,
        })}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
});
