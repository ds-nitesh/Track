import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {authApi, firestoreApi} from '@/firebase';
import {UserProfile} from '@/types';
import {preferenceStorage} from '@/utils/storage';

interface AuthState {
  user: UserProfile | null;
  firebaseUid: string | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  firebaseUid: null,
  initializing: true,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const formatAuthError = (error: any): string => {
  if (!error) {
    return 'An unknown error occurred';
  }
  const code = String(error.code ?? '');
  const message = String(error.message ?? error);

  if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
    return 'This email is already registered. Please log in instead.';
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password' ||
    message.includes('invalid-credential') ||
    message.includes('user-not-found') ||
    message.includes('wrong-password')
  ) {
    return 'Invalid email or password. Please verify your details.';
  }
  if (code === 'auth/invalid-email' || message.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/too-many-requests' || message.includes('too-many-requests')) {
    return 'Too many attempts. Access is temporarily disabled. Try again later.';
  }
  if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
    return 'Network request failed. Please check your internet connection.';
  }
  if (code === 'auth/weak-password' || message.includes('weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }

  if (typeof error.message === 'string') {
    return error.message.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/.*\)\.?$/, '');
  }
  return String(error);
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    payload: {name: string; email: string; password: string},
    {rejectWithValue},
  ) => {
    try {
      const cred = await authApi.register(payload.email, payload.password);
      try {
        await authApi.updateDisplayName(cred.user, payload.name);
      } catch (e) {
        console.warn('[Track] Failed to update display name', e);
      }
      const profile: UserProfile = {
        uid: cred.user.uid,
        name: payload.name,
        email: payload.email,
        currency: 'INR',
        photo: null,
        createdAt: new Date().toISOString(),
      };
      try {
        await firestoreApi.createUserProfile(profile);
        await firestoreApi.seedDefaultCategories(cred.user.uid);
      } catch (e) {
        console.warn('[Track] Firestore registration sync warning', e);
      }
      return profile;
    } catch (error: any) {
      return rejectWithValue(formatAuthError(error));
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    payload: {email: string; password: string; rememberMe: boolean},
    {rejectWithValue},
  ) => {
    try {
      preferenceStorage.setRememberMe(payload.rememberMe);
      if (payload.rememberMe) {
        preferenceStorage.setRememberedEmail(payload.email);
      } else {
        preferenceStorage.clearRememberedEmail();
      }
      const cred = await authApi.login(payload.email, payload.password);
      let profile: UserProfile | null = null;
      try {
        profile = await firestoreApi.getUserProfile(cred.user.uid);
      } catch (e) {
        console.warn('[Track] Failed to fetch profile on login', e);
      }
      if (!profile) {
        profile = {
          uid: cred.user.uid,
          name: cred.user.displayName ?? 'User',
          email: cred.user.email ?? payload.email,
          currency: 'INR',
          photo: cred.user.photoURL,
          createdAt: new Date().toISOString(),
        };
        try {
          await firestoreApi.createUserProfile(profile);
          await firestoreApi.seedDefaultCategories(cred.user.uid);
        } catch (e) {
          console.warn('[Track] Failed to create profile or seed categories on login', e);
        }
      }
      return profile;
    } catch (error: any) {
      return rejectWithValue(formatAuthError(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, {rejectWithValue}) => {
    try {
      await authApi.resetPassword(email);
      return true;
    } catch (error: any) {
      return rejectWithValue(formatAuthError(error));
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setInitializing(state, action: PayloadAction<boolean>) {
      state.initializing = action.payload;
    },
    setAuthUser(state, action: PayloadAction<UserProfile | null>) {
      state.user = action.payload;
      state.firebaseUid = action.payload?.uid ?? null;
      state.isAuthenticated = !!action.payload;
      state.initializing = false;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    const pending = (state: AuthState) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state: AuthState, action: any) => {
      state.loading = false;
      state.error = action.payload ?? 'Something went wrong';
    };

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.firebaseUid = action.payload.uid;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, rejected)
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.firebaseUid = action.payload.uid;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, rejected)
      .addCase(resetPassword.pending, pending)
      .addCase(resetPassword.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, rejected)
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.firebaseUid = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const {setInitializing, setAuthUser, clearAuthError} = authSlice.actions;
export default authSlice.reducer;
