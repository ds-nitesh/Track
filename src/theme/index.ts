import {MD3DarkTheme, MD3LightTheme, configureFonts} from 'react-native-paper';

const fontConfig = {
  fontFamily: 'System',
} as const;

export const lightColors = {
  primary: '#0F766E',
  primaryContainer: '#CCFBF1',
  secondary: '#0EA5E9',
  secondaryContainer: '#E0F2FE',
  tertiary: '#7C3AED',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  card: '#FFFFFF',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  income: '#16A34A',
  expense: '#DC2626',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  overlay: 'rgba(15, 23, 42, 0.45)',
  gradientStart: '#0F766E',
  gradientEnd: '#0EA5E9',
  glass: 'rgba(255, 255, 255, 0.72)',
  skeleton: '#E2E8F0',
  shadow: '#0F172A',
};

export const darkColors = {
  primary: '#2DD4BF',
  primaryContainer: '#134E4A',
  secondary: '#38BDF8',
  secondaryContainer: '#0C4A6E',
  tertiary: '#A78BFA',
  background: '#0B1220',
  surface: '#111827',
  surfaceVariant: '#1F2937',
  card: '#111827',
  error: '#F87171',
  success: '#4ADE80',
  warning: '#FBBF24',
  income: '#4ADE80',
  expense: '#F87171',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  overlay: 'rgba(0, 0, 0, 0.55)',
  gradientStart: '#134E4A',
  gradientEnd: '#0C4A6E',
  glass: 'rgba(17, 24, 39, 0.78)',
  skeleton: '#1F2937',
  shadow: '#000000',
};

export type AppColors = typeof lightColors;

export const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    primaryContainer: lightColors.primaryContainer,
    secondary: lightColors.secondary,
    secondaryContainer: lightColors.secondaryContainer,
    tertiary: lightColors.tertiary,
    background: lightColors.background,
    surface: lightColors.surface,
    surfaceVariant: lightColors.surfaceVariant,
    error: lightColors.error,
    onPrimary: '#FFFFFF',
    onBackground: lightColors.text,
    onSurface: lightColors.text,
    outline: lightColors.border,
  },
  custom: lightColors,
  roundness: 16,
};

export const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    primaryContainer: darkColors.primaryContainer,
    secondary: darkColors.secondary,
    secondaryContainer: darkColors.secondaryContainer,
    tertiary: darkColors.tertiary,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceVariant,
    error: darkColors.error,
    onPrimary: '#042F2E',
    onBackground: darkColors.text,
    onSurface: darkColors.text,
    outline: darkColors.border,
  },
  custom: darkColors,
  roundness: 16,
};

export type AppTheme = typeof lightTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  hero: {fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5},
  h1: {fontSize: 28, fontWeight: '700' as const},
  h2: {fontSize: 22, fontWeight: '700' as const},
  h3: {fontSize: 18, fontWeight: '600' as const},
  body: {fontSize: 16, fontWeight: '400' as const},
  bodyBold: {fontSize: 16, fontWeight: '600' as const},
  caption: {fontSize: 13, fontWeight: '400' as const},
  small: {fontSize: 11, fontWeight: '500' as const},
} as const;

export const shadows = {
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;
