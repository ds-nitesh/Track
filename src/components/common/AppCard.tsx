import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {useAppTheme} from '@/hooks/useAppTheme';
import {shadows, spacing} from '@/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  glass?: boolean;
  padding?: number;
};

export const AppCard: React.FC<Props> = ({
  children,
  style,
  glass = false,
  padding = spacing.md,
}) => {
  const {colors} = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        shadows.card,
        {
          backgroundColor: glass ? colors.glass : colors.card,
          borderColor: colors.border,
          padding,
        },
        style,
      ]}>
      {children}
    </View>
  );
};

export const SectionHeader: React.FC<{
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({title, actionLabel, onAction}) => {
  const {colors} = useAppTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text variant="titleMedium" style={{color: colors.text, fontWeight: '700'}}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Text
          onPress={onAction}
          style={{color: colors.primary, fontWeight: '600'}}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
});
