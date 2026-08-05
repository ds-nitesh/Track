import {createMMKV} from 'react-native-mmkv';
import {MMKV_KEYS} from '@/constants';
import {AppSettings, ThemeMode} from '@/types';

export const storage = createMMKV({id: 'track-preferences'});

export const defaultSettings: AppSettings = {
  theme: 'system',
  notificationsEnabled: true,
  currency: 'INR',
  language: 'en',
  rememberMe: false,
  dailyReminder: true,
  budgetAlerts: true,
  monthlyReminder: true,
};

export const preferenceStorage = {
  getRememberMe(): boolean {
    return storage.getBoolean(MMKV_KEYS.REMEMBER_ME) ?? false;
  },

  setRememberMe(value: boolean) {
    storage.set(MMKV_KEYS.REMEMBER_ME, value);
  },

  getRememberedEmail(): string {
    return storage.getString(MMKV_KEYS.REMEMBERED_EMAIL) ?? '';
  },

  setRememberedEmail(email: string) {
    storage.set(MMKV_KEYS.REMEMBERED_EMAIL, email);
  },

  clearRememberedEmail() {
    storage.remove(MMKV_KEYS.REMEMBERED_EMAIL);
  },

  getTheme(): ThemeMode {
    return (storage.getString(MMKV_KEYS.THEME) as ThemeMode) ?? 'system';
  },

  setTheme(theme: ThemeMode) {
    storage.set(MMKV_KEYS.THEME, theme);
  },

  getSettings(): AppSettings {
    const raw = storage.getString(MMKV_KEYS.SETTINGS);
    if (!raw) {
      return defaultSettings;
    }
    try {
      return {...defaultSettings, ...JSON.parse(raw)};
    } catch {
      return defaultSettings;
    }
  },

  setSettings(settings: AppSettings) {
    storage.set(MMKV_KEYS.SETTINGS, JSON.stringify(settings));
  },
};
