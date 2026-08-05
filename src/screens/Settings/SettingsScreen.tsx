import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Switch, Text } from 'react-native-paper';
import { GradientHeader, PrimaryButton } from '@/components';
import { CURRENCIES, LANGUAGES } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logoutUser } from '@/redux/slices/authSlice';
import { setTheme, updateSettings } from '@/redux/slices/settingsSlice';
import { updateProfile } from '@/redux/slices/profileSlice';
import { authApi } from '@/firebase';
import { ThemeMode } from '@/types';
import { toast } from '@/services/toast';
import { spacing } from '@/theme';

export const SettingsScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(s => s.settings);
  const profile = useAppSelector(s => s.profile.data);
  const authState = useAppSelector(s => s.auth);
  const uid = authState.firebaseUid || authState.user?.uid || authApi.currentUser()?.uid;
  const activeCurrency = profile?.currency ?? settings.currency ?? 'INR';

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(settings.theme);
    const next = order[(idx + 1) % order.length]!;
    dispatch(setTheme(next));
    toast.info(`Theme: ${next}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GradientHeader title="Settings" subtitle="Preferences & notifications" compact showBack={true} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Dark Mode"
            description={`Current: ${settings.theme}${isDark ? ' (dark active)' : ' (light active)'}`}
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            onPress={cycleTheme}
            right={() => (
              <Switch
                value={isDark}
                onValueChange={v => {
                  dispatch(setTheme(v ? 'dark' : 'light'));
                }}
              />
            )}
            style={[styles.item, { backgroundColor: colors.card }]}
          />

          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Push Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={v => {
                  dispatch(updateSettings({ notificationsEnabled: v }));
                }}
              />
            )}
            style={[styles.item, { backgroundColor: colors.card }]}
          />
          <List.Item
            title="Daily Reminder"
            left={props => <List.Icon {...props} icon="calendar-today" />}
            right={() => (
              <Switch
                value={settings.dailyReminder}
                onValueChange={v => {
                  dispatch(updateSettings({ dailyReminder: v }));
                }}
              />
            )}
            style={[styles.item, { backgroundColor: colors.card }]}
          />
          <List.Item
            title="Budget Alerts"
            left={props => <List.Icon {...props} icon="alert" />}
            right={() => (
              <Switch
                value={settings.budgetAlerts}
                onValueChange={v => {
                  dispatch(updateSettings({ budgetAlerts: v }));
                }}
              />
            )}
            style={[styles.item, { backgroundColor: colors.card }]}
          />
          <List.Item
            title="Monthly Reminder"
            left={props => <List.Icon {...props} icon="calendar-month" />}
            right={() => (
              <Switch
                value={settings.monthlyReminder}
                onValueChange={v => {
                  dispatch(updateSettings({ monthlyReminder: v }));
                }}
              />
            )}
            style={[styles.item, { backgroundColor: colors.card }]}
          />

          <List.Subheader>Currency</List.Subheader>
          {CURRENCIES.map(c => (
            <List.Item
              key={c.code}
              title={`${c.name} (${c.symbol})`}
              onPress={async () => {
                dispatch(updateSettings({ currency: c.code }));
                if (uid) {
                  await dispatch(
                    updateProfile({
                      uid,
                      existingPhoto: profile?.photo ?? null,
                      values: {
                        name: profile?.name ?? authState.user?.name ?? 'User',
                        currency: c.code,
                        photo: profile?.photo ?? null,
                      },
                    }),
                  );
                }
                toast.success(`Currency set to ${c.code}`);
              }}
              right={() =>
                activeCurrency === c.code ? (
                  <List.Icon icon="check" color={colors.primary} />
                ) : null
              }
              style={[styles.item, { backgroundColor: colors.card }]}
            />
          ))}

          {/* <List.Subheader>Language</List.Subheader> */}
          {/* {LANGUAGES.map(lang => (
            <List.Item
              key={lang.code}
              title={lang.label}
              onPress={() => dispatch(updateSettings({ language: lang.code }))}
              right={() =>
                settings.language === lang.code ? (
                  <List.Icon icon="check" color={colors.primary} />
                ) : null
              }
              style={[styles.item, { backgroundColor: colors.card }]}
            />
          ))} */}
        </List.Section>

        {/* <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
          Language affects labels in a future localization pack; preference is stored now.
        </Text> */}

        <PrimaryButton
          label="Logout"
          mode="outlined"
          onPress={async () => {
            await dispatch(logoutUser());
            toast.info('Logged out');
          }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  item: { borderRadius: 14, marginBottom: 8 },
});
