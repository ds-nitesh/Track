import {useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {useAppSelector} from '@/redux/hooks';
import {darkColors, darkTheme, lightColors, lightTheme} from '@/theme';

export const useAppTheme = () => {
  const systemScheme = useColorScheme();
  const themeMode = useAppSelector(s => s.settings.theme);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  return {
    isDark,
    paperTheme: isDark ? darkTheme : lightTheme,
    colors: isDark ? darkColors : lightColors,
  };
};
