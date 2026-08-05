import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {firestoreApi} from '@/firebase';
import {Budget, BudgetFormValues} from '@/types';

interface BudgetsState {
  items: Budget[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  items: [],
  loading: false,
  saving: false,
  error: null,
};

export const saveBudget = createAsyncThunk(
  'budgets/save',
  async (
    payload: {uid: string; values: BudgetFormValues; budgetId?: string},
    {rejectWithValue},
  ) => {
    try {
      const data = {
        uid: payload.uid,
        categoryId: payload.values.categoryId,
        amount: Number(payload.values.amount),
        month: payload.values.month,
        year: payload.values.year,
      };
      if (payload.budgetId) {
        await firestoreApi.updateBudget(payload.budgetId, data);
        return {id: payload.budgetId, ...data} as Budget;
      }
      return await firestoreApi.createBudget(data);
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to save budget');
    }
  },
);

export const removeBudget = createAsyncThunk(
  'budgets/remove',
  async (id: string, {rejectWithValue}) => {
    try {
      await firestoreApi.deleteBudget(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to delete budget');
    }
  },
);

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setBudgets(state, action: PayloadAction<Budget[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    setBudgetsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(saveBudget.pending, state => {
        state.saving = true;
      })
      .addCase(saveBudget.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) {
          const index = state.items.findIndex(b => b.id === action.payload.id);
          if (index >= 0) {
            state.items[index] = action.payload as Budget;
          } else {
            state.items.push(action.payload as Budget);
          }
        }
      })
      .addCase(saveBudget.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(removeBudget.fulfilled, (state, action) => {
        state.items = state.items.filter(b => b.id !== action.payload);
      });
  },
});

export const {setBudgets, setBudgetsLoading} = budgetsSlice.actions;
export default budgetsSlice.reducer;
