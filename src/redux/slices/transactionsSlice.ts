import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {firestoreApi, storageApi} from '@/firebase';
import {Transaction, TransactionFilters, TransactionFormValues} from '@/types';
import {toISODate} from '@/utils/format';

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  filters: TransactionFilters;
  saving: boolean;
}

const initialFilters: TransactionFilters = {
  search: '',
  type: 'all',
  categoryId: null,
  paymentMethod: null,
  datePreset: 'all',
  startDate: null,
  endDate: null,
  sortBy: 'date',
  sortOrder: 'desc',
};

const initialState: TransactionsState = {
  items: [],
  loading: false,
  refreshing: false,
  error: null,
  filters: initialFilters,
  saving: false,
};

export const saveTransaction = createAsyncThunk(
  'transactions/save',
  async (
    payload: {
      uid: string;
      values: TransactionFormValues;
      transactionId?: string;
      existingReceipt?: string | null;
    },
    {rejectWithValue},
  ) => {
    try {
      let receiptImage = payload.existingReceipt ?? null;
      if (
        payload.values.receiptImage &&
        payload.values.receiptImage !== payload.existingReceipt
      ) {
        receiptImage = await storageApi.uploadReceipt(
          payload.uid,
          payload.values.receiptImage,
        );
      }

      const base = {
        uid: payload.uid,
        amount: Number(payload.values.amount),
        type: payload.values.type,
        categoryId: payload.values.categoryId,
        paymentMethod: payload.values.paymentMethod,
        description: payload.values.description.trim(),
        receiptImage,
        date: toISODate(payload.values.date),
      };

      if (payload.transactionId) {
        await firestoreApi.updateTransaction(payload.transactionId, base);
        return {id: payload.transactionId, ...base} as Transaction;
      }

      return await firestoreApi.createTransaction(base);
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to save transaction');
    }
  },
);

export const removeTransaction = createAsyncThunk(
  'transactions/remove',
  async (id: string, {rejectWithValue}) => {
    try {
      await firestoreApi.deleteTransaction(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message ?? 'Failed to delete transaction');
    }
  },
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.items = action.payload;
      state.loading = false;
      state.refreshing = false;
    },
    setTransactionsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setTransactionsRefreshing(state, action: PayloadAction<boolean>) {
      state.refreshing = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<TransactionFilters>>) {
      state.filters = {...state.filters, ...action.payload};
    },
    resetFilters(state) {
      state.filters = initialFilters;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(saveTransaction.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveTransaction.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) {
          const index = state.items.findIndex(t => t.id === action.payload.id);
          if (index >= 0) {
            state.items[index] = action.payload as Transaction;
          } else {
            state.items.unshift(action.payload as Transaction);
          }
        }
      })
      .addCase(saveTransaction.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) ?? 'Save failed';
      })
      .addCase(removeTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload);
      });
  },
});

export const {
  setTransactions,
  setTransactionsLoading,
  setTransactionsRefreshing,
  setFilters,
  resetFilters,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
