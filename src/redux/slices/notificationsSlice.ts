import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {NotificationPayload} from '@/firebase/notification';

interface NotificationsState {
  permissionGranted: boolean;
  lastNotification: NotificationPayload | null;
  unreadCount: number;
}

const initialState: NotificationsState = {
  permissionGranted: false,
  lastNotification: null,
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setPermissionGranted(state, action: PayloadAction<boolean>) {
      state.permissionGranted = action.payload;
    },
    pushNotification(state, action: PayloadAction<NotificationPayload>) {
      state.lastNotification = action.payload;
      state.unreadCount += 1;
    },
    clearUnread(state) {
      state.unreadCount = 0;
    },
  },
});

export const {setPermissionGranted, pushNotification, clearUnread} =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
