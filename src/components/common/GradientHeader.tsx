import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useAppTheme} from '@/hooks/useAppTheme';
import {spacing, typography} from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  compact?: boolean;
  showBack?: boolean;
  onBack?: () => void;
};

export const GradientHeader: React.FC<Props> = ({
  title,
  subtitle,
  right,
  children,
  compact = false,
  showBack,
  onBack,
}) => {
  const {colors} = useAppTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const displayBack = showBack !== undefined ? showBack : navigation.canGoBack();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[
        styles.header,
        {paddingTop: insets.top + spacing.md, paddingBottom: compact ? spacing.md : spacing.lg},
      ]}>
      <View style={styles.row}>
        {displayBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
        ) : null}
        <View style={{flex: 1}}>
          <Text style={[typography.h2, {color: '#FFFFFF'}]}>{title}</Text>
          {subtitle ? (
            <Text style={{color: 'rgba(255,255,255,0.85)', marginTop: 4}}>{subtitle}</Text>
          ) : null}
        </View>
        {right}
      </View>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: spacing.sm,
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
