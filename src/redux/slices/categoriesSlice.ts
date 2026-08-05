import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {firestoreApi} from '@/firebase';
import {Category, CategoryFormValues} from '@/types';

interface CategoriesState {
  items: Category[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  search: string;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  saving: false,
  error: null,
  search: '',
};

export const saveCategory = createAsyncThunk(
  'categories/save',
  async (
    payload: {uid: string; values: CategoryFormValues; categoryId?: string},
    {rejectWithValue},
  ) => {
    try {
      if (payload.categoryId) {
        await firestoreApi.updateCategory(payload.categoryId, payload.values);
        return {id: payload.categoryId, uid: payload.uid, ...payload.values};
      }
      return await firestoreApi.createCategory({
        uid: payload.uid,
        ...payload.values,
      });
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to save category');
    }
  },
);

export const removeCategory = createAsyncThunk(
  'categories/remove',
  async (id: string, {rejectWithValue}) => {
    try {
      await firestoreApi.deleteCategory(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to delete category');
    }
  },
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<Category[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    setCategoriesLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setCategorySearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(saveCategory.pending, state => {
        state.saving = true;
      })
      .addCase(saveCategory.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) {
          const index = state.items.findIndex(c => c.id === action.payload.id);
          if (index >= 0) {
            state.items[index] = action.payload as Category;
          } else {
            state.items.push(action.payload as Category);
          }
        }
      })
      .addCase(saveCategory.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
      });
  },
});

export const {setCategories, setCategoriesLoading, setCategorySearch} =
  categoriesSlice.actions;
export default categoriesSlice.reducer;
