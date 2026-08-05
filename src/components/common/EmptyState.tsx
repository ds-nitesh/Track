import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppTheme} from '@/hooks/useAppTheme';
import {spacing} from '@/theme';

export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  subtitle?: string;
}> = ({icon = 'inbox-outline', title, subtitle}) => {
  const {colors} = useAppTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, {backgroundColor: colors.surfaceVariant}]}>
        <Icon name={icon} size={36} color={colors.primary} />
      </View>
      <Text variant="titleMedium" style={{color: colors.text, marginTop: spacing.md}}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          variant="bodyMedium"
          style={{color: colors.textSecondary, textAlign: 'center', marginTop: 6}}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

export const LoadingState: React.FC<{label?: string}> = ({label = 'Loading…'}) => {
  const {colors} = useAppTheme();
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{color: colors.textSecondary, marginTop: spacing.md}}>{label}</Text>
    </View>
  );
};

export const SkeletonBlock: React.FC<{height?: number; width?: number | string}> = ({
  height = 16,
  width = '100%',
}) => {
  const {colors} = useAppTheme();
  return (
    <View
      style={{
        height,
        width: width as any,
        borderRadius: 10,
        backgroundColor: colors.skeleton,
        marginBottom: spacing.sm,
      }}
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <View style={{padding: spacing.md}}>
    <SkeletonBlock height={18} width="40%" />
    <SkeletonBlock height={28} width="70%" />
    <SkeletonBlock height={14} width="90%" />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
