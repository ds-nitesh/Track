import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {firestoreApi, storageApi} from '@/firebase';
import {ProfileFormValues, UserProfile} from '@/types';

interface ProfileState {
  data: UserProfile | null;
  saving: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  saving: false,
  error: null,
};

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (
    payload: {uid: string; values: ProfileFormValues; existingPhoto?: string | null},
    {rejectWithValue},
  ) => {
    try {
      let photo = payload.existingPhoto ?? null;
      if (payload.values.photo && payload.values.photo !== payload.existingPhoto) {
        photo = await storageApi.uploadProfilePhoto(payload.uid, payload.values.photo);
      }
      const updates = {
        name: payload.values.name.trim(),
        currency: payload.values.currency,
        photo,
      };
      await firestoreApi.updateUserProfile(payload.uid, updates);
      return updates;
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to update profile');
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<UserProfile | null>) {
      state.data = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updateProfile.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.saving = false;
        if (state.data) {
          state.data = {...state.data, ...action.payload};
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const {setProfile} = profileSlice.actions;
export default profileSlice.reducer;
