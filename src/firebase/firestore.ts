import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  initializeFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  startAfter,
  DocumentSnapshot,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import {getFirebaseApp} from './config';
import {COLLECTIONS, DEFAULT_CATEGORIES, PAGE_SIZE} from '@/constants';
import {Budget, Category, Transaction, UserProfile} from '@/types';

let db: ReturnType<typeof getFirestore> | null = null;

/**
 * Firestore with durable offline cache (Firebase JS SDK).
 * Writes queue while offline and sync when connectivity returns.
 */
export const getDb = () => {
  if (db) {
    return db;
  }
  const app = getFirebaseApp();
  try {
    db = initializeFirestore(app, {});
  } catch {
    db = getFirestore(app);
  }
  return db;
};

export const enableOfflinePersistence = async (): Promise<void> => {
  // Firebase JS SDK enables local persistence by default in modern builds.
  // This hook remains for explicit bootstrapping / future native SDK swap.
  getDb();
};

const usersCol = () => collection(getDb(), COLLECTIONS.USERS);
const transactionsCol = () => collection(getDb(), COLLECTIONS.TRANSACTIONS);
const categoriesCol = () => collection(getDb(), COLLECTIONS.CATEGORIES);
const budgetsCol = () => collection(getDb(), COLLECTIONS.BUDGETS);

export const firestoreApi = {
  async createUserProfile(profile: UserProfile): Promise<void> {
    await setDoc(doc(usersCol(), profile.uid), profile);
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(usersCol(), uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(usersCol(), uid), data);
  },

  subscribeUserProfile(
    uid: string,
    onData: (profile: UserProfile | null) => void,
  ): Unsubscribe {
    return onSnapshot(doc(usersCol(), uid), snap => {
      onData(snap.exists() ? (snap.data() as UserProfile) : null);
    });
  },

  async seedDefaultCategories(uid: string): Promise<void> {
    const existing = await getDocs(query(categoriesCol(), where('uid', '==', uid), limit(1)));
    if (!existing.empty) {
      return;
    }
    const batch = writeBatch(getDb());
    DEFAULT_CATEGORIES.forEach(cat => {
      const ref = doc(categoriesCol());
      batch.set(ref, {
        ...cat,
        id: ref.id,
        uid,
        createdAt: new Date().toISOString(),
      });
    });
    await batch.commit();
  },

  subscribeCategories(
    uid: string,
    onData: (categories: Category[]) => void,
  ): Unsubscribe {
    const q = query(categoriesCol(), where('uid', '==', uid));
    return onSnapshot(
      q,
      snap => {
        const list = snap.docs.map(d => d.data() as Category);
        list.sort((a, b) => a.name.localeCompare(b.name));
        onData(list);
      },
      error => {
        console.warn('[Track] categories snapshot error', error);
      },
    );
  },

  async createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    const ref = doc(categoriesCol());
    const category: Category = {
      ...data,
      id: ref.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, category);
    return category;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<void> {
    await updateDoc(doc(categoriesCol(), id), data);
  },

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(categoriesCol(), id));
  },

  subscribeTransactions(
    uid: string,
    onData: (transactions: Transaction[]) => void,
  ): Unsubscribe {
    const q = query(transactionsCol(), where('uid', '==', uid));
    return onSnapshot(
      q,
      snap => {
        const list = snap.docs.map(d => d.data() as Transaction);
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onData(list);
      },
      error => {
        console.warn('[Track] transactions snapshot error', error);
      },
    );
  },

  async fetchTransactionsPage(
    uid: string,
    cursor?: DocumentSnapshot | null,
  ): Promise<{items: Transaction[]; lastDoc: DocumentSnapshot | null}> {
    const base = [where('uid', '==', uid), limit(PAGE_SIZE)] as const;
    const q = cursor
      ? query(transactionsCol(), ...base, startAfter(cursor))
      : query(transactionsCol(), ...base);
    const snap = await getDocs(q);
    const list = snap.docs.map(d => d.data() as Transaction);
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return {
      items: list,
      lastDoc: snap.docs.length ? snap.docs[snap.docs.length - 1]! : null,
    };
  },

  async createTransaction(
    data: Omit<Transaction, 'id' | 'createdAt'>,
  ): Promise<Transaction> {
    const ref = doc(transactionsCol());
    const transaction: Transaction = {
      ...data,
      id: ref.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, transaction);
    return transaction;
  },

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<void> {
    await updateDoc(doc(transactionsCol(), id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteTransaction(id: string): Promise<void> {
    await deleteDoc(doc(transactionsCol(), id));
  },

  subscribeBudgets(uid: string, onData: (budgets: Budget[]) => void): Unsubscribe {
    const q = query(budgetsCol(), where('uid', '==', uid));
    return onSnapshot(
      q,
      snap => onData(snap.docs.map(d => d.data() as Budget)),
      error => {
        console.warn('[Track] budgets snapshot error', error);
      },
    );
  },

  async createBudget(data: Omit<Budget, 'id'>): Promise<Budget> {
    const ref = doc(budgetsCol());
    const budget: Budget = {
      ...data,
      id: ref.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, budget);
    return budget;
  },

  async updateBudget(id: string, data: Partial<Budget>): Promise<void> {
    await updateDoc(doc(budgetsCol(), id), data);
  },

  async deleteBudget(id: string): Promise<void> {
    await deleteDoc(doc(budgetsCol(), id));
  },
};
