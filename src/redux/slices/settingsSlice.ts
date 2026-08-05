import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppSettings, ThemeMode} from '@/types';
import {defaultSettings, preferenceStorage} from '@/utils/storage';

interface SettingsState extends AppSettings {}

const initialState: SettingsState = preferenceStorage.getSettings();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings(state, action: PayloadAction<Partial<AppSettings>>) {
      Object.assign(state, action.payload);
      preferenceStorage.setSettings({...state});
      if (action.payload.theme) {
        preferenceStorage.setTheme(action.payload.theme);
      }
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      preferenceStorage.setTheme(action.payload);
      preferenceStorage.setSettings({...state});
    },
  },
});

export const {updateSettings, setTheme} = settingsSlice.actions;
export default settingsSlice.reducer;
